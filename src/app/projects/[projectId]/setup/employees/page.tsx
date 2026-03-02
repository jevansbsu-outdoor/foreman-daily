"use client";

import { useMemo, useState } from "react";
import { parseTsv, normHeader } from "@/lib/tsv";

type Row = { employeeId: string; name: string; workClass?: string | null };

export default function EmployeesSetupPage({ params }: { params: { projectId: string } }) {
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

    const iId = idx("Employee ID");
    const iName = idx("Name");
    const iClass = idx("Work Class");

    const errors: string[] = [];
    if (iId < 0) errors.push("Missing header: Employee ID");
    if (iName < 0) errors.push("Missing header: Name");
    if (errors.length) return { rows: [] as Row[], errors };

    const rows: Row[] = [];
    for (let r = 1; r < grid.length; r++) {
      const employeeId = (grid[r][iId] ?? "").trim();
      const name = (grid[r][iName] ?? "").trim();
      if (!employeeId || !name) continue;
      rows.push({
        employeeId,
        name,
        workClass: iClass >= 0 ? ((grid[r][iClass] ?? "").trim() || null) : null,
      });
    }
    if (!rows.length) return { rows, errors: ["No valid rows found (Employee ID + Name required)."] };
    return { rows, errors: [] as string[] };
  }, [paste]);

  async function importRows() {
    if (parsed.errors.length) return;
    setImporting(true);
    setMsg("");
    try {
      const res = await fetch(`/api/projects/${projectId}/employees/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(`Import failed: ${JSON.stringify(data)}`);
      else setMsg(`Imported ${data.count} employees.`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Project Setup — Employees</h2>
      <p style={{ opacity: 0.85 }}>
        Paste from Excel with headers: <code>Employee ID</code>, <code>Name</code>, <code>Work Class</code>
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
          {importing ? "Importing…" : "Import Employees"}
        </button>
        <div style={{ opacity: 0.85 }}>{msg}</div>
      </div>

      <h3 style={{ marginTop: 18 }}>Preview ({parsed.rows.length})</h3>
      <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 160px", gap: 8, padding: 10, fontWeight: 700, borderBottom: "1px solid #eee" }}>
          <div>Employee ID</div>
          <div>Name</div>
          <div>Work Class</div>
        </div>
        {parsed.rows.slice(0, 30).map((r) => (
          <div key={`${r.employeeId}-${r.name}`} style={{ display: "grid", gridTemplateColumns: "160px 1fr 160px", gap: 8, padding: 10, borderBottom: "1px solid #f3f3f3" }}>
            <div>{r.employeeId}</div>
            <div>{r.name}</div>
            <div>{r.workClass ?? ""}</div>
          </div>
        ))}
        {parsed.rows.length > 30 && <div style={{ padding: 10, opacity: 0.75 }}>Showing first 30 rows…</div>}
      </div>
    </div>
  );
}
