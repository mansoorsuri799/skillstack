# SkillStack

Corporate site for **SkillStack.com.pk** — web development, SEO, keyword ranking, and ad monetization.

## Stack

- Next.js (App Router)
- Tailwind CSS
- Framer Motion (scroll-stack + entrance motion)

## Develop

```bash
cp .env.example .env.local
# fill MONGODB_URI, AUTH_SECRET, SMTP_* values
npm install
npm run dev
```

### Auth

- `/register` — create account + verification email (Nodemailer)
- `/verify-email?token=...` — activate account
- `/login` — NextAuth credentials sign-in

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
