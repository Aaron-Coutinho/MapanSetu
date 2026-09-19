### Architectural Blueprint & System Overview

The **National Legal Metrology Verification and Lifecycle Management Platform** is engineered as a **cloud-native, multi-tenant microservices architecture** deployed across geographically redundant Tier-IV data centers. The architecture serves as the structural blueprint connecting statutory legal requirements under the **Legal Metrology Act, 2009** with a concrete engineering implementation. It decouples presentation clients, stateless business microservices, relational data persistence, immutable object storage, and external government API integrations into a fault-tolerant, scalable ecosystem.

---

### Layered System Architecture

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION TIER                                  |
|   Web Admin Portals (SPA)  |  Field Mobile App (Android/iOS)  |  GATC LIMS Portals   |
+-----------------------------------------------------------------------------------+
                                          | TLS 1.3 / OAuth 2.0
                                          v
+-----------------------------------------------------------------------------------+
|                        ENTERPRISE API GATEWAY & SECURITY                          |
|    Rate Limiting  |  SSL Offloading  |  WAF  |  Keycloak (OAuth 2.0 / OIDC)        |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            CORE MICROSERVICES LOGIC TIER                          |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  | IAM & eKYC (Java)|  | Registry (Go)     |  | Workflow & Scheduling (Node)   |  |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  | Dynamic Fee (Py) |  | Field Sync (Java) |  | PKI & Dynamic QR (C++/Python)  |  |
|  +------------------+  +-------------------+  +--------------------------------+  |
|  +----------------------------------------+  +--------------------------------+  |
|  | Notifications (Kafka / Redis Queue)    |  | Analytics (Apache Superset)    |  |
|  +----------------------------------------+  +--------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         PERSISTENCE & INTEGRATION LAYER                           |
| PostgreSQL (Transactional) | MinIO/S3 (Certificates/Photos) | e-GRAS / eMaap APIs   |
+-----------------------------------------------------------------------------------+
```

#### 1. Presentation & Field Mobility Tier

- **Web Admin & Stakeholder Portals**: Delivered as responsive **Single Page Applications (SPAs)** tailored for Commercial Traders, State Legal Metrology Officers (LMOs), Government Approved Test Centres (GATCs), and System Administrators.
- **Offline-First Field Mobile Application**: Cross-platform native mobile applications (Android/iOS) built for field LMOs operating in connectivity-blind environments. The app embeds a local edge storage engine using **SQLite encrypted with AES-256 SQLCipher**. Officers record test readings, compute Maximum Permissible Errors (MPE), and capture geotagged photos of physical seals offline, auto-synchronizing with the cloud core upon network restoration.

#### 2. Security & API Gateway Layer

All client requests terminate at an **Enterprise API Gateway** configured for:

- **TLS 1.3 Encryption** and SSL offloading.
- **Dynamic Rate Limiting** and Cloud Web Application Firewall (WAF) filtering against DDoS, SQL injection, and XSS attacks.
- **OAuth 2.0 / OpenID Connect (OIDC)** token verification powered by Keycloak for role-based access control (RBAC) and multi-tenancy partitioning by jurisdiction (State, Zone, District, Sub-Division).

#### 3. Core Logic Tier (Containerized Microservices on Kubernetes)

The business logic tier comprises containerized microservices managed by a **Kubernetes orchestration engine**:

| Microservice Component             | Primary Operational Responsibility                                                                                             | Technical Stack                  | Data Persistence Layer     |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :------------------------------- | :------------------------- |
| **IAM & Stakeholder Service**      | User onboarding, RBAC, Aadhaar e-KYC, PAN, DigiLocker integration, and session token verification.                             | **Java / Spring Boot, Keycloak** | PostgreSQL (Partitioned)   |
| **Instrument Lifecycle Registry**  | Asset lifecycle tracking, model approval mapping, and generating a unique **16-digit Instrument Identification Number (IIN)**. | **Go (Golang)**                  | PostgreSQL + Redis Cache   |
| **Workflow & Scheduling Engine**   | Task allocation routing to LMOs/GATCs using geographical polygon boundaries, workload balancing, and anti-bias rotation.       | **Node.js / TypeScript**         | PostgreSQL                 |
| **Dynamic Fee Engine**             | Automated computation of Schedule IX fees (\\(T_f = F_b + F_c + P_q\\)), conveyance fees, and late penalties.                  | **Python / FastAPI**             | PostgreSQL                 |
| **Mobile Inspection Service**      | Processing field readings, executing MPE threshold checks, capturing geotagged seal photos, and saving e-signatures.           | **Java / Spring Boot**           | PostgreSQL + SQLite (Edge) |
| **Certificate & PKI Service**      | PDF/A document assembly, SHA-256 dynamic QR code construction, and HSM / C-DAC eSign execution.                                | **C++ / Python, C-DAC eSign**    | MinIO Object Store         |
| **Notification Engine**            | Asynchronous message queues dispatching multi-channel alerts (SMS, WhatsApp, Email) for expiry due dates.                      | **Python, Apache Kafka**         | Redis Queue                |
| **Enforcement & Analytics Module** | Executive MIS dashboards, pendency heatmaps, revenue audit trails, and inspector efficiency telemetry.                         | **Python / Apache Superset**     | PostgreSQL Read Replicas   |

#### 4. Hybrid Data Persistence Tier

The system employs a hybrid database strategy to decouple transactional data from binary assets:

- **Relational Database (PostgreSQL)**: Partitioned by State and District to maintain ACID compliance for user profiles, asset registries, application states, inspection logs, and certificate records.
- **Immutable Object Storage (MinIO / AWS S3)**: Dedicated object store for binary artifacts, including geotagged seal photographs, touchscreen e-signatures, and compiled PDF/A certificates.
- **Event Streaming & Caching**: **Apache Kafka** orchestrates asynchronous event streams (e.g., expiry triggers, audit events), while **Redis** manages high-speed message queues and state caching.

---

### External Interoperability & Integration Gateways

The platform acts as an integration bridge connecting national repositories and state services via standardized gateways:

```
                       +---------------------------------------+
                       |  NATIONAL LM PLATFORM ('eMaap' CORE)  |
                       +---------------------------------------+
                                           ^
                                           | REST APIs (TLS 1.3)
                                           v
