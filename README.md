# MapanSetu — National Legal Metrology Platform

A cloud-native, multi-tenant enterprise platform for end-to-end digital verification, certification, and lifecycle management of weighing and measuring instruments under the **Legal Metrology Act, 2009**.

---

## Monorepo Structure

```
MapanSetu/
├── .vscode/              # Shared workspace config (settings, extensions, debug)
├── contracts/
│   ├── openapi/          # OpenAPI 3.0 spec per service — define contracts FIRST
│   └── schemas/          # Shared JSON schemas (IIN format, fee structure, etc.)
├── services/
│   ├── iam/              # Identity & Access Management — Java / Spring Boot
│   ├── registry/         # Instrument Lifecycle Registry — Go (stubbed for prototype)
│   ├── workflow/         # Workflow & Scheduling Engine — Node.js / TypeScript
│   ├── fee-engine/       # Dynamic Fee Calculation — Python / FastAPI
│   ├── inspection/       # Mobile Inspection Service — Java / Spring Boot
│   ├── certificate/      # Certificate & PKI Service — Python
│   └── notifications/    # Notification Engine — Python / Kafka
├── apps/
│   ├── web/              # React SPA — multi-role admin portals
│   └── mobile/           # React Native / Flutter — offline-first field app
├── shared/
│   ├── types/            # Shared TypeScript types & interfaces
│   └── constants/        # Shared constants (MPE thresholds, fee schedules, etc.)
├── infra/
│   ├── k8s/              # Kubernetes manifests (write now, deploy later)
│   └── docker/           # Dockerfiles (write now, run later)
└── docs/
    └── specs/            # Architecture specs and context documents
```

---

## Tech Stack

| Service | Language | Port |
|---|---|---|
| IAM | Java / Spring Boot | 8080 |
| Registry | Go (prototype stub) | 8090 |
| Workflow Engine | Node.js / TypeScript | 3001 |
| Fee Engine | Python / FastAPI | 8001 |
| Inspection | Java / Spring Boot | 8081 |
| Certificate | Python / FastAPI | 8003 |
| Notifications | Python / FastAPI | 8002 |
| Web App | React (Vite) | 3000 |

---

## Development Order (Top-Down)

1. **Contracts first** — write OpenAPI specs in `contracts/openapi/` before any implementation
2. **Shared types** — define TypeScript interfaces and JSON schemas in `shared/`
3. **Service stubs** — empty shells that implement the contract interface
4. **Implementation** — fill the stubs with real logic

---

## Getting Started

```bash
# Workflow engine
cd services/workflow && npm install

# Web app
cd apps/web && npm install

# Python services (virtualenv per service)
cd services/fee-engine && python -m venv .venv && pip install -r requirements.txt

# Java services
cd services/iam && ./mvnw spring-boot:run
```

---

## Environment Variables

Copy `.env.example` to `.env` in each service directory. Never commit `.env` files.
