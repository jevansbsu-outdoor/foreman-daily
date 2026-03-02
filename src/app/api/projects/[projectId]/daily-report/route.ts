import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const QuerySchema = z.object({ date: z.string().min(8) }); // YYYY-MM-DD

function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? "";
  const parsed = QuerySchema.safeParse({ date });
  if (!parsed.success) return NextResponse.json({ error: "date=YYYY-MM-DD required" }, { status: 400 });

  const projectId = params.projectId;
  const reportDate = parseDate(date);

  const report = await prisma.dailyReport.upsert({
    where: { projectId_reportDate: { projectId, reportDate } },
    update: {},
    create: { projectId, reportDate },
    include: {
      crew: { include: { employee: true, costCode: true } },
      equipment: { include: { equipment: true, costCode: true } },
      quantities: { include: { payItem: true } },
      photos: true,
    },
  });

  const payItems = await prisma.payItem.findMany({ where: { projectId }, orderBy: { itemNo: "asc" } });
  const costCodes = await prisma.costCode.findMany({ where: { projectId, active: true }, orderBy: { code: "asc" } });
  const employees = await prisma.employee.findMany({ where: { projectId, active: true }, orderBy: { name: "asc" } });
  const equipment = await prisma.equipment.findMany({ where: { projectId, active: true }, orderBy: { description: "asc" } });

  const quantitiesByPayItemId: Record<string, { qty: number; note?: string }> = {};
  for (const q of report.quantities) quantitiesByPayItemId[q.payItemId] = { qty: q.qty, note: q.note ?? undefined };

  return NextResponse.json({ report, payItems, quantitiesByPayItemId, costCodes, employees, equipment });
}