+------------------+         +-----------------------+         +-------------------+
|  STATE TREASURY  | <-----> |   ONLINE VERIFICATION | <-----> |   CDAC / HSM      |
| (e-GRAS PORTAL)  |  SOAP/  |   SYSTEM CORE ENGINE  |  REST/  |   eSIGN SERVICE   |
+------------------+  REST   +-----------------------+  PKCS11 +-------------------+
                                           ^
                                           | REST / HTTPS
                                           v
                       +---------------------------------------+
                       |  GATC LABORATORY MANAGEMENT SYSTEMS   |
                       +---------------------------------------+
```

1. **National eMaap Core Gateway**: Uses **HTTPS / REST / JSON** secured by **OAuth 2.0 / Mutual TLS** to push encrypted JSON transaction payloads whenever verification certificates are issued, amended, or revoked.
2. **State e-GRAS Treasury Integration**: Interfaces via **REST / SOAP / XML** using **SHA-256 HMAC signatures**. When an applicant pays, e-GRAS returns a cryptographically signed webhook callback, reconciling payments in **under 5 seconds**.
3. **C-DAC eSign & HSM Engine**: Connects over **REST / PKCS#11** authenticated via **JWT / Hardware Tokens**. The service passes SHA-256 document hashes to Hardware Security Modules (HSMs) to append legally binding PKCS#7 digital signatures under Section 3A of the Information Technology Act, 2000.
4. **GATC LIMS Gateway**: Exposes **REST / HTTPS** endpoints secured with **API Keys and IP Whitelisting** allowing private accredited testing laboratories to ingest allocated test orders and push calibration test data into the national registry.

---

### Essential System Constraints & Security Controls

- **Zero-Trust Architecture**: Mandates multi-factor authentication (MFA) and binds inspector active sessions dynamically to registered mobile hardware IDs.
- **Data Encryption**: Sensitive PII (Aadhaar, PAN, GSTIN) is encrypted at rest using **AES-256 envelope encryption** backed by hardware key management, while all transit communication requires **TLS 1.3**.
- **Attribute-Based Access Control (ABAC)**: Restricts data access strictly according to administrative roles, state codes, and district boundaries.
- **Tamper-Evident Audit Logging**: System actions (fee overrides, rejections, revocations) write to **append-only, immutable audit stores** capturing user IDs, IP addresses, timestamps, and payload diffs.

---
