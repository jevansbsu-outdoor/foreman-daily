# Foreman Daily (V1)

Internal daily report app for civil construction:
- Project setup (bulk paste from Excel): Cost Codes, Employees, Equipment, Pay Items
- Daily report: header + weather + work performed + delays
- Employee hours + Equipment hours (Cost Code required)
- Daily quantities for all pay items (table default + card toggle + filters)
- Photos stored on your server folder (UPLOAD_DIR)

## What you need on the office/server computer
- Windows 10/11 or Windows Server
- Docker Desktop (for the database)
- Node.js 20+ (LTS)

## 1) Start the database
In this folder:

```bash
docker compose up -d
```

## 2) Create your .env
Copy `.env.example` to `.env` and edit:

- `DATABASE_URL` (leave as-is if you’re using the included docker compose)
- `UPLOAD_DIR` (example: `C:/foreman-daily-uploads`)
- `NEXTAUTH_SECRET` (any long random string)
- `NEXTAUTH_URL` (http://localhost:3000)

## 3) Install + migrate + seed
```bash
npm install
npm run migrate
npm run seed
```

The seed creates an admin login:
- email: `admin@example.com`
- password: `ChangeMe123!`

You can change those seed values by setting:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## 4) Run the app
```bash
npm run dev
```

Open:
- http://localhost:3000

## Basic workflow
1. Sign in
2. Create a project
3. Go to Project Setup and paste:
   - Cost Codes (Cost Code | Description)
   - Employees (Employee ID | Name | Work Class)
   - Equipment (Equipment ID | Description)
   - Pay Items (Line item No. | Item No. | Description | Estimated QTY | Unit | Unit Price)
4. Open Today’s Report and enter hours/quantities/photos

## Notes
- Offline editing is not included in V1 (online-first). If you want offline-first sync, we can add it as V2.
- Photo files are written to `UPLOAD_DIR/<projectId>/<YYYY-MM-DD>/...` and served back through `/api/photos/<photoId>`.
