import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const RowSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1),
  workClass: z.string().optional().nullable(),
});
const BodySchema = z.object({ rows: z.array(RowSchema).min(1) });

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const projectId = params.projectId;
  const results = [];
  for (const r of parsed.data.rows) {
    const row = await prisma.employee.upsert({
      where: { projectId_employeeId: { projectId, employeeId: r.employeeId } },
      update: { name: r.name, workClass: r.workClass ?? null, active: true },
      create: { projectId, employeeId: r.employeeId, name: r.name, workClass: r.workClass ?? null, active: true },
    });
    results.push(row);
  }
  return NextResponse.json({ ok: true, count: results.length });
}
