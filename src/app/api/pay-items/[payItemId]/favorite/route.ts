import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Schema = z.object({ isFavorite: z.boolean() });

export async function POST(
  req: Request,
  context: { params: { payItemId: string } }
) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.payItem.update({
    where: { id: context.params.payItemId },
    data: { isFavorite: parsed.data.isFavorite },
  });

  return NextResponse.json({ ok: true, payItem: updated });
}
