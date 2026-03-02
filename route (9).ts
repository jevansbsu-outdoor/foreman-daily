import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  client: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateProjectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const project = await prisma.project.create({ data: parsed.data });
  return NextResponse.json({ project });
}

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ projects });
}
