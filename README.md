<div align="center">
  <h1> ResQ — Emergency Intelligence Platform</h1>
  <p>
    <b>A highly available, microservices-driven emergency intelligence platform engineered for sub-second trauma triage, automated medical profiling, and immediate dispatcher coordination.</b>
  </p>
  <p>
    <a href="https://health-mvp-web-app-zeta.vercel.app/">
      <img src="https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge" alt="License">
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
    <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS">
    <img src="https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white" alt="Prisma">
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Render">
    <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind">
    <img src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo">
  </p>
</div>

---

**ResQ** replaces fragmented legacy emergency response protocols with a unified digital triage system built around three architectural pillars:

1.  **Edge-delivered Frontends** for zero-latency patient & hospital interaction
2.  **NestJS Microservices** for robust, race-safe dispatch and algorithmic routing
3.  **Event-driven WebSockets & OTPs** for real-time alerting and stateless authentication

By bridging the communication latency between patients, first responders, and hospital networks, ResQ accelerates patient admission via real-time geolocation routing and automated medical profiling.

---

## Table of Contents

1. [Key Features](#1-key-features)
2. [System Architecture](#2-system-architecture)
3. [Flow Diagrams](#3-flow-diagrams)
   - 3.1 [SOS & Geolocation Triage Flow](#31-sos--geolocation-triage-flow)
   - 3.2 [First Responder QR Scan Flow](#32-first-responder-qr-scan-flow)
   - 3.3 [Notification & Matching Flow](#33-notification--matching-flow)
4. [Application Ecosystem](#4-application-ecosystem)
5. [Database Schema](#5-database-schema)
6. [Quick Start — Local Development](#6-quick-start--local-development)
7. [Project Structure](#7-project-structure)
8. [Environment Configuration](#8-environment-configuration)
9. [Deployment Guide](#9-deployment-guide)
10. [Production Notes](#10-production-notes)
11. [License](#11-license)

---

## 1. Key Features

### Core capabilities
-  **One-tap SOS triage** — Instantly captures GPS coordinates and routes a priority distress signal.
-  **Medical QR Vault** — Dynamically generates secure QR codes encoding vital patient history (blood type, allergies).
-  **Live Triage Queue** — Websocket-driven feed of incoming SOS requests routed directly to specific hospital dashboards.
-  **Ambulance Fleet Tracking** — Mobile interface for operators to update live transit status (en route, arrived) via optimized routes.
-  **Family Linking** — Connects profiles to allow family members to track triage statuses and appointments.
-  **Diagnostic Bookings** — Seamless booking of recommended diagnostic tests post-discharge with partner networks.

### Engineering depth
-  **Microservices Backend** — 5 isolated NestJS domains (Gateway, Emergency, Dispatch, Records, Notification) for independent scalability.
-  **Algorithmic Routing** — Evaluates patient coordinates against a cached spatial index of hospital locations using the Haversine formula.
-  **Stateless OTP Authentication** — Passwordless login generating HTTP-only session cookies decoupled from critical path operations.
-  **AI-Powered Medical Records** — Automatic extraction and structuring of uploaded health documents via AI OCR confidence modeling.
-  **HIPAA/GDPR Compliance** — Strict Role-Based Access Control (RBAC) and immutable Audit Logs tracking every PHI access event.
-  **Turborepo Monorepo** — Code sharing across 3 Next.js applications and 5 backend services with aggressive build caching.

---

## 2. System Architecture

```mermaid
graph TB
    %% Styling Classes
    classDef client fill:#0a0a0a,stroke:#333,stroke-width:1px,color:#ffffff
    classDef gateway fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#ffffff
    classDef service fill:#e53e3e,stroke:#c53030,stroke-width:2px,color:#ffffff
    classDef db fill:#38a169,stroke:#2f855a,stroke-width:2px,color:#ffffff
    
    subgraph ClientLayer[" Client Layer (Vercel Edge)"]
        WebApp["Patient Web App"]:::client
        HospitalDash["Hospital Dashboard"]:::client
        AdminPanel["Admin Portal"]:::client
    end

    subgraph APIGateway[" API Gateway (Render)"]
        Gateway["NestJS API Gateway"]:::gateway
    end

    subgraph CoreServices[" Backend Microservices (Render)"]
        EmergencySvc["Emergency Service"]:::service
        DispatchSvc["Dispatch Service"]:::service
        RecordsSvc["Records Service"]:::service
        NotificationSvc["Notification Service"]:::service
    end

    subgraph DataLayer[" Persistence Layer"]
        Prisma["Prisma ORM"]:::db
        Postgres[(Supabase PostgreSQL)]:::db
    end

    WebApp -->|HTTPS / REST| Gateway
    HospitalDash -->|HTTPS / REST| Gateway
    AdminPanel -->|HTTPS / REST| Gateway

    Gateway --> EmergencySvc
    Gateway --> DispatchSvc
    Gateway --> RecordsSvc
    Gateway --> NotificationSvc

    EmergencySvc --> Prisma
    DispatchSvc --> Prisma
    RecordsSvc --> Prisma
    Prisma --> Postgres
```

Each layer has a single, well-defined responsibility. The backend relies on a centralized API Gateway that normalizes client requests, enforces rate limiting, and validates stateless session tokens before internal routing.

---

## 3. Flow Diagrams

### 3.1 SOS & Geolocation Triage Flow

The primary critical path when an emergency event occurs. 

```mermaid
sequenceDiagram
    autonumber
    
    participant Patient as Patient Web App
    participant Gateway as API Gateway
    participant Emergency as Emergency Service
    participant RecordsSvc as Records Service
    participant Dispatch as Dispatch Service
    participant Hospital as Hospital Dashboard

    Patient->>Gateway: Trigger SOS (GPS Coordinates & Profile ID)
    Gateway->>Emergency: Route Triage Request
    
    rect rgba(128, 128, 128, 0.15)
    Note over Emergency,RecordsSvc: Data Enrichment Phase
    Emergency->>RecordsSvc: Fetch Patient Medical Profile
    RecordsSvc-->>Emergency: Return Profile (Allergies, Blood Type)
    end
    
    rect rgba(128, 128, 128, 0.15)
    Note over Emergency,Dispatch: Algorithmic Routing Phase
    Emergency->>Emergency: Calculate Nearest Capable Hospital (Haversine)
    Emergency->>Dispatch: Request Unit/Bed Allocation
    end
    
    rect rgba(128, 128, 128, 0.15)
    Note over Dispatch,Hospital: Dispatch & Allocation Phase
    Dispatch->>Hospital: Push High-Priority Alert (WebSockets)
    Hospital-->>Dispatch: Acknowledge & Allocate Bed
    Dispatch-->>Emergency: Confirm Allocation
    end
    
    Emergency-->>Gateway: Return Dispatch Status & ETA
    Gateway-->>Patient: Display ETA & Live Updates
```

**Why this is robust:**
- **Race Condition Prevention** — The Dispatch Service acts as a resource lock manager, preventing multiple incidents from claiming the same hospital bed.
- **Enriched Dispatch** — The Hospital receives the alert *alongside* critical PHI (blood type, allergies) before the patient even arrives.

### 3.2 First Responder QR Scan Flow

A specialized workflow allowing paramedics or bystanders to pull life-saving data from an unconscious or incapacitated patient via their personalized QR code.

```mermaid
graph TD
    classDef default fill:#f7fafc,stroke:#cbd5e0,stroke-width:1px,color:#2d3748
    classDef decision fill:#ebf8ff,stroke:#3182ce,stroke-width:2px,color:#2c5282
    classDef secure fill:#e6fffa,stroke:#319795,stroke-width:2px,color:#234e52
    classDef terminal fill:#fff5f5,stroke:#e53e3e,stroke-width:2px,color:#742a2a

    Start((Responder Scans QR)):::decision --> AuthCheck{Is Responder Authenticated?}:::decision
    
    AuthCheck -->|No| BasicData[Display Basic Vitals & Blood Type]:::default
    AuthCheck -->|Yes| FullAuth[Initiate Secure Request via Gateway]:::secure
    
    FullAuth --> ValidateToken[Gateway Validates JWT]:::secure
    ValidateToken --> RequestRecords[Records Service Queries DB]:::secure
    
    RequestRecords --> PayloadBuilder[Build Encrypted Medical Payload]:::secure
    PayloadBuilder --> Deliver[Deliver Complete Health Record to Device]:::secure
    
    Deliver --> Action{Responder Action}:::decision
    Action -->|Update Status| LogStatus[Log Triage Status]:::default
    Action -->|View History| DisplayHistory[Display Comprehensive History]:::default
    
    BasicData --> End((End)):::terminal
    LogStatus --> End
    DisplayHistory --> End
```

### 3.3 Notification & Matching Flow

The stateless authentication and matching engine leverages a secure OTP protocol.

```mermaid
graph LR
    classDef user fill:#edf2f7,stroke:#a0aec0,stroke-width:2px,color:#1a202c
    classDef system fill:#ebf4ff,stroke:#5a67d8,stroke-width:2px,color:#434190
    classDef action fill:#f0fff4,stroke:#48bb78,stroke-width:2px,color:#276749
    
    User[User/Patient]:::user -->|Request Login| Gateway[API Gateway]:::system
    Gateway --> AuthModule[Authentication Module]:::system
    AuthModule --> GenOTP[Generate Secure OTP]:::system
    GenOTP --> NotifySvc[Notification Service]:::system
    NotifySvc -->|Send Email/SMS| SMTP[Nodemailer / SMTP]:::action
    SMTP --> User
    User -->|Submit OTP| Gateway
    Gateway -->|Validate| GenSession[Generate HTTP-Only Session Cookie]:::action
```

---

## 4. Application Ecosystem

The platform is designed to serve distinct actors across a Turborepo monorepo:

| App | Target User | Key Capabilities |
| :--- | :--- | :--- |
| **Patient Web App** | Patient / First Responder | One-tap SOS triage, manage electronic health records, view family members, generate personalized Medical QR codes, book diagnostics. Paramedics can scan codes here. |
| **Hospital Dashboard** | Dispatcher | Monitor incoming triage queues, allocate bed capacity, review inbound patient records, confirm dispatch availability. |
| **Admin Portal** | System Administrator | Monitor system-wide analytics, onboard new hospital nodes, manage global configuration, enforce full system audit logging. |

---

## 5. Database Schema

The core persistence layer is built on PostgreSQL with Prisma ORM.

### Table: `emergency_cases` (Fact)

One row per SOS event. Tracks the entire lifecycle of an emergency.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, autogenerated |
| `case_number` | `varchar` | Unique, human-readable (e.g. HC-2024-00001) |
| `status` | `enum` | Tracks state (`TRIGGERED`, `DISPATCHED`, `ARRIVED`) |
| `location_lat` / `location_lng` | `float` | Geolocation used for Haversine routing |
| `severity_tier` | `enum` | Triaged priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `assigned_hospital_id` | `uuid` | FK → `hospitals.id` |

### Table: `medical_record_entries` (Dimension)

Secure vault for Patient Health Information (PHI) with AI OCR capabilities.

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, autogenerated |
| `patient_id` | `uuid` | FK → `users.id` |
| `extracted_data` | `json` | Structured data extracted by AI models |
| `extraction_confidence` | `float` | AI confidence score (0.0 to 1.0) |
| `status` | `enum` | Tracks state (`PROCESSING`, `AI_EXTRACTED`, `VERIFIED`) |

**Auditing:** A dedicated `audit_logs` table meticulously tracks every Read/Write to sensitive rows (like medical records) to ensure strict GDPR/HIPAA compliance.

---

## 6. Quick Start — Local Development

The entire stack is orchestrated via Turborepo.

```bash
# Clone
git clone https://github.com/simply-mihir/ResQ.git
cd health-mvp

# Install dependencies workspace-wide
npm install

# Hydrate Database
npx prisma generate --schema=packages/db/prisma/schema.prisma

# Boot the stack (Frontends + Microservices)
npm run dev
```

**Access points:**
- Patient App → [http://localhost:3000](http://localhost:3000)
- Hospital Dashboard → [http://localhost:3001](http://localhost:3001)
- Admin Portal → [http://localhost:3002](http://localhost:3002)

---

## 7. Project Structure

```text
ResQ/
├── apps/
│   ├── web-app/                   # Next.js: Patient & First Responder UI
│   ├── hospital-dashboard/        # Next.js: Dispatcher Mission Control
│   └── admin-panel/               # Next.js: System Observability
├── services/
│   ├── gateway/                   # NestJS: Centralized API Router & Auth
│   ├── emergency-service/         # NestJS: Haversine Routing Engine
│   ├── dispatch-service/          # NestJS: Resource & Bed Lock Manager
│   ├── records-service/           # NestJS: HIPAA-Compliant Data Vault
│   └── notification-service/      # NestJS: Async SMTP/SMS Orchestrator
├── packages/
│   └── db/                        # Shared Prisma Schema & Types
├── render.yaml                    # Infrastructure-as-code for Backend Services
├── turbo.json                     # Monorepo build and caching pipeline
└── package.json
```

---

## 8. Environment Configuration

Create `.env` files in `apps/web-app`, `apps/hospital-dashboard`, and all folders within `services/`. The complete set of required environment variables for a local run is:

```env
# Supabase PostgreSQL connection strings (Pooling & Direct)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# SMTP Configuration for Stateless OTP Authentication
GMAIL_USER="your.email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

---

## 9. Deployment Guide

The application leverages a hybrid deployment strategy optimized for specific operational requirements:

| Component | Provider | Strategy | Benefit |
| :--- | :--- | :--- | :--- |
| **Frontends** | Vercel | Serverless / Edge | Global CDN distribution, optimized asset delivery, zero-config CI/CD. |
| **Microservices** | Render | Persistent Web Services | Prevents cold-start penalties for critical algorithms; supports long-lived WebSockets. |
| **Database** | Supabase | Managed PostgreSQL | Built-in connection pooling (`pgbouncer`) for microservice scale. |

Render deployments are managed entirely as code via the `render.yaml` specification at the root of the repository, enabling rapid environment cloning.

---

## 10. Production Notes

- **Geospatial Scaling:** Currently, distance is calculated using the Haversine formula in-memory within the `Emergency Service`. As the hospital network grows globally, this should be offloaded to **PostGIS** for native spatial indexing and querying.
- **Message Broker:** The API Gateway currently orchestrates inter-service communication. Introducing **RabbitMQ or Apache Kafka** would decouple these microservices further, allowing the `Notification Service` to act purely on event consumption rather than direct HTTP invocations.

---

## 11. License

GNU General Public License v3.0 (GPLv3) — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built by <a href="https://github.com/simply-mihir">@simply-mihir</a></sub>
</div>
