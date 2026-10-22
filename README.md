# Venedict Chen, portfolio

Next.js 15 + Tailwind CSS 4. The page is server-rendered; only the mobile menu
and the contact form run JavaScript in the browser.

## Run it

```bash
bun install
bun dev        # http://localhost:3000
bun run build  # check before deploying
```

The contact form needs these environment variables (EmailJS):
`NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`,
`NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`.

## Where the content lives

| What | File |
| --- | --- |
| CV link, email, GitHub, LinkedIn | `src/app/(routes)/constants.ts` |
| Hero text and career route | `src/app/(routes)/hero/index.tsx` |
| About text and skills | `src/app/(routes)/about/index.tsx` |
| Experience | `src/app/(routes)/experience/constant/index.ts` |
| Projects (Bikun Tracker is `FEATURED`) | `src/app/(routes)/projects/constants.ts` |
| Articles | `src/app/(routes)/writing/index.tsx` |
| Colors | top of `src/app/globals.css` |
