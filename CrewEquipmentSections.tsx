import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const RowSchema = z.object({
  itemNo: z.string().min(1),
  altItemNo: z.string().optional().nullable(),
  description: z.string().min(1),
  contractQty: z.number().optional().nullable(),
  unit: z.string().min(1),
  unitPrice: z.number().optional().nullable(),
});

const BodySchema = z.object({ rows: z.array(RowSchema).min(1) });

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const projectId = params.projectId;
  const results = [];
  for (const r of parsed.data.rows) {
    const row = await prisma.payItem.upsert({
      where: { projectId_itemNo: { projectId, itemNo: r.itemNo } },
      update: {
        altItemNo: r.altItemNo ?? null,
        description: r.description,
        unit: r.unit,
        contractQty: r.contractQty ?? null,
        unitPrice: r.unitPrice ?? null,
      },
      create: {
        projectId,
        itemNo: r.itemNo,
        altItemNo: r.altItemNo ?? null,
        description: r.description,
        unit: r.unit,
        contractQty: r.contractQty ?? null,
        unitPrice: r.unitPrice ?? null,
      },
    });
    results.push(row);
  }
  return NextResponse.json({ ok: true, count: results.length });
}
