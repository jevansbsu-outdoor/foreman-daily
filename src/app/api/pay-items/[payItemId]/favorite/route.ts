import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({ isFavorite: z.boolean() });

type Ctx = { params: { payItemId: string } };

export async function POST(req: Request, ctx: Ctx) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.payItem.update({
    where: { id: ctx.params.payItemId },
    data: { isFavorite: parsed.data.isFavorite },
  });

  return NextResponse.json({ ok: true, payItem: updated });
}
