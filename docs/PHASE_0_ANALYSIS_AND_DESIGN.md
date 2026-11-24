# PHASE 0 — Analysis & Architectural Design

**Project Topic**: Software Licensing Process with a Digital Signature («Сандық қолтаңбасы бар бағдарламалық жасақтаманы лицензиялау процесі»)  
**System Type**: Educational / Enterprise SaaS Platform Demonstration  
**Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Prisma (SQLite/PostgreSQL compatible), Zod, SHA-256 / Ed25519 Cryptographic Simulation Engine.

---

## 1. Requirements & Ambiguity Resolutions

| Requirement / Requirement Area | Clarification & Architectural Decision |
| :--- | :--- |
| **Legal Binding vs Demo Disclaimer** | System is strictly an **educational/SaaS platform demo**. A persistent header banner and certificate badges explicitly state "Educational / Demo Platform — Signatures are simulated for verification mechanics". |
| **Digital Signature Implementation** | Implements canonical JSON serialization, SHA-256 hashing of form payload + document hashes, and Ed25519 key-pair signature simulation with tamper verification. |
| **Database Engine** | Configured with **SQLite via Prisma** for zero-dependency, instant out-of-the-box local execution, easily swappable to PostgreSQL via `DATABASE_URL` in `schema.prisma`. |
| **Authentication & RBAC** | Session cookie auth with password hashing (bcrypt), token-based password reset, and permission-based access control (`Role` ↔ `Permission`). |
| **i18n Readiness** | UI strings extracted to a dictionary structure supporting **English (default)**, **Kazakh (Қазақша)**, and **Russian (Русский)**. |

---

## 2. Architecture & Directory Structure

```
                  ┌────────────────────────────────────────────────────────┐
                  │              Next.js App Router (UI / UX)             │
                  │   Tailwind CSS • Shadcn UI • Lucide Icons • Motion     │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                  ┌───────────────────────────▼────────────────────────────┐
                  │             Feature Modules & React Hooks              │
                  │   auth • applications • licenses • signature • admin   │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                  ┌───────────────────────────▼────────────────────────────┐
                  │        Domain Services & Abstraction Adapters          │
                  │   SignatureProvider • StorageProvider • NotifyChannel  │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                  ┌───────────────────────────▼────────────────────────────┐
                  │               Prisma ORM & SQLite / Postgres           │
                  └────────────────────────────────────────────────────────┘
```

### Directory Tree

```
├── app/                       # Next.js App Router pages and API routes
│   ├── (auth)/                # Login, Register, Forgot Password
│   ├── (public)/              # Landing, About, How-it-works, FAQ, Contact, Verify
│   ├── admin/                 # Admin operations dashboard & management
│   ├── dashboard/             # User portal dashboard, wizard, licenses, docs
│   └── api/                   # REST API routes (auth, applications, licenses, verify, docs)
├── components/                # Shared UI design system & layout components
│   ├── shared/                # Banners, Header, Footer, Sidebar, Navigation
│   └── ui/                    # Buttons, Modals, Cards, Badges, Tables, Inputs, Timelines
├── features/                  # Business logic domain modules
│   ├── admin/                 # Admin management logic, statistics, review queues
│   ├── applications/          # Application wizard steps, state machine, detail views
│   ├── auth/                  # RBAC, login/register forms, session provider
│   ├── licenses/              # License cards, certificate viewer, renewal flows
│   └── signature/             # SHA-256 canonical hashing, Ed25519 signing & verification engine
├── services/                  # Swappable infrastructure providers (Adapters)
│   ├── signature/             # Local SHA256/Ed25519 provider (swappable for NCALayer/ECP)
│   ├── storage/               # Filesystem storage provider (swappable for AWS S3)
│   └── notification/          # In-app notification channel (swappable for SMTP/SMS)
├── lib/                       # Core utilities, state machine, Zod schemas, DB client
├── prisma/                    # Schema, migrations, seed script with sample data
├── types/                     # TypeScript declarations, API payloads, enums
├── tests/                     # Unit & integration tests for signature engine and state transitions
└── docs/                      # Architectural specifications & documentation
```

---

## 3. Data Model & Entity Relationship Overview

```
 ┌──────────────┐       1:N       ┌─────────────────┐       1:N       ┌─────────────────────┐
 │     User     ├────────────────►│   Application   ├────────────────►│ ApplicationDocument │
 └──────┬───────┘                 └────────┬────────┘                 └─────────────────────┘
        │                                  │
        │ 1:N                              │ 1:1
        ▼                                  ▼
 ┌──────────────┐                 ┌─────────────────┐
 │   Software   │                 │ DigitalSignature│
 └──────────────┘                 └────────┬────────┘
        │                                  │
        │ 1:N                              │ 1:1
        ▼                                  ▼
 ┌──────────────┐                          ┌─────────────────┐
 │   License    │◄─────────────────────────┤  LicenseEvent   │
 └──────────────┘                          └─────────────────┘
```

