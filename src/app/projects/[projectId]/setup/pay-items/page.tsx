"use client";

import { useMemo, useState } from "react";
import { parseTsv, normHeader, parseNumber } from "@/lib/tsv";

type ParsedRow = {
  itemNo: string;
  altItemNo?: string | null;
  description: string;
  contractQty?: number | null;
  unit: string;
  unitPrice?: number | null;
};

export default function PayItemsSetupPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [paste, setPaste] = useState("");
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const parsed = useMemo(() => {
    setMsg("");
    if (!paste.trim()) return { rows: [] as ParsedRow[], errors: [] as string[] };

    const grid = parseTsv(paste);
    if (grid.length < 2) return { rows: [] as ParsedRow[], errors: ["Paste must include header row + at least 1 data row."] };

    const headers = grid[0].map(normHeader);
    const idx = (name: string) => headers.findIndex(h => h === normHeader(name));

    const iLineItemNo = idx("Line item No.") >= 0 ? idx("Line item No.") : idx("Line item No");
    const iItemNo = idx("Item No.") >= 0 ? idx("Item No.") : idx("Item No");
    const iDesc = idx("Description");
    const iQty = idx("Estimated QTY") >= 0 ? idx("Estimated QTY") : idx("Estimated Qty");
    const iUnit = idx("Unit");
    const iUnitPrice = idx("Unit Price");

    const errors: string[] = [];
    if (iLineItemNo < 0) errors.push("Missing header: Line item No.");
    if (iDesc < 0) errors.push("Missing header: Description");
    if (iUnit < 0) errors.push("Missing header: Unit");
    if (errors.length) return { rows: [] as ParsedRow[], errors };

    const rows: ParsedRow[] = [];
    for (let r = 1; r < grid.length; r++) {
      const row = grid[r];
      const itemNo = (row[iLineItemNo] ?? "").trim();
      const description = (row[iDesc] ?? "").trim();
      const unit = (row[iUnit] ?? "").trim();
      if (!itemNo || !description || !unit) continue;

      rows.push({
        itemNo,
        altItemNo: iItemNo >= 0 ? ((row[iItemNo] ?? "").trim() || null) : null,
        description,
        contractQty: iQty >= 0 ? parseNumber(row[iQty] ?? "") : null,
        unit,
        unitPrice: iUnitPrice >= 0 ? parseNumber(row[iUnitPrice] ?? "") : null,
      });
    }

    if (rows.length === 0) return { rows, errors: ["No valid rows found (itemNo/description/unit required)."] };
    return { rows, errors: [] as string[] };
  }, [paste]);

  async function importRows() {
    setMsg("");
    if (parsed.errors.length) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pay-items/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(`Import failed: ${JSON.stringify(data)}`);
      else setMsg(`Imported ${data.count} pay items.`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <h2>Project Setup — Pay Items</h2>

      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Paste directly from Excel with headers:
        <br />
        <code>Line item No.</code>, <code>Item No.</code>, <code>Description</code>, <code>Estimated QTY</code>, <code>Unit</code>, <code>Unit Price</code>
      </p>

      <textarea
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste Excel table here…"
        style={{ width: "100%", height: 180, padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
      />

      {parsed.errors.length > 0 && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #f3c", borderRadius: 12, background: "#fff6fb" }}>
          <strong>Fix these:</strong>
          <ul>
            {parsed.errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={importRows}
          disabled={importing || parsed.rows.length === 0 || parsed.errors.length > 0}
          style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #999", background: "#f2f2f2", cursor: "pointer" }}
        >
          {importing ? "Importing…" : "Import Pay Items"}
        </button>
        <div style={{ opacity: 0.85 }}>{msg}</div>
      </div>

      <h3 style={{ marginTop: 18 }}>Preview ({parsed.rows.length})</h3>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 120px 1fr 110px 80px 120px", gap: 8, padding: 10, fontWeight: 700, borderBottom: "1px solid #eee" }}>
          <div>Line item No.</div>
          <div>Item No.</div>
          <div>Description</div>
          <div>Est. Qty</div>
          <div>Unit</div>
          <div>Unit Price</div>
        </div>
        {parsed.rows.slice(0, 25).map((r) => (
          <div key={r.itemNo} style={{ display: "grid", gridTemplateColumns: "120px 120px 1fr 110px 80px 120px", gap: 8, padding: 10, borderBottom: "1px solid #f3f3f3" }}>
            <div>{r.itemNo}</div>
            <div>{r.altItemNo ?? ""}</div>
            <div>{r.description}</div>
            <div>{r.contractQty ?? ""}</div>
            <div>{r.unit}</div>
            <div>{r.unitPrice ?? ""}</div>
          </div>
        ))}
        {parsed.rows.length > 25 && <div style={{ padding: 10, opacity: 0.75 }}>Showing first 25 rows…</div>}
      </div>
    </div>
  );
}
