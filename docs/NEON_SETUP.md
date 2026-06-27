# Neon Database & Auth Setup Guide

This document describes how to set up Neon PostgreSQL and Neon Auth for CaseCipher.

## Prerequisites

- Node.js 18+
- A Neon account ([console.neon.tech](https://console.neon.tech))

## 1. Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click "New Project"
3. Name it "casecipher" (or your preferred name)
4. Select your preferred region (closer to your users = lower latency)
5. Click "Create Project"

## 2. Enable Neon Auth

1. In your Neon project, go to **Settings** → **Auth**
2. Click **Enable Auth**
3. Configure OAuth providers (optional):
   - Google OAuth (Neon provides shared credentials for testing)
   - GitHub OAuth
4. Copy the **Auth URL** (looks like `https://auth.neon.tech/project/xxx`)

## 3. Get Database Connection String

1. In your Neon project dashboard, find the **Connection Details** panel
2. Copy the **Connection string** (starts with `postgres://...`)
3. Make sure to include `?sslmode=verify-full` at the end

## 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Neon Database
DATABASE_URL=postgres://user:password@ep-xxx.us-east-1.aws.neon.tech/casecipher?sslmode=verify-full

# Neon Auth
NEXT_PUBLIC_NEON_AUTH_URL=https://auth.neon.tech/project/xxx
```

## 5. Run Database Migrations

Generate and apply the schema:

```bash
# Generate migration files from schema
npm run db:generate

# Push schema to database (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate
```

## 6. Apply Row Level Security (Optional)

For enhanced security, apply RLS policies:

```bash
# Connect to your database and run the RLS policies
# You can use Neon's SQL Editor in the console
# or use psql/any PostgreSQL client
```

The RLS policies are in `drizzle/rls-policies.sql`.

## 7. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/auth/sign-in` to test authentication.

## Database Schema

The database includes the following tables:

| Table | Description |
|-------|-------------|
| `neon_auth.*` | Managed by Neon Auth (users, sessions, accounts) |
| `user_profiles` | Extended user data (role, badge number, active status) |
| `clients` | Client/organization records |
| `cases` | Case records with status, priority, assignment |
| `evidence` | Evidence/attachments linked to cases |
| `case_notes` | Notes on cases |
| `audit_log` | Audit trail of all actions |

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all features |
| `manager` | Manage cases and users, view all cases |
| `analyst` | Create/edit assigned cases, upload evidence |
| `examiner` | Read-only access to assigned cases |

## Drizzle Commands

```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Run pending migrations
npm run db:push      # Push schema directly (development)
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Troubleshooting

### "DATABASE_URL environment variable is required"

Make sure your `.env.local` file exists and contains the `DATABASE_URL`.

### "NEXT_PUBLIC_NEON_AUTH_URL environment variable is required"

Make sure your `.env.local` file contains `NEXT_PUBLIC_NEON_AUTH_URL`.

### Authentication not working

1. Check that Neon Auth is enabled in your project
2. Verify the Auth URL is correct
3. Check browser console for errors

### Database connection errors

1. Verify your connection string is correct
2. Make sure `?sslmode=verify-full` is included
3. Check that your IP is not blocked (Neon allows all IPs by default)
