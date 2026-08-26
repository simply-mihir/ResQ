# ResQ: Next-Gen Emergency Intelligence

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://health-mvp-web-app-zeta.vercel.app/)
![Next JS](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-blue?style=for-the-badge)

A next-generation emergency intelligence MVP designed to seamlessly connect patients, hospitals, and dispatchers in real-time. ResQ replaces fragmented emergency response systems with a robust microservices architecture and high-speed web interfaces that prioritize rapid triage and geolocation routing.

**Live Deployment:** [https://health-mvp-web-app-zeta.vercel.app/](https://health-mvp-web-app-zeta.vercel.app/)

---

## The Workflow

ResQ operates on a three-tier architecture serving Admins, Hospitals, and Patients. Here is the complete workflow of the Minimum Viable Product:

```mermaid
sequenceDiagram
    participant Patient
    participant ResQ System
    participant Hospital
    
    Patient->>ResQ System: Registers with Medical Profile
    Hospital->>ResQ System: Admin Onboards & Dispatchers Login
    
    Note over Patient,Hospital: Emergency Event Occurs
    
    Patient->>ResQ System: Triggers SOS (Full Triage)
    ResQ System->>ResQ System: Captures GPS Coordinates
    ResQ System->>Hospital: Routes Alert to Nearest Hospital
    Hospital->>ResQ System: Views Patient Location & Vitals
    Hospital->>Patient: Dispatches Ambulance
```

### 1. System Administration
- **Infrastructure Setup:** The platform requires an initial setup by a System Administrator. The admin accesses the highly secured `Admin Setup` portal.
- **Hospital Onboarding:** The administrator registers participating hospital networks into the database, initializing their emergency capacities and generating their internal credentials.

### 2. Hospital Operations
- **Secure Authentication:** Hospital dispatchers log into the `Hospital Portal` using their official email. The system uses a **Stateless OTP Protocol** (One-Time Password sent via email) to authenticate the session without relying on static passwords.
- **Emergency Dashboard:** Once logged in, dispatchers are presented with a live mission-control dashboard. They monitor active network statuses and stand ready to receive incoming trauma alerts.
- **Dispatch Management:** When an SOS is received, the dashboard displays the exact location and medical profile of the patient, allowing the hospital to instantly dispatch an ambulance.

### 3. Patient Experience
- **Frictionless Registration:** Patients sign up via the `Patient Portal` using the same stateless OTP system.
- **Medical Profiling:** Upon registration, the database links vital information (e.g., Blood Type: O+, Allergies: None) to the patient's profile.
- **Emergency SOS (Full Triage):** In a crisis, the patient presses the SOS button on their dashboard.
- **Geolocation & Routing:** The browser instantly captures the patient's precise GPS coordinates. The system pairs these coordinates with the patient's medical profile and routes a critical alert to the nearest available hospital.

---

## System Architecture

The MVP is built using a microservices architecture. Three distinct Next.js frontends communicate with a NestJS-powered backend suite composed of specialized services, all deployed on Render.

```mermaid
graph TD
    Client[Client Browsers]
    
    subgraph Frontend["Frontend (Vercel)"]
        NextApp[Next.js Apps]
        Client -->|HTTPS| NextApp
        NextApp --> PatientPortal[Patient Dashboard]
        NextApp --> HospitalPortal[Hospital Portal]
        NextApp --> AdminPortal[Admin Setup]
    end
    
    subgraph Backend["Backend Microservices (Render)"]
        PatientPortal -.-> Gateway[API Gateway]
        HospitalPortal -.-> Gateway
        AdminPortal -.-> Gateway
        
        Gateway --> EmergencyService[Emergency Service]
        Gateway --> DispatchService[Dispatch Service]
        Gateway --> RecordsService[Records Service]
        Gateway --> NotificationService[Notification Service]
    end
    
    subgraph DataLayer["Data & Persistence Layer"]
        EmergencyService --> Prisma[Prisma ORM]
        DispatchService --> Prisma
        RecordsService --> Prisma
        Prisma --> DB[(Supabase PostgreSQL)]
    end
```

---

## Technology Stack

The platform is engineered using modern, scalable, and highly performant technologies:

- ![Next JS](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white) — React frameworks for frontends
- ![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white) — Microservices Backend framework
- ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) — Utility-first styling
- ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) — Type-safe Database ORM
- ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) — Serverless PostgreSQL database
- ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white) — Backend Microservices Hosting
- ![Vercel](https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white) — Frontend deployment & Edge caching

---

## Local Development Setup

To run the platform locally, follow these steps:

### 1. Clone & Install
```bash
git clone https://github.com/simply-mihir/health-mvp.git
cd health-mvp
npm install
```

### 2. Environment Variables
Create a `.env` file in the `apps/web-app` directory and provide the necessary keys:
```env
# Supabase PostgreSQL Connection
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# SMTP Configuration for OTP Authentication
GMAIL_USER="your.email@gmail.com"
GMAIL_APP_PASSWORD="16-character-app-password"
```
*(Note: If `GMAIL_USER` is missing in development, the system securely bypasses email delivery and defaults the OTP to `123456` for testing purposes).*

### 3. Initialize Database
```bash
npx prisma generate
```

### 4. Run the Application
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the application.

---

## Deployment Details

This application utilizes a split-deployment strategy:
- **Frontend Apps (Vercel):** The Next.js client applications are deployed on Vercel to take advantage of edge caching and high-performance delivery.
- **Backend Microservices (Render):** The NestJS backend services (Emergency, Dispatch, Records, Gateway) are hosted on Render as persistent Web Services via the `render.yaml` configuration.
- **Turborepo Caching:** The monorepo uses Turborepo to efficiently build and deploy only the changed services or applications.
