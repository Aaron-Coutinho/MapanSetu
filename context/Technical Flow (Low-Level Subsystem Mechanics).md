### Technical Flow (Low-Level Subsystem Mechanics)

#### 1. Ingress, Authentication, and Session Provisioning

1. **Client Request Ingress**: Incoming API requests from web Single Page Applications (SPAs) or mobile field applications terminate at the **Enterprise API Gateway** over **TLS 1.3**.
2. **Perimeter Policy Enforcement**: The API Gateway performs SSL offloading, enforces dynamic rate limiting, and passes requests through a Cloud Web Application Firewall (WAF) to block OWASP threats (SQL injection, XSS, DDoS).
3. **Identity & JWT Validation**: Requests are authenticated against **Keycloak** via **OAuth 2.0 / OpenID Connect (OIDC)**. Keycloak verifies Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) policies (State, Zone, District, Sub-Division) before passing valid JWT bearer tokens down to backend microservices.

---

#### 2. Instrument Identification & Dynamic Fee Execution Flow

1. **IIN Query & Master Asset Mapping**: The **Instrument Registry Service** (built with **Go**) queries `lm_instruments` in **PostgreSQL**. For existing instruments, it retrieves historical logs via the unique **16-digit Instrument Identification Number (IIN)**; for new assets, it writes a master record mapping model approval references and serial numbers.
2. **Dynamic Fee Computation Routine**: The **Dynamic Fee Engine** (**Python / FastAPI**) is invoked with instrument parameters (accuracy class, maximum capacity, verification site, lapsed quarters):
   - Evaluates base verification fee \\(F_b\\) against Schedule IX legal rules.
   - Adds conveyance fee \\(F_c\\) if on-site verification is requested.
   - Computes late payment penalty \\(P_q = N_q \times F_b\\) for \\(N_q\\) lapsed calendar quarters.
   - Calculates total fee \\(T_f = F_b + F_c + P_q\\) and commits the calculated breakdown to `lm_applications` in PostgreSQL.

---

#### 3. State Treasury (e-GRAS) Payment Reconciliation Subsystem

1. **Payload Assembly & Treasury Dispatch**: The Gateway constructs a signed **XML/JSON payment initiation payload** containing Head of Account codes, district IDs, fee breakdown, and a unique application reference, transmitting it to the State **e-GRAS portal** via **REST / SOAP**.
2. **Asynchronous Webhook Reconciliation**: Upon successful payment, the e-GRAS portal dispatches an HTTP POST webhook carrying a **SHA-256 HMAC signature** back to the platform.
3. **Transaction State Mutation**: The API Gateway verifies the HMAC signature in **< 5 seconds**, mutates `payment_status` to `'PAID'` in `lm_applications`, logs the transaction reference to an append-only audit trail, and publishes an `'APPLICATION_PAID'` event to **Apache Kafka**.

---

#### 4. Work Allocation & Task Scheduling Execution Routine

1. **Kafka Event Ingestion**: The **Workflow & Scheduling Engine** (**Node.js / TypeScript**) consumes the `'APPLICATION_PAID'` event.
2. **Algorithmic Routing Matrix**:
   - Checks instrument capacity to determine whether routing goes to LMO district pools or accredited GATC laboratories.
   - Executes a **weighted round-robin algorithm** evaluating LMO sub-divisional polygon boundaries, active queues, and leave schedules.
   - Enforces **anti-bias logic** by querying `lm_inspections` history to ensure the same LMO is not assigned to the same commercial entity for > 2 consecutive cycles.
3. **Queue Assignment**: Updates `lm_applications.application_stage` to `'ALLOCATED'` and writes the assigned LMO or GATC UUID to `allocated_entity_id`.

---

#### 5. Offline Mobile Field Testing & Sync Subsystem

1. **Edge Database Persistence**: Field LMOs run a native mobile app (**Java / Spring Boot** backend, **SQLite encrypted with AES-256 SQLCipher** at the edge). In zero-connectivity areas, inspection test readings are stored locally in the encrypted SQLite database.
2. **Geofence & MPE Validation**:
   - Mobile app verifies the officer's real-time GPS location against `lm_instruments.geo_location`.
   - The MPE logic engine checks inputted test weight readings against Maximum Permissible Error thresholds defined in the Seventh and Eighth Schedules.
3. **Proof Capture**: Captures geotagged, timestamped photographs of affixed lead/paper seals and collects touchscreen e-signatures.
4. **Cloud Core Synchronization**: When cellular network connection is detected, a background queue pushes the encrypted payload via HTTPS POST to the **Mobile Inspection Service**. Data is written to `lm_inspections` in PostgreSQL, while binary images are uploaded directly to **MinIO / S3 object storage**.

---

#### 6. Cryptographic PKI Certificate Minting Pipeline

1. **Document Template Assembly**: The **Certificate & PKI Service** (**C++ / Python**) aggregates records from `lm_applications`, `lm_inspections`, and `lm_instruments` to populate a PDF/A certificate template.
2. **SHA-256 Digest & Dynamic QR Generation**:
   - Constructs a JSON payload containing `cert_no`, `iin`, `trader_name`, `instrument`, `capacity`, `serial_no`, `verification_date`, `valid_till`, `lmo_gatc_code`, `seal_no`, and computes a **SHA-256 digest**.
   - Encodes the JSON payload into a high-density dynamic QR code image and embeds it onto the PDF layout.
3. **HSM / C-DAC eSign Cryptographic Signing**:
   - The PDF byte stream is forwarded over **REST / PKCS#11** to a **Hardware Security Module (HSM)** or C-DAC eSign API.
   - Upon OTP/biometric authorization by the Principal Officer, the HSM appends a **PKCS#7 digital signature** to the PDF document.
4. **Ledger Commit**: Writes metadata to `lm_certificates`, stores the signed PDF binary in MinIO object storage, sets `is_valid = TRUE`, and updates instrument status to `'CERTIFIED'`.

---

#### 7. Interoperability & External API Synchronization

1. **National eMaap Core Federation**: The platform packages an encrypted JSON payload of the issued certificate and dispatches an HTTP POST via **Mutual TLS / OAuth 2.0** to sync national records on the central **eMaap portal**.
2. **GATC LIMS Ingest Gateway**: External laboratory software pulls assigned test orders and pushes verified calibration test logs via **REST APIs** authenticated with **API Keys and IP Whitelisting**.
3. **Expiry Notification Queue**: **Apache Kafka** triggers event streams processed by **Redis Queue**, dispatching multi-channel alerts (SMS, WhatsApp, Email) at **60, 30, and 15 days** prior to `expiry_date`.

---
