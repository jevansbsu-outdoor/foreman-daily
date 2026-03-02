import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(req: Request, { params }: { params: { photoId: string } }) {
  const uploadDir = process.env.UPLOAD_DIR;
  if (!uploadDir) return new NextResponse("UPLOAD_DIR not set", { status: 500 });

  const photo = await prisma.photo.findUnique({ where: { id: params.photoId } });
  if (!photo) return new NextResponse("Not found", { status: 404 });

  const fullpath = path.join(uploadDir, photo.filePath);
  try {
    const data = await fs.readFile(fullpath);
    // naive content-type
    const lower = photo.filePath.toLowerCase();
    const contentType =
      lower.endsWith(".png") ? "image/png" :
      (lower.endsWith(".webp") ? "image/webp" :
      (lower.endsWith(".gif") ? "image/gif" : "image/jpeg"));

    return new NextResponse(data, { headers: { "Content-Type": contentType, "Cache-Control": "no-store" } });
  } catch {
    return new NextResponse("File missing on server", { status: 404 });
  }
}
