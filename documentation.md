# Developer Documentation

## Project Overview

This is a Next.js 16 educational platform with role-based access control, supporting multiple user types: Students, Instructors, Admins, and internal HR/PM/BD roles. The platform handles authentication, user management, programme/course organization, and instructor-student interactions.

## Tech Stack

- **Framework**: Next.js 16.2.9 with App Router
- **Runtime**: Node.js (TypeScript)
- **Frontend**: React 19 with Tailwind CSS 4
- **Database**: MongoDB with Mongoose 9
- **Authentication**: JWT (jsonwebtoken 9.0.3) + bcrypt
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Form Validation**: Zod 4.4.3
- **Data Fetching**: TanStack React Query 5
- **Email**: Mailgun
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin dashboard & user management
│   ├── instructor/        # Instructor features (evaluations, messaging, students)
│   ├── student/           # Student dashboard
│   ├── api/               # API routes (auth, admin, webhooks)
│   ├── login/             # Login page
│   ├── logout/            # Logout page
│   ├── internal/          # Internal training tracks (HR/PM/BD)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home/landing page
│   └── globals.css        # Global Tailwind styles
├── auth/                  # Authentication utilities
│   ├── server.ts          # JWT, password hashing, role routes
│   └── client.ts          # Client-side auth helpers
├── components/            # Reusable UI components
│   ├── ui/                # shadcn/ui base components
│   ├── theme/             # Theme provider & toggle
│   ├── misc/              # Utility components (placeholder-guard, superuser-bubble)
│   └── [Feature].tsx      # Feature-specific components
├── db/                    # Database utilities
│   └── mongodb.ts         # Mongoose connection
├── models/                # Mongoose schemas
│   └── userModel.ts       # User document schema
├── types/                 # TypeScript interfaces
│   └── userDoc.ts         # User type definitions
├── schema/                # Zod validation schemas
│   └── userSchema.ts      # User validation
├── hooks/                 # React hooks
│   └── use-current-user.tsx  # Current user context hook
├── lib/                   # Utilities
│   └── mock-data.ts       # Test/development data
├── utils/                 # Helper functions
│   └── badgeColor.ts      # Role badge color mappings
├── mail/                  # Email templates & utilities
├── proxy.ts               # Proxy utilities
└── scripts/               # Utility scripts
    └── seed.ts            # Database seeding
```

## Authentication & Authorization

### User Roles

```typescript
type AuthRole = "Student" | "Instructor" | "Admin" | 
                "Human Resources" | "Project Management" | "Business Development";
```

### Role Home Routes
- **Student** → `/student`
- **Instructor** → `/instructor`
- **Admin** → `/admin`
- **Human Resources / Project Management / Business Development** → `/internal`

### JWT & Cookies

- Token payload includes: `userId`, `name`, `username`, `email`, `role`
- Token expiration: 30 days
- Session stored in `session` cookie
- Passwords hashed with bcryptjs (10 salt rounds)

### Key Auth Files

- `src/auth/server.ts` - Password hashing, JWT signing/verification
- `src/auth/client.ts` - Client-side auth helpers
- `src/hooks/use-current-user.tsx` - Get current user context

## API Routes

### Authentication

- `POST /api/auth/login` - User login, returns JWT cookie
- `POST /api/auth/logout` - Logout, clears session
- `GET /api/auth/me` - Get current authenticated user

### Admin

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/[id]` - Get user by ID
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Webhooks

- `POST /api/webhooks/wix` - Wix integration webhook (third-party events)

## Database

### MongoDB Connection

Use `src/db/mongodb.ts` to establish connection:
```typescript
import { connectToDatabase } from "@/db/mongodb";

// Call in API routes:
await connectToDatabase();
```

### User Document

```typescript
// src/types/userDoc.ts
interface User {
  _id?: ObjectId;
  userId: string;           // Unique ID (auto-generated)
  name: string;
  username: string;         // Unique, lowercase
  email: string;            // Unique, lowercase
  password: string;         // Hashed
  salt: string;
  role: AuthRole;
  verified: "pending" | "complete";
  createdAt?: Date;
  updatedAt?: Date;
}
```

Collection: `Users`

## Key Components

### Layout Components

- `src/components/portal-shell.tsx` - Main shell for authenticated pages
- `src/components/page-title.tsx` - Page header component
- `src/components/role-badge.tsx` - Badge showing user role

### UI Components (shadcn/ui)

Located in `src/components/ui/`:
- Button, Input, Label, Card, Badge
- Avatar, Dialog, Dropdown Menu
- Progress, Select, Switch

Use these in your pages and features:
```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### Misc Components

- `placeholder-guard.tsx` - Guard against rendering placeholders in production
- `superuser-bubble.tsx` - Dev mode superuser switcher
- `use-placeholder.tsx` - Hook for placeholder detection

### Theme

- `src/components/theme/theme-provider.tsx` - Dark mode provider (next-themes)
- `src/components/theme/theme-toggle.tsx` - Theme toggle button

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` with:
```
DATABASE_URL=mongodb://[your-mongodb-url]
JWT_SECRET=[your-secret-key]
MAILGUN_API_KEY=[your-mailgun-key]
MAILGUN_DOMAIN=[your-mailgun-domain]
```

### 3. Run Development Server
```bash
npm run dev
```
Opens at `http://localhost:3000`

### 4. Database Seeding (Optional)
```bash
npx tsx scripts/seed.ts
```

## Common Tasks

### Creating a New API Route

Create file at `src/app/api/[feature]/route.ts`:

```typescript
import { verifyToken } from "@/auth/server";
import { connectToDatabase } from "@/db/mongodb";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Your logic here
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
```

### Creating a Protected Page

Create file at `src/app/[feature]/page.tsx`:

```tsx
import { cookies } from "next/headers";
import { verifyToken } from "@/auth/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token || !verifyToken(token)) {
    redirect("/login");
  }
  
  const user = verifyToken(token)!;
  
  // Check role if needed
  if (user.role !== "Admin") {
    redirect("/");
  }
  
  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome, {user.name}</p>
    </div>
  );
}
```

### Using React Query

```tsx
import { useQuery } from "@tanstack/react-query";

export function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      return res.json();
    },
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* render data */}</div>;
}
```

### Form Validation with Zod

```tsx
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ chars"),
});

// In component:
const errors = userSchema.safeParse(formData);
if (!errors.success) {
  // Handle validation errors
}
```

## Configuration

### Tailwind CSS

Global styles in `src/app/globals.css`. Uses Tailwind 4 with custom animations from `tw-animate-css`.

### Next.js Config

Check `next.config.ts` for:
- Image optimization
- API redirects/rewrites
- Environment handling

### TypeScript

Strict mode enabled. All files should be properly typed. Check `tsconfig.json`.

## Deployment

### Build
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment in Production
Set all env vars from `.env.local` in your deployment platform (Vercel, AWS, etc.)

## Debugging Tips

1. **Auth Issues**: Check JWT_SECRET matches across environments
2. **Database Connection**: Verify DATABASE_URL is correct and MongoDB is running
3. **Missing Types**: Run `npm run build` to catch TypeScript errors
4. **CORS**: API routes are same-origin, configure if using separate frontend
5. **Role Redirects**: Check `ROLE_HOME` constant in `src/auth/server.ts`

## Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and test
3. Commit with clear messages: `git commit -m "feat: description"`
4. Push and create PR

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last Updated**: 2026-06-23
