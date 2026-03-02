export function parseTsv(tsv: string): string[][] {
  return tsv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split("\t").map((c) => c.trim()));
}

export function normHeader(h: string) {
  return (h ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseNumber(s: string): number | null {
  const t = (s ?? "").toString().replace(/[$,]/g, "").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
