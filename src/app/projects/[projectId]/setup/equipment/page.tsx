"use client";

import { useMemo, useState } from "react";
import { parseTsv, normHeader } from "@/lib/tsv";

type Row = { equipmentId: string; description: string };

export default function EquipmentSetupPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState("");
  const [importing, setImporting] = useState(false);

  const parsed = useMemo(() => {
    setMsg("");
    if (!paste.trim()) return { rows: [] as Row[], errors: [] as string[] };

    const grid = parseTsv(paste);
    if (grid.length < 2) return { rows: [] as Row[], errors: ["Paste must include header row + at least 1 data row."] };

    const headers = grid[0].map(normHeader);
    const idx = (name: string) => headers.findIndex(h => h === normHeader(name));

    const iId = idx("Equipment ID");
    const iDesc = idx("Description");

    const errors: string[] = [];
    if (iId < 0) errors.push("Missing header: Equipment ID");
    if (iDesc < 0) errors.push("Missing header: Description");
    if (errors.length) return { rows: [] as Row[], errors };

    const rows: Row[] = [];
    for (let r = 1; r < grid.length; r++) {
      const equipmentId = (grid[r][iId] ?? "").trim();
      const description = (grid[r][iDesc] ?? "").trim();
      if (!equipmentId || !description) continue;
      rows.push({ equipmentId, description });
    }
    if (!rows.length) return { rows, errors: ["No valid rows found (Equipment ID + Description required)."] };
    return { rows, errors: [] as string[] };
  }, [paste]);

  async function importRows() {
    if (parsed.errors.length) return;
    setImporting(true);
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/equipment/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(`Import failed: ${JSON.stringify(data)}`);
      else setMsg(`Imported ${data.count} equipment items.`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Project Setup — Equipment</h2>
      <p style={{ opacity: 0.85 }}>
        Paste from Excel with headers: <code>Equipment ID</code>, <code>Description</code>
      </p>

      <textarea
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste Excel table here…"
        style={{ width: "100%", height: 170, padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
      />

      {parsed.errors.length > 0 && (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #f3c", borderRadius: 12, background: "#fff6fb" }}>
          <strong>Fix these:</strong>
          <ul>{parsed.errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={importRows}
          disabled={importing || parsed.rows.length === 0 || parsed.errors.length > 0}
          style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #999", background: "#f2f2f2", cursor: "pointer" }}
        >
          {importing ? "Importing…" : "Import Equipment"}
        </button>
        <div style={{ opacity: 0.85 }}>{msg}</div>
      </div>

      <h3 style={{ marginTop: 18 }}>Preview ({parsed.rows.length})</h3>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 8, padding: 10, fontWeight: 700, borderBottom: "1px solid #eee" }}>
          <div>Equipment ID</div>
          <div>Description</div>
        </div>
        {parsed.rows.slice(0, 30).map((r) => (
          <div key={`${r.equipmentId}-${r.description}`} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 8, padding: 10, borderBottom: "1px solid #f3f3f3" }}>
            <div>{r.equipmentId}</div>
            <div>{r.description}</div>
          </div>
        ))}
        {parsed.rows.length > 30 && <div style={{ padding: 10, opacity: 0.75 }}>Showing first 30 rows…</div>}
      </div>
    </div>
  );
}
