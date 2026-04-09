## Komodo Hub (local development)

Komodo Hub is a full-stack conservation platform for Indonesia: moderated public learning content, private school workflows (students/teachers), community contributions, wildlife reporting, and foundation governance.

## Getting Started

### Install, migrate, seed, start

First, install dependencies:

```bash
npm install
```

Create your `.env` from `.env.example` and set a strong `SESSION_SECRET` (min 16 chars).

Run migrations + seed:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Seeded logins (for testing roles)

These accounts are created by `prisma/seed.ts` so teachers/students/admins can log in **without creating accounts**.

**Password for all seeded users:** `KomodoHub!Dev2026`

- **Foundation admin**: `foundation.admin@komodohub.local`
- **School admin**: `school.admin@komodohub.local`
- **Teacher**: `teacher@komodohub.local`
- **Student 1**: `student1@komodohub.local`
- **Student 2**: `student2@komodohub.local`
- **Community admin**: `community.admin@komodohub.local`
- **Community member 1**: `member1@komodohub.local`
- **Community member 2**: `member2@komodohub.local`

**Demo school access code (student join):** `SCHOOL-DEMO-2026`

### Notes

- Public pages: `/library`, `/campaigns`, `/species` (approved items only).
- Protected dashboards enforce role + organisation boundaries.

## Git remote

After you create a GitHub repository:

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin master
```

Use `git branch -M main` and `git push -u origin main` if you prefer the branch name `main`.