### Entity List
- **User**: User accounts, credentials, contact info, role association.
- **Role & Permission**: Dynamic RBAC mapping (`USER`, `ADMIN`, `REVIEWER`, `LICENSE_MANAGER`).
- **Software**: Software products created by users for licensing.
- **Application**: License application submissions, status tracking, metadata.
- **ApplicationStatusHistory**: Audit trail of application status changes with reviewer notes.
- **ApplicationDocument**: Uploaded files with MIME validation, checksum, and storage URI.
- **DigitalSignature**: Cryptographic payload (SHA-256 payload hash, signature string, key fingerprint, verification ID, timestamp).
- **License**: Issued licenses with code, start/end date, verification token, active/suspended state.
- **LicenseEvent**: Life-cycle audit log for license issuance, revocation, or renewal.
- **Notification**: User-facing in-app alerts with unread counter.
- **ActivityLog**: System-wide immutable security and operation log.
- **SystemSetting**: Admin feature flags, SLA configurations, and storage limits.

---

## 4. Role & Permission Matrix (RBAC)

| Permission | USER | REVIEWER | LICENSE_MANAGER | ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| `application:create` | ✅ | ❌ | ❌ | ✅ |
| `application:read_own` | ✅ | ✅ | ✅ | ✅ |
| `application:read_all` | ❌ | ✅ | ✅ | ✅ |
| `application:sign` | ✅ | ❌ | ❌ | ✅ |
| `application:submit` | ✅ | ❌ | ❌ | ✅ |
| `application:review` | ❌ | ✅ | ❌ | ✅ |
| `application:approve_reject` | ❌ | ✅ | ❌ | ✅ |
| `license:view` | ✅ (own) | ✅ | ✅ | ✅ |
| `license:issue` | ❌ | ❌ | ✅ | ✅ |
| `license:revoke_suspend` | ❌ | ❌ | ✅ | ✅ |
| `user:manage` | ❌ | ❌ | ❌ | ✅ |
| `system:configure` | ❌ | ❌ | ❌ | ✅ |
| `audit:read` | ❌ | ❌ | ❌ | ✅ |

---

## 5. Application State Machine Workflow

```
[DRAFT] ──────► [DOCUMENTS_REQUIRED] ──────► [SIGNED] ──────► [SUBMITTED]
  │                                                                 │
  ▼                                                                 ▼
[CANCELLED]                                                 [UNDER_REVIEW]
                                                                 │
                                          ┌──────────────────────┼──────────────────────┐
                                          ▼                      ▼                      ▼
                           [ADDITIONAL_INFO_REQUIRED]       [APPROVED]             [REJECTED]
                                          │                      │
                                          └──────────────────────► [LICENSE_ISSUED]
```

### State Machine Transition Rules

| From Status | To Status | Allowed Roles | Trigger Condition / Action | Side Effects |
| :--- | :--- | :--- | :--- | :--- |
| `DRAFT` | `DOCUMENTS_REQUIRED` | USER, ADMIN | Documents pending upload | Log Activity |
| `DOCUMENTS_REQUIRED` | `SIGNED` | USER | Application payload & docs hashed & signed | Create `DigitalSignature`, Log Activity |
| `SIGNED` | `SUBMITTED` | USER | User confirms final submission | Notify Admins, Log Activity |
| `SUBMITTED` | `UNDER_REVIEW` | ADMIN, REVIEWER | Admin opens application for review | Notify User |
| `UNDER_REVIEW` | `ADDITIONAL_INFO_REQUIRED` | ADMIN, REVIEWER | Info requested with comment | Notify User, Log Activity |
| `ADDITIONAL_INFO_REQUIRED`| `SIGNED` | USER | User updates payload/docs & re-signs | Re-hash payload, Notify Admin |
| `UNDER_REVIEW` | `APPROVED` | ADMIN, REVIEWER | Verification checks pass | Notify User, Enable License Issuance |
| `UNDER_REVIEW` | `REJECTED` | ADMIN, REVIEWER | Rejection reason provided | Notify User, Log Activity |
| `APPROVED` | `LICENSE_ISSUED` | ADMIN, LICENSE_MANAGER | Automatic or manual license generation | Create `License`, Notify User, Log Activity |
| *Any Draft State* | `CANCELLED` | USER, ADMIN | Application withdrawn | Log Activity |

