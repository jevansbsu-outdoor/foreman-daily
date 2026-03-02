import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({
  foremanName: z.string().optional().nullable(),
  inspector: z.string().optional().nullable(),
  hoursFrom: z.string().optional().nullable(),
  hoursTo: z.string().optional().nullable(),
  weatherAM: z.string().optional().nullable(),
  weatherPM: z.string().optional().nullable(),
  tempHigh: z.number().optional().nullable(),
  tempLow: z.number().optional().nullable(),
  precip: z.number().optional().nullable(),
  groundCondition: z.string().optional().nullable(),
  dayType: z.string().optional().nullable(),
  spreadStation: z.string().optional().nullable(),
  workPerformed: z.string().optional().nullable(),
  delays: z.string().optional().nullable(),
});

export async function POST(req: Request, { params }: { params: { reportId: string } }) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const report = await prisma.dailyReport.update({
    where: { id: params.reportId },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, report });
}
