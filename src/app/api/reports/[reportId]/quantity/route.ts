import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({
  payItemId: z.string().min(1),
  qty: z.number(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { reportId: string } }) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { payItemId, qty, note } = parsed.data;
  const reportId = params.reportId;

  const isEmpty = (!qty || qty === 0) && (!note || note.trim() === "");
  if (isEmpty) {
    await prisma.dailyQuantityEntry.deleteMany({ where: { dailyReportId: reportId, payItemId } });
    return NextResponse.json({ ok: true, deleted: true });
  }

  const row = await prisma.dailyQuantityEntry.upsert({
    where: { dailyReportId_payItemId: { dailyReportId: reportId, payItemId } },
    update: { qty, note: note ?? null },
    create: { dailyReportId: reportId, payItemId, qty, note: note ?? null },
  });

  return NextResponse.json({ ok: true, row });
}
