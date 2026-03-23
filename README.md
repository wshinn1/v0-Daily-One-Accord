# Daily One Accord

A comprehensive, enterprise-grade church management SaaS platform designed to eliminate communication fragmentation in churches and ministry organizations. Unifies member management, event coordination, visitor follow-up, donations/giving, attendance tracking, and team collaboration — all integrated with Slack for seamless real-time communication.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)

---

## Features

### Member & Visitor Management
- Kanban-style visitor tracking pipeline with drag-and-drop
- Custom fields, labels, comments, attachments, and checklist workflows
- Automated follow-up notifications and assignment tracking
- Member directory with groups, contact info, and engagement history

### Online Giving Platform
- Stripe Connect integration for donation processing
- Recurring donation management
- Multiple giving funds and campaigns
- Year-end tax statement generation
- Donor analytics and reporting

### Event & Service Planning
- Event rundowns with time-based modules and team assignments
- Worship song management with key, tempo, and arrangement notes
- Calendar integration and Slack publishing
- Attendance tracking with custom categories

### Communication Hub
- Multi-channel notifications (Slack, Email, SMS)
- Bulk SMS campaigns with recipient filtering
- Email template builder with analytics tracking
- Scheduled alerts and automated messaging

### Team Collaboration
- Multi-board Kanban system with custom fields
- Card reminders, comments with @mentions, and activity logs
- Slack-to-platform notification bridges
- Board templates for standardized workflows

### Admin & Analytics
- Super admin dashboard for platform management
- Blog/CMS system for marketing site
- Feature flags for controlled rollouts
- Subscription and billing management
- Audit logging and user activity tracking

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 | App Router with React Server Components |
| React 19 | UI framework |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling with `tailwindcss-animate` |
| shadcn/ui | Component library (Radix UI primitives) |
| Recharts | Data visualization |
| @dnd-kit | Drag-and-drop functionality |
| react-hook-form + Zod | Form handling and validation |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Supabase | PostgreSQL database (113 tables) |
| Row Level Security | Data isolation and security |
| Supabase Auth | Authentication |
| Inngest | Background jobs and scheduled workflows |
| Upstash Redis | Caching and rate limiting |

### Integrations
| Service | Purpose |
|---------|---------|
| Stripe | Payments, subscriptions, Stripe Connect |
| Slack API | Bot integration, webhooks, OAuth |
| Telnyx | SMS messaging and bulk campaigns |
| Resend | Transactional and marketing email |
| Vercel Blob | File storage |
| Zoom | Video meeting integration |
| Google Drive | Document management |
| GroupMe | Message bridging |

