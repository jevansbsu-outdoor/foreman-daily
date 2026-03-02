import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const UpsertSchema = z.object({
  id: z.string().optional(),
  equipmentId: z.string().min(1),
  costCodeId: z.string().min(1),
  workTimeHours: z.number().min(0),
});
const DeleteSchema = z.object({ id: z.string().min(1) });

export async function POST(req: Request, { params }: { params: { reportId: string } }) {
  const body = await req.json();
  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const reportId = params.reportId;
  const d = parsed.data;

  const row = d.id
    ? await prisma.dailyEquipmentEntry.update({
        where: { id: d.id },
        data: { equipmentId: d.equipmentId, costCodeId: d.costCodeId, workTimeHours: d.workTimeHours },
        include: { equipment: true, costCode: true },
      })
    : await prisma.dailyEquipmentEntry.create({
        data: { dailyReportId: reportId, equipmentId: d.equipmentId, costCodeId: d.costCodeId, workTimeHours: d.workTimeHours },
        include: { equipment: true, costCode: true },
      });

  return NextResponse.json({ ok: true, row });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await prisma.dailyEquipmentEntry.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
