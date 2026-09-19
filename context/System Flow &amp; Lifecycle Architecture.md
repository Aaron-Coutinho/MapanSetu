### System Flow & Lifecycle Architecture

The system flow defines the sequential movement of data, logic, and user actions across the platform's lifecycle, converting manual paper-based inspections into an automated, audited digital workflow.

---

```
[ 1. Onboarding & Registration ]
Trader (GSTIN/PAN) | LMO (Jurisdiction) | GATC (NABL Scope)
            |
            v
[ 2. Application & Dynamic Fee Calculation ]
Queries Registry (16-digit IIN) -> Computes Tf = Fb + Fc + Pq -> Payment via e-GRAS (< 5s)
            |
            v
[ 3. Automated Task Allocation & Scheduling ]
Weighted Round-Robin Engine -> Evaluates District Boundary & Anti-Bias Rotation Rule
            |
            v
[ 4. Field Inspection & MPE Testing ]
GPS Geofence Validation -> Offline SQLite Test Execution -> Seal Photo & e-Signatures
      |                                       |
      | (Passes MPE)                          | (Fails MPE)
      v                                       v
[ 5. Certificate Minting & Signing ]    [ Rejection Workflow ]
SHA-256 Dynamic QR -> HSM/C-DAC eSign    Rejection Memo Issued -> Out of Service Flag
            |
            v
[ 6. Expiry Monitoring & Enforcement ]
Kafka/Redis Reminders (60/30/15 Days) -> Public QR Verification Portal
```

---

### Detailed Sequential Movement & Logic

#### 1. Stakeholder Onboarding & Identity Provisioning

- **Trader Onboarding**: Businesses register using **GSTIN** or **PAN** validation, establishing corporate profiles and declaring nominated Directors under **Section 49** of the Legal Metrology Act, 2009.
- **LMO Provisioning**: State Legal Metrology Officers are onboarded by State Controllers and assigned explicit sub-divisional administrative jurisdictions.
- **GATC Onboarding**: Private testing laboratories register Principal Officers and certified technical staff, linking their NABL accreditation details and authorized testing scopes.
- **Vendor Tracking**: Manufacturers, dealers, and repairers register under State Enforcement Rules to maintain digital logs of equipment sales, installations, and repairs.

#### 2. Application Submission & Dynamic Fee Reconciliation

- **Asset Identification**: When a trader submits an application for initial or periodic verification, the platform queries the **Instrument Lifecycle Registry**. The system assigns or maps a unique **16-digit Instrument Identification Number (IIN)** tying together serial numbers, model approval references, capacity, accuracy class, and deployment coordinates.
- **Automated Fee Computation**: The dynamic fee microservice calculates the total fee (\\(T_f\\)) compliant with Schedule IX of the General Rules, 2011:
  \\[T_f = F_b + F_c + P_q\\]
  - \\(F_b\\): Base fee determined by instrument capacity and accuracy class.
  - \\(F_c\\): Conveyance fee applied for on-site inspections at the user's premises.
  - \\(P_q\\): Late payment penalty calculated as \\(P_q = N_q \times F_b\\) for \\(N_q\\) lapsed calendar quarters.
- **Treasury Reconciliation**: The applicant is redirected to the State Treasury Gateway (**e-GRAS**). A cryptographically signed webhook callback reconciles payment in **under 5 seconds**, issues a receipt, updates application status to **Fee Paid**, and commits the transaction to the public audit log.

#### 3. Task Allocation & Anti-Bias Scheduling Logic

- **Jurisdictional & Delegation Routing**: High-capacity instruments (e.g., weighbridges, storage tanks) route directly to the assigned district LMO pool. Specified lower-capacity instruments (e.g., Class III scales up to 150 kg, fuel dispensers) can be routed to accredited GATCs.
- **Workload Balancing**: The microservice distributes assignments using a **weighted round-robin algorithm** evaluating active officer queues, geographic density, and leave schedules.
- **Anti-Bias Enforcement**: To prevent regulatory capture and corruption, the system enforces logic prohibiting the same LMO from inspecting the same commercial establishment for more than **two consecutive verification cycles**.

#### 4. Mobile Field Verification & MPE Compliance

- **Geofence Validation**: The field officer navigates on-site; the mobile app verifies GPS coordinates against the declared installation location via GPS geofencing.
- **Offline Execution Engine**: If cellular connectivity is unavailable, the mobile app uses an encrypted local edge storage engine (**SQLite with AES-256 SQLCipher**) to conduct tests offline, auto-synchronizing with the PostgreSQL core once connected.
- **Metrological Error Testing**: Test weight readings are inputted into the app, which automatically validates errors against **Maximum Permissible Error (MPE)** thresholds defined in the Seventh and Eighth Schedules.
- **Verification Outcome**:
  - **Pass**: The officer affixes a physical lead/paper seal with a unique serial number, captures a geotagged/timestamped photograph of the seal, and collects touchscreen e-signatures from both trader and officer.
  - **Fail**: The system issues a digital **Rejection Memo**, marks the instrument as **"Rejected / Out of Service"**, and routes it to registered repairers for recalibration before re-application.

#### 5. Cryptographic Certificate Minting & Public Resolution

- **Document Assembly**: The Certificate Generation microservice populates official PDF/A templates with trader details, IIN, seal numbers, and validity periods.
- **Dynamic QR Generation**: A JSON payload containing certificate metadata is hashed using **SHA-256** and encoded into a high-density QR code on the PDF layout.
- **HSM Digital Signing**: The PDF byte stream is forwarded over an authenticated TLS connection to a **Hardware Security Module (HSM)** integrated with **C-DAC eSign** to append a legally non-repudiable PKCS#7 digital signature.
- **Public Verification**: The certificate status changes to **CERTIFIED**. Consumers or regulators scanning the QR code are redirected to `emaap.gov.in/verify` to view real-time certificate and physical seal details.

#### 6. Validity Tracking & Enforcement Lifecycle

- **Automated Expiry Alerts**: An event-driven message queue (**Apache Kafka** and **Redis**) continuously monitors certificate validity. Multi-channel reminders (SMS, WhatsApp, Email) are dispatched at **60, 30, and 15 days** prior to expiry (**EXPIRING_SOON**).
- **Lapse & Enforcement**: If un-renewed past the validity date, the status updates to **EXPIRED**, automatically flagging the instrument on executive MIS dashboards for field enforcement inspections.

---

### System State Transition Matrix

| State Code             | System Definition                              | Allowed Next Operational Steps                            |
| :--------------------- | :--------------------------------------------- | :-------------------------------------------------------- |
| **DRAFT**              | Application created, fee unpaid.               | Complete fee payment via e-GRAS.                          |
| **PENDING_ALLOCATION** | Payment confirmed, awaiting assignment.        | Allocation engine assigns LMO or GATC.                    |
| **SCHEDULED**          | Assigned to officer/lab, date fixed.           | Officer/lab conducts physical testing.                    |
| **INSPECTION_PASS**    | MPE tests passed, seal photo affixed.          | System compiles PDF & triggers HSM eSign.                 |
| **INSPECTION_FAIL**    | Instrument rejected due to MPE/physical error. | Rejection memo issued; route to repairer workflow.        |
| **CERTIFIED**          | Certificate signed & issued.                   | Instrument operational; dynamic QR code active.           |
| **EXPIRING_SOON**      | Validity window within < 60 days.              | Automated renewal alerts dispatched to trader.            |
| **EXPIRED**            | Validity period lapsed without renewal.        | Flagged for enforcement inspection & penalty computation. |

---
