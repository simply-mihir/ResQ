# ResQ: Emergency Intelligence Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://health-mvp-web-app-zeta.vercel.app/)
[![Next JS](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)

## Executive Summary

ResQ is a highly available, microservices-driven emergency intelligence platform engineered to bridge the communication latency between patients, first responders, and hospital networks. By replacing fragmented legacy emergency response protocols with a unified digital triage system, ResQ accelerates patient admission via real-time geolocation routing, automated medical profiling, and immediate dispatcher coordination.

## System Architecture

The platform adopts a distributed microservices architecture to ensure high availability, fault tolerance, and independent scalability of critical domains. The frontend ecosystem communicates via a centralized API Gateway, which orchestrates downstream requests to domain-specific backend services.

```mermaid
graph TB
    subgraph ClientLayer["Client Layer (Vercel Edge)"]
        WebApp["Patient Web App"]
        HospitalDash["Hospital Dashboard"]
        AdminPanel["Admin Portal"]
    end

    subgraph APIGateway["API Gateway (Render)"]
        Gateway["NestJS API Gateway"]
    end

    subgraph CoreServices["Backend Microservices (Render)"]
        EmergencySvc["Emergency Service"]
        DispatchSvc["Dispatch Service"]
        RecordsSvc["Records Service"]
        NotificationSvc["Notification Service"]
    end

    subgraph DataLayer["Persistence Layer"]
        Prisma["Prisma ORM"]
        Postgres[(Supabase PostgreSQL)]
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

## Domain Services

The backend is composed of isolated NestJS applications, each responsible for a distinct bounded context:

- **Emergency Service**: Handles SOS triggers, geospatial triage, and real-time patient routing to the nearest capable facility.
- **Dispatch Service**: Manages hospital capacity, ambulance fleet allocation, and dispatcher assignment.
- **Records Service**: Maintains secure access to electronic health records, patient medical profiles, and historical data.
- **Notification Service**: Orchestrates delivery of critical alerts, OTP authentication, and status updates via email and SMS protocols.
- **API Gateway**: Acts as the single entry point for all client applications, handling request routing, rate limiting, and centralized authentication validation.

## Emergency Triage Workflow

When an emergency event is triggered, the system executes a rapid orchestration of services to ensure immediate dispatch.

```mermaid
sequenceDiagram
    participant Patient as Patient Web App
    participant Gateway as API Gateway
    participant Emergency as Emergency Service
    participant Dispatch as Dispatch Service
    participant Hospital as Hospital Dashboard

    Patient->>Gateway: Trigger SOS (Coordinates & Profile ID)
    Gateway->>Emergency: Route Triage Request
    Emergency->>Emergency: Calculate Nearest Hospital (Haversine)
    Emergency->>Dispatch: Request Ambulance Allocation
    Dispatch->>Hospital: Push High-Priority Alert
    Hospital-->>Dispatch: Acknowledge & Dispatch Unit
    Dispatch-->>Emergency: Confirm Allocation
    Emergency-->>Gateway: Return Dispatch Status
    Gateway-->>Patient: Display ETA & Live Updates
```

## Technology Stack

The platform is engineered using a modern, scalable, and highly performant stack:

- **Frontend**: Next.js 14, React 18, TailwindCSS.
- **Backend**: NestJS, Node.js 20.
- **Database & ORM**: PostgreSQL (Supabase), Prisma.
- **Architecture**: Turborepo (Monorepo), Microservices.
- **Infrastructure**: Vercel (Frontend), Render (Backend Web Services).

## Local Development Setup

To run the platform locally, follow these steps:

### 1. Repository Initialization
```bash
git clone https://github.com/simply-mihir/ResQ.git
cd health-mvp
npm install
```

### 2. Environment Configuration
Create a `.env` file in the respective service and application directories. The primary variables required are:

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
GMAIL_USER="your.email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

### 3. Database Hydration
```bash
npx prisma generate --schema=packages/db/prisma/schema.prisma
```

### 4. Development Server Execution
The project uses Turborepo for orchestrated builds and execution.
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the primary web application.

## Deployment Strategy

The application leverages a hybrid deployment strategy optimized for specific operational requirements:

- **Edge Delivery**: Client applications are deployed on Vercel to utilize edge caching, global CDN distribution, and optimized asset delivery.
- **Compute Allocation**: Backend NestJS microservices are hosted as persistent Node.js instances on Render, ensuring continuous execution for background tasks, and complex routing algorithms without cold-start penalties.