### DevOps & Monitoring
| Technology | Purpose |
|------------|---------|
| Vercel | Deployment platform |
| Sentry | Error monitoring |
| Vercel Analytics | Performance analytics |
| ESLint 9 + Prettier 3 | Code quality |
| Husky + lint-staged | Git hooks |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Marketing Site                           │
│         (Landing, Features, Pricing, Blog, Contact)             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js 15 App Router                      │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│    │    Auth      │  │   Dashboard  │  │  Super Admin │        │
│    │   (Login,    │  │  (Members,   │  │  (Platform   │        │
│    │   Register)  │  │   Events,    │  │   Mgmt)      │        │
│    │              │  │   Giving)    │  │              │        │
│    └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer (200+ Routes)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Members │ │ Events  │ │ Giving  │ │ Comms   │ │ Webhooks│  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
┌───────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│     Supabase      │ │     Inngest     │ │    Integrations     │
│  ┌─────────────┐  │ │  ┌───────────┐  │ │  ┌──────┐ ┌──────┐ │
│  │ PostgreSQL  │  │ │  │ Scheduled │  │ │  │Stripe│ │Slack │ │
│  │ (113 tables)│  │ │  │   Jobs    │  │ │  └──────┘ └──────┘ │
│  └─────────────┘  │ │  └───────────┘  │ │  ┌──────┐ ┌──────┐ │
│  ┌─────────────┐  │ │  ┌───────────┐  │ │  │Telnyx│ │Resend│ │
│  │     RLS     │  │ │  │ Workflows │  │ │  └──────┘ └──────┘ │
│  │  Policies   │  │ │  └───────────┘  │ │                     │
│  └─────────────┘  │ │                 │ │                     │
└───────────────────┘ └─────────────────┘ └─────────────────────┘
```

### Key Architecture Patterns

- **Multi-tenant SaaS** — Tenant isolation with organization-scoped data
- **Role-based Access Control (RBAC)** — Super Admin, Lead Admin, Admin, Member
- **Row Level Security (RLS)** — Database-level security policies on all 113 tables
- **Webhook-driven Integrations** — Stripe, Slack, Telnyx event processing
- **OAuth 2.0 Flows** — Slack, Stripe Connect, Zoom authentication
- **Event-driven Architecture** — Inngest for durable workflows and scheduled jobs
- **Feature Flags** — Controlled rollouts and A/B testing

---

## Database Schema

The application uses **113 PostgreSQL tables** with Row Level Security policies. Key domains include:

| Domain | Tables | Description |
|--------|--------|-------------|
| Organizations | `organizations`, `organization_members`, `roles` | Multi-tenant structure |
| Members | `members`, `member_groups`, `custom_fields` | Member management |
| Visitors | `visitors`, `visitor_pipeline_*`, `checklist_*` | Kanban visitor tracking |
| Events | `events`, `event_modules`, `event_teams` | Service planning |
| Giving | `donations`, `giving_funds`, `recurring_donations` | Financial management |
| Communication | `alerts`, `sms_campaigns`, `email_templates` | Multi-channel messaging |
| Boards | `boards`, `board_cards`, `card_comments` | Kanban collaboration |
| Integrations | `slack_*`, `stripe_*`, `zoom_*` | Third-party connections |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Stripe account
- Slack app (for Slack integration)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

# Telnyx (SMS)
TELNYX_API_KEY=
TELNYX_MESSAGING_PROFILE_ID=

# Resend (Email)
RESEND_API_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Vercel
BLOB_READ_WRITE_TOKEN=
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/daily-one-accord.git

# Navigate to the project
cd daily-one-accord

# Install dependencies
pnpm install

# Run database migrations
# (Apply SQL migrations from /scripts folder to your Supabase instance)

# Start development server
pnpm dev
```

---

## Project Structure

```
├── app/
│   ├── (marketing)/          # Public marketing pages
│   │   ├── page.tsx          # Landing page
│   │   ├── features/         # Features page
│   │   ├── pricing/          # Pricing page
│   │   └── ...
│   ├── (auth)/               # Authentication pages
│   ├── (dashboard)/          # Protected dashboard routes
│   ├── (super-admin)/        # Platform admin routes
│   └── api/                  # API routes (200+)
│       ├── auth/
│       ├── members/
│       ├── events/
│       ├── giving/
│       ├── webhooks/
│       └── ...
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── marketing/            # Marketing site components
│   ├── dashboard/            # Dashboard components
│   └── ...
├── lib/
│   ├── supabase/             # Supabase client utilities
│   ├── stripe/               # Stripe utilities
│   └── utils.ts              # Shared utilities
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
└── scripts/                  # Database migrations
```

---

## Security

- **Row Level Security (RLS)** on all 113 database tables
- **Role-based Access Control** with 4 permission levels
- **Webhook Signature Verification** for Stripe, Slack, Telnyx
- **Rate Limiting** with Upstash Redis
- **Input Validation** with Zod schemas
- **Secure Authentication** via Supabase Auth
- **Environment-based Configuration** for staging/production isolation

---

## Deployment

The application is deployed on **Vercel** with:

- Edge functions for API routes
- Automatic preview deployments
- Vercel Analytics and Speed Insights
- Sentry error monitoring
- Environment variable management

---

## License

This project is proprietary software. All rights reserved.

---

## Development Approach

Built using a **spec-driven development approach** — architecture and data modeling planned in markdown before execution, then developed collaboratively using **v0.app**, **Cursor**, and **GitHub Copilot**.