---

## 6. Page & Route Map

### Public Routes
- `/` — Modern landing page with interactive pipeline visual.
- `/about` — Platform purpose, legal model, security overview.
- `/how-it-works` — 8-step scroll-animated interactive workflow guide.
- `/faq` — Accessible accordion FAQ.
- `/contact` — Contact form (persisted into DB).
- `/verify-license` — Public cryptographic verification portal (supports `?id=` query parameter).
- `/terms`, `/privacy` — Legal compliance disclaimers.

### User Dashboard Routes
- `/dashboard` — KPI stats, recent applications, progress tracker, action alerts.
- `/dashboard/applications` — Applications data grid with search, filter, and pagination.
- `/dashboard/applications/new` — 6-step Application Creation Wizard.
- `/dashboard/applications/[id]` — Detailed application view, status timeline, document viewer, signature metadata.
- `/dashboard/software` — Software catalog management.
- `/dashboard/licenses` — User licenses grid.
- `/dashboard/licenses/[id]` — Visual digital license certificate view & PDF export.
- `/dashboard/documents` — User repository of uploaded documents.
- `/dashboard/notifications` — Notification center.
- `/dashboard/activity` — Personal security & operation history.
- `/dashboard/profile` — Profile settings & active sessions.

### Admin Dashboard Routes
- `/admin` — System overview KPIs, review metrics, chart visualization.
- `/admin/applications` — Global applications queue, reviewer assignment, SLA indicators.
- `/admin/applications/[id]` — Application audit & decision portal (Approve, Reject, Request Info).
- `/admin/users` — User management, role assignment, account status toggle.
- `/admin/software` — System-wide software registry audit.
- `/admin/licenses` — Global license management (Issue, Suspend, Revoke, Extend).
- `/admin/notifications` — Broadcast notification engine.
- `/admin/activity` — System-wide audit log with CSV export.
- `/admin/settings` — Platform configuration, feature flags, license parameters.

---

## 7. Design Tokens & UI Component Inventory

### Colors & Styling System
- **Theme**: Dark / Light system-aware CSS Variables (`bg-background`, `text-foreground`, `border-border`).
- **Primary Color**: Deep Indigo / Violet (`#4F46E5` / `#6366F1`).
- **Verification Green**: Vibrant Emerald (`#10B981`) for valid cryptographic signatures and issued licenses.
- **Alert Red**: Rose Crimson (`#F43F5E`) for rejection reasons or invalid tamper detections.
- **Glassmorphism**: Backdrop blur cards (`backdrop-blur-md bg-card/80 border-border/50`).

### Reusable UI Components
1. `Button`, `Badge`, `Input`, `Select`, `Textarea`, `Checkbox`, `Dialog`, `DropdownMenu`, `Tabs`, `Tooltip`, `Toast`
2. `FileUpload` (drag-and-drop, drag state highlight, progress, MIME check, safe preview)
3. `DigitalSignatureCard` (SHA-256 hash display, fingerprint badge, verification trigger)
4. `ProgressTimeline` (interactive state machine status tracker)
5. `CertificateViewer` (printable/downloadable digital license layout with verification QR box)
6. `DataTable` (sortable, searchable, paginated table component)
7. `CommandPalette` (Cmd+K global search modal for quick navigation)
8. `Skeleton`, `EmptyState`, `ErrorState` (graceful feedback components)

---

## 8. Extensibility Points

- **Signature Provider Adapter**: Implement `SignatureProvider` interface to bridge to government ECP hardware tokens (NCALayer / PKCS#11 / WebCrypto).
- **Cloud Storage Adapter**: Implement `StorageProvider` interface to swap local disk storage for AWS S3 / Azure Blob Storage.
- **Multi-Channel Notification Adapter**: Implement `NotificationChannel` interface to hook up SendGrid / Amazon SES / Twilio SMS.
- **i18n Localization**: Pre-configured JSON dictionary loader (`lib/i18n.ts`) ready for translation files.

---

## 9. Identified Gaps & Solutions

1. **Tamper Prevention Requirement**: If a user modifies form data after signing, the system invalidates the existing digital signature, creates an audit log entry, and resets the status to `DRAFT`.
2. **Review SLA & Deadlines**: Added `reviewDeadline` computation to applications to highlight overdue review items in the admin queue.
3. **Public Verification Privacy**: `/verify-license` returns minimal public metadata (software, status, validity dates, signature fingerprint) without leaking PII.
