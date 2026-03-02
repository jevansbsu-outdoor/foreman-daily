import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request, { params }: { params: { reportId: string } }) {
  const uploadDir = process.env.UPLOAD_DIR;
  if (!uploadDir) return NextResponse.json({ error: "UPLOAD_DIR not set" }, { status: 500 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const caption = (form.get("caption") as string | null) ?? null;
  const takenAtStr = (form.get("takenAt") as string | null) ?? null;

  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const report = await prisma.dailyReport.findUnique({ where: { id: params.reportId } });
  if (!report) return NextResponse.json({ error: "report not found" }, { status: 404 });

  const date = report.reportDate;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const folder = path.join(uploadDir, report.projectId, `${yyyy}-${mm}-${dd}`);
  await fs.mkdir(folder, { recursive: true });

  const filename = `${Date.now()}_${safeName(file.name || "photo.jpg")}`;
  const fullpath = path.join(folder, filename);
  const bytes = new Uint8Array(await file.arrayBuffer());
  await fs.writeFile(fullpath, bytes);

  const relative = path.join(report.projectId, `${yyyy}-${mm}-${dd}`, filename).replace(/\\/g, "/");

  const photo = await prisma.photo.create({
    data: {
      projectId: report.projectId,
      dailyReportId: report.id,
      filePath: relative,
      caption,
      takenAt: takenAtStr ? new Date(takenAtStr) : null,
    },
  });

  return NextResponse.json({ ok: true, photo });
}
