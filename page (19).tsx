import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const RowSchema = z.object({ equipmentId: z.string().min(1), description: z.string().min(1) });
const BodySchema = z.object({ rows: z.array(RowSchema).min(1) });

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const projectId = params.projectId;
  const results = [];
  for (const r of parsed.data.rows) {
    const row = await prisma.equipment.upsert({
      where: { projectId_equipmentId: { projectId, equipmentId: r.equipmentId } },
      update: { description: r.description, active: true },
      create: { projectId, equipmentId: r.equipmentId, description: r.description, active: true },
    });
    results.push(row);
  }
  return NextResponse.json({ ok: true, count: results.length });
}
