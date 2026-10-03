# RepCore — Alternative Implementation

A development implementation of gym-management workflows using Next.js, React, TypeScript, Supabase and Tailwind CSS.

## Project structure
- Application routes for dashboards, members, attendance, dues, plans, reminders and reports.
- Server actions and API routes for application data workflows.
- Supabase integration for authentication and persistence.

This repository also contains storefront/account routes. The implemented scope is still being consolidated; it should not be assumed to match the other RepCore repository feature-for-feature.

## Portfolio reference
For the documented gym-management project, see [RepCore](https://github.com/jeetuarora2003-gif/repcore). This repository is retained as a separate implementation; neither version is claimed to supersede the other.

## Development
Use the Node.js and pnpm versions specified in `package.json`.

```sh
pnpm install
pnpm dev
```

Configure your own Supabase environment and database before evaluating authenticated workflows. Do not commit credentials.

```sh
pnpm lint
pnpm build
```
