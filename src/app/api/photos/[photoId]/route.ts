import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ photoId: string }> }
) {
  const { photoId } = await context.params;

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  return NextResponse.json(photo);
}
