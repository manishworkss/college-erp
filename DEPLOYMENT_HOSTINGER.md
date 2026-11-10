# Hostinger Deployment Guide for MKR College ERP

This guide provides step-by-step instructions to deploy the **MKR College ERP** on **Hostinger** (Business Web Hosting, Cloud Hosting, or VPS) using **MySQL** and **Node.js**.

---

## 1. Database Setup in Hostinger hPanel
1. Log into your [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Databases** → **Management**.
3. Create a new MySQL database:
   - **Database Name**: e.g., `u123456789_mkr_erp`
   - **Username**: e.g., `u123456789_erpuser`
   - **Password**: Create a strong password.
4. Copy the MySQL hostname (usually `localhost` or `127.0.0.1:3306`).

---

## 2. Environment Variables Configuration
In your project root (or inside Hostinger's Node.js App Manager environment variables tab), configure `.env`:

```env
DATABASE_URL="mysql://u123456789_erpuser:YourSecurePassword123@localhost:3306/u123456789_mkr_erp?connection_limit=5"
JWT_SECRET="generate-a-random-secure-string-min-32-characters"
NEXT_PUBLIC_APP_URL="https://erp.mkrcollege.com"
PORT=3000
NODE_ENV="production"
```

> **Note on `connection_limit=5`**: Hostinger MySQL shared limits concurrent connections. The `?connection_limit=5` parameter prevents `Too many connections` errors under peak traffic.

---

## 3. Deployment Method A: Hostinger Node.js Application Manager
1. In hPanel, navigate to **Websites** → **Node.js**.
2. Click **Create Application**:
   - **Node.js Version**: Select `20.x` (or `18.x`).
   - **Application Root**: `public_html` or subfolder (e.g. `erp`).
   - **Application Startup File**: `server.js` (from `.next/standalone`).
3. Build the application:
   ```bash
   npm install
   npx prisma generate
   npm run build
   ```
4. Copy the standalone build files into your application root:
   - Copy contents of `.next/standalone` into the root.
   - Copy the `.next/static` folder into `.next/standalone/.next/static`.
   - Copy the `public` folder into `.next/standalone/public`.
5. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
6. Start/Restart the Node.js application in hPanel.

---

## 4. Deployment Method B: Hostinger VPS (Docker / PM2)
If using a Hostinger VPS with Ubuntu:
1. Clone the repository into `/var/www/erp`.
2. Install dependencies:
   ```bash
   npm install
   npx prisma generate
   npm run build
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Start with PM2:
   ```bash
   pm2 start .next/standalone/server.js --name "mkr-college-erp"
   pm2 save
   pm2 startup
   ```
5. Configure Nginx reverse proxy to port `3000`.

---

## 5. Maintenance & Diagnostics
* **Prisma Studio**: Inspect data graphically via `npx prisma studio`.
* **Database Backup**: In hPanel, navigate to **Databases** → **phpMyAdmin** → **Export** to take instant SQL snapshots.

