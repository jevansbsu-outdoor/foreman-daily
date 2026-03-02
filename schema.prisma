generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String
  role         String   @default("admin") // admin | foreman | viewer
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Project {
  id        String   @id @default(cuid())
  name      String
  client    String?
  location  String?
  startDate DateTime?
  createdAt DateTime @default(now())

  costCodes  CostCode[]
  payItems   PayItem[]
  employees  Employee[]
  equipment  Equipment[]
  reports    DailyReport[]
  photos     Photo[]
}

model CostCode {
  id          String  @id @default(cuid())
  projectId   String
  code        String
  description String
  active      Boolean @default(true)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  crewEntries      DailyCrewEntry[]
  equipmentEntries DailyEquipmentEntry[]
  quantityEntries  DailyQuantityEntry[]

  @@unique([projectId, code])
  @@index([projectId])
}

model PayItem {
  id          String  @id @default(cuid())
  projectId   String
  itemNo      String
  altItemNo   String?
  description String
  unit        String
  contractQty Float?
  unitPrice   Float?
  isFavorite  Boolean @default(false)

  defaultCostCodeId String?
  defaultCostCode   CostCode? @relation(fields: [defaultCostCodeId], references: [id])

  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  quantities DailyQuantityEntry[]

  @@unique([projectId, itemNo])
  @@index([projectId])
}

model Employee {
  id         String  @id @default(cuid())
  projectId  String
  employeeId String
  name       String
  workClass  String?
  active     Boolean @default(true)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  entries DailyCrewEntry[]

  @@unique([projectId, employeeId])
  @@index([projectId])
}

model Equipment {
  id          String  @id @default(cuid())
  projectId   String
  equipmentId String
  description String
  active      Boolean @default(true)

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  entries DailyEquipmentEntry[]

  @@unique([projectId, equipmentId])
  @@index([projectId])
}

model DailyReport {
  id          String   @id @default(cuid())
  projectId   String
  reportDate  DateTime

  foremanId   String?
  foremanName String?
  inspector   String?
  hoursFrom   String?  // "07:00"
  hoursTo     String?  // "17:00"

  weatherAM   String?
  weatherPM   String?
  tempHigh    Float?
  tempLow     Float?
  precip      Float?

  groundCondition String?
  dayType         String? // "Work Day" / "Non-Work Day"
  spreadStation   String?

  workPerformed String?
  delays        String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  crew       DailyCrewEntry[]
  equipment  DailyEquipmentEntry[]
  quantities DailyQuantityEntry[]
  photos     Photo[]

  @@unique([projectId, reportDate])
  @@index([projectId, reportDate])
}

model DailyCrewEntry {
  id            String  @id @default(cuid())
  dailyReportId String
  employeeId    String
  regularHours  Float
  workClass     String?
  costCodeId    String

  costCode   CostCode   @relation(fields: [costCodeId], references: [id])
  dailyReport DailyReport @relation(fields: [dailyReportId], references: [id], onDelete: Cascade)
  employee    Employee   @relation(fields: [employeeId], references: [id])

  @@index([dailyReportId])
}

model DailyEquipmentEntry {
  id            String @id @default(cuid())
  dailyReportId String
  equipmentId   String
  workTimeHours Float
  costCodeId    String

  costCode    CostCode    @relation(fields: [costCodeId], references: [id])
  dailyReport DailyReport @relation(fields: [dailyReportId], references: [id], onDelete: Cascade)
  equipment   Equipment   @relation(fields: [equipmentId], references: [id])

  @@index([dailyReportId])
}

model DailyQuantityEntry {
  id            String @id @default(cuid())
  dailyReportId String
  payItemId     String
  qty           Float
  note          String?
  costCodeId    String?

  costCode    CostCode?    @relation(fields: [costCodeId], references: [id])
  dailyReport DailyReport @relation(fields: [dailyReportId], references: [id], onDelete: Cascade)
  payItem     PayItem     @relation(fields: [payItemId], references: [id], onDelete: Cascade)

  @@unique([dailyReportId, payItemId])
  @@index([dailyReportId])
}

model Photo {
  id            String   @id @default(cuid())
  projectId     String
  dailyReportId String?
  filePath      String
  caption       String?
  takenAt       DateTime?
  uploadedBy    String?
  uploadedAt    DateTime @default(now())

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  dailyReport DailyReport? @relation(fields: [dailyReportId], references: [id], onDelete: Cascade)

  @@index([projectId])
}
