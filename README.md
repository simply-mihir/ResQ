<div align="center">

# ResQ
### Enterprise-Grade Emergency Intelligence Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://health-mvp-web-app-zeta.vercel.app/)
[![Next JS](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](#)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](#)

*Replacing fragmented legacy emergency response protocols with a unified digital triage system.*

</div>

<br />

## Executive Summary

ResQ is a highly available, microservices-driven emergency intelligence platform engineered to bridge the communication latency between patients, first responders, and hospital networks. It accelerates patient admission via real-time geolocation routing, automated medical profiling, and immediate dispatcher coordination.

---

## System Architecture

The platform adopts a distributed microservices architecture to ensure high availability, fault tolerance, and independent scalability of critical domains. The frontend ecosystem communicates via a centralized API Gateway, which orchestrates downstream requests to domain-specific backend services.

```mermaid
graph TB
    %% Styling Classes
    classDef client fill:#0a0a0a,stroke:#333,stroke-width:1px,color:#ffffff
    classDef gateway fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#ffffff
    classDef service fill:#e53e3e,stroke:#c53030,stroke-width:2px,color:#ffffff
    classDef db fill:#38a169,stroke:#2f855a,stroke-width:2px,color:#ffffff
    
    subgraph ClientLayer["Client Layer (Vercel Edge)"]
        WebApp["Patient Web App"]:::client
        HospitalDash["Hospital Dashboard"]:::client
        AdminPanel["Admin Portal"]:::client
    end

    subgraph APIGateway["API Gateway (Render)"]
        Gateway["NestJS API Gateway"]:::gateway
    end

    subgraph CoreServices["Backend Microservices (Render)"]
        EmergencySvc["Emergency Service"]:::service
        DispatchSvc["Dispatch Service"]:::service
        RecordsSvc["Records Service"]:::service
        NotificationSvc["Notification Service"]:::service
    end

    subgraph DataLayer["Persistence Layer"]
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

---

## Application Ecosystem

The frontend architecture utilizes a Turborepo monorepo containing three distinct Next.js applications, tailored for specific user experiences.

### 1. Patient Web Application
The primary interface for individuals and their families.
- **SOS Triage Engine**: Instantly captures GPS coordinates and routes a priority distress signal.
- **Medical QR Vault**: Dynamically generates secure QR codes encoding vital patient history.
- **Family Linking**: Connects profiles to allow family members to track statuses and appointments.
- **First Responder Mode**: Allows verified medical professionals to securely scan patient QR codes.
- **AI-Powered Medical Records**: Automatic extraction and structuring of uploaded health documents via AI OCR confidence modeling.
- **Follow-Up & Diagnostics**: Seamless booking of recommended diagnostic tests post-discharge.

### 2. Hospital Dashboard
The mission-control center for hospital dispatchers and administrators.
- **Bed Management Engine**: Real-time allocation and tracking of trauma, ICU, and general ward capacities.
- **Live Triage Queue**: Websocket-driven feed of incoming SOS requests routed to the specific hospital.
- **Secure Records Access**: Role-based access control (RBAC) to view incoming patient medical profiles prior to arrival.
- **Ambulance Fleet Tracking**: Track real-time live transit status (en route, arrived) of dispatched ambulance fleets.

### 3. Administrator Portal
The global observability and management node.
- **Network Analytics**: Aggregates latency metrics, triage volumes, and hospital capacities.
- **Node Onboarding**: Interface to securely register new hospitals and diagnostic centres into the ResQ network.
- **Audit Log Monitoring**: Full oversight of system-wide access logs for HIPAA and GDPR compliance auditing.

---

## Core Workflows & Interaction Models

### 1. SOS & Geolocation Triage Flow
The primary critical path when an emergency event occurs. The system calculates the Haversine distance between the patient and all capable hospitals, factoring in bed capacity.

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

### 2. First Responder QR Scan Flow
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

### 3. Notification & Matching Flow
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

## Domain Services Detail

The backend relies on isolated NestJS microservices:

- **Emergency Service**: The geospatial routing engine. Evaluates patient coordinates against a cached spatial index of hospital locations.
- **Dispatch Service**: The resource lock manager. Prevents race conditions when multiple incidents attempt to claim the same hospital bed or ambulance. Handles ambulance status flow logic (`TRIGGERED` -> `EN_ROUTE` -> `ARRIVED`).
- **Records Service**: The data vault. Ensures HIPAA/GDPR-compliant access to Patient Health Information (PHI). Utilizes AI extraction algorithms to parse prescription documents and stores full, immutable Audit Logs.
- **Notification Service**: The communication orchestrator. Handles asynchronous message delivery decoupled from critical path operations.
- **API Gateway**: The traffic controller. Normalizes client requests, enforces rate limiting, and validates stateless session tokens before internal routing.

---

## Technology Stack

The platform is engineered using an enterprise-grade technology stack:

- **Frontend & Edge**: Next.js 14, React 18, TailwindCSS.
- **Backend Services**: NestJS, Node.js 20, Express.
- **Data Persistence**: Prisma ORM, Supabase (Serverless PostgreSQL).
- **Monorepo Architecture**: Turborepo, pnpm workspaces.
- **Infrastructure**: Vercel (Edge Functions & Hosting), Render (Persistent Web Services).

---

## Comprehensive Use Case Matrix

The platform is designed to serve six distinct actors across its ecosystem.

| Actor | Primary Interface | Key Capabilities |
| :--- | :--- | :--- |
| **Patient** | Web App | One-tap SOS triage, manage electronic health records, view family members, generate personalized Medical QR codes, book diagnostics. |
| **First Responder** | Web App (Responder Mode) | Scan patient QR codes, retrieve immediate critical medical history (blood type, allergies), update patient triage status in transit. |
| **Ambulance Operator** | Mobile/Web App | Receive hospital dispatch assignments, update live transit status (en route, arrived), navigate via optimized routes. |
| **Hospital Dispatcher** | Hospital Dashboard | Monitor incoming triage queues, allocate bed capacity, review inbound patient records, confirm dispatch availability. |
| **Diagnostic Centre** | Partner API / Web | Receive follow-up recommendations, update wait times, schedule post-discharge patient tests. |
| **System Administrator** | Admin Portal | Monitor system-wide analytics, onboard new hospital nodes, manage global configuration, enforce full system audit logging. |

---

## Local Development Setup

To run the platform locally, follow these steps:

### 1. Repository Initialization
```bash
git clone https://github.com/simply-mihir/ResQ.git
cd health-mvp
npm install
```

### 2. Environment Configuration
Create `.env` files in `apps/web-app`, `apps/hospital-dashboard`, and all folders within `services/`. The complete set of required environment variables for a local run is:

```env
# Supabase PostgreSQL connection strings (Pooling & Direct)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# SMTP Configuration for Stateless OTP Authentication
GMAIL_USER="your.email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

### 3. Database Hydration
Initialize the Prisma client across all services:
```bash
npx prisma generate --schema=packages/db/prisma/schema.prisma
```

### 4. Development Server Execution
The project uses Turborepo for parallel, cached builds and execution.
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the primary web application.

---

## Deployment Strategy

The application leverages a hybrid deployment strategy optimized for latency and persistent connectivity:

- **Edge Delivery**: The frontend applications (Web, Hospital, Admin) are deployed on **Vercel** to utilize edge caching, global CDN distribution, and optimized static asset delivery.
- **Compute Allocation**: The backend NestJS microservices are hosted as persistent Node.js instances on **Render** (configured via `render.yaml`). This ensures continuous execution for Websocket connections, background polling, and complex routing algorithms without the cold-start penalties associated with serverless functions.
