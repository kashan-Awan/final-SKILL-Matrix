# Windows Runbook (Skill Matrix Frontend)

This document describes what changes are typically needed to run this Next.js (App Router) project on **Windows** after it was developed/installed on **macOS**.

> Assumptions:
> - You are running the same repository: `skills-matrix-front-final-main`.
> - Backend is running elsewhere (or via Docker/remote). Frontend will call backend APIs configured in `services/api.ts` / `lib/proxy.ts` / `.env.local`.

---

## 1) Prerequisites on Windows

### Install Node.js
- Install **Node.js LTS** (recommended: the same major version used on macOS, usually 18/20).
- Verify:
  - `node -v`
  - `npm -v`

### Install Git (if needed)
- Verify:
  - `git --version`

---

## 2) Environment Variables

### Create/update `.env.local`
Copy the macOS `.env.local` (if you have one) and adjust any OS-specific paths.

Common variables to check:
- API base URL / proxy target (whatever is used by `services/api.ts`)
- Any auth/session-related secrets

> Windows note: environment variables are set the same way in Next.js; only file paths differ.

---

## 3) Install dependencies

### Clean install (recommended when switching OS)
From project root:
- Remove lock artifacts if you use a different package manager:
  - `rm -rf node_modules`
  - (optional) remove `package-lock.json` / `pnpm-lock.yaml` if not matching your chosen package manager

Then run:
- `npm install`

### React/peer-dependency conflicts (important)
This project may currently have dependency conflicts (example observed on macOS):
- `vaul@^0.9.6` peers React versions up to React 18.

If Windows install fails with `ERESOLVE`, common approaches:
- Preferred: downgrade React to 18.x to satisfy peer deps.
- Alternative: `npm install --legacy-peer-deps` (can work but may be unstable).

> To keep behavior consistent across OS, use the same approach you used on macOS after you resolved the conflict.

---

## 4) Run the development server

- `npm run dev`

Then open:
- `http://localhost:3000`

> If you need LAN access (to test phones), use your Windows IP and ensure firewall allows inbound traffic for `node`/`next`.

---

## 5) Build and start (production)

### Production build
- `npm run build`

### Start server
- `npm run start`

---

## 6) Proxy / Backend connectivity

If the frontend uses:
- `fetch("/api/...")` with Next API routes
- or `services/api.ts` with a configured base URL

Then on Windows you only need to ensure:
- Backend host/port is reachable from Windows
- If backend is on `localhost`, ensure you run backend on the same machine or configure Windows to reach it.

Typical Windows gotchas:
- `localhost` works only when backend runs on the same machine.
- If backend runs in Docker, use Docker’s host mapping (often `host.docker.internal`).

---

## 7) File-system / path differences

This is usually handled automatically by Node/Next.
But verify:
- Any hardcoded POSIX paths in code or scripts
- Any scripts that use `/` vs `\` in paths

Best practice on Windows:
- Use `path.join()` in Node scripts (never string-concat paths).

---

## 8) Native modules (mysql/mssql drivers)

This repo uses DB clients like:
- `mssql`
- `mysql2`

These typically work on Windows as pure JS, but if you see native build errors:
- Install Visual Studio Build Tools (MSVC) may be required for some packages.
- Usually this is only needed if a dependency includes native bindings.

---

## 9) Common terminal differences

### Commands
Replace macOS shell commands with Windows equivalents:
- `rm -rf node_modules` → `rmdir /s /q node_modules`

But if you use Git Bash / WSL, POSIX commands work.

### Port conflicts
If port 3000 is in use:
- change Next port in `.env.local` or run `PORT=... npm run dev` (Windows command syntax differs).

---

## 10) ESLint / Next lint prompts

On some setups Next may prompt:
- “How would you like to configure ESLint?”

This prompt is not OS-specific.
It happens when ESLint tooling config hasn’t been installed/configured in the repo.

For CI consistency:
- Prefer configuring ESLint once and committing `.eslintrc*` / `eslint.config.*`.

---

## 11) Recommended verification checklist

On Windows after setup:
1. `npm install` succeeds
2. `npm run dev` starts without errors
3. Visit `/` and key routes:
   - `/employees`
   - `/employee-dashboard`
4. Click “Inspect Skills” and verify it calls the correct endpoint
   - backend endpoint used by frontend: `/api/users/manager/employees/:employeeId/skills`

---

## 12) Notes about the skills “Inspect Skills” integration (current behavior)

The frontend:
- On “Inspect Skills”, fetches skills using the `employeeSkillsService` (backend employee-skills endpoint)
- Converts returned records into the object-map shape expected by `EmployeeInspectionModal`:
  - `{ [skillNameOrId]: level }`

No OS-specific change should be required for this.

---

## 13) What to share with me if Windows setup fails

Send:
- the exact terminal error output from `npm install`
- your `node -v` and `npm -v`
- your `.env.local` values (redact secrets)

---

## File Location
- This doc is created at:
  - `WINDOWS_RUNBOOK.md`

