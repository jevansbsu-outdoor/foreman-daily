"use client";

import { useMemo } from "react";

export type CostCode = { id: string; code: string; description: string };
export type Employee = { id: string; employeeId: string; name: string; workClass?: string | null };
export type Equipment = { id: string; equipmentId: string; description: string };

export type CrewRow = { id: string; employeeId: string; regularHours: number; workClass?: string | null; costCodeId: string };
export type EquipRow = { id: string; equipmentId: string; workTimeHours: number; costCodeId: string };

export function EmployeeSummarySection(props: {
  reportId: string;
  employees: Employee[];
  costCodes: CostCode[];
  crew: CrewRow[];
  onCrewChanged: (crew: CrewRow[]) => void;
}) {
  const { reportId, employees, costCodes, crew, onCrewChanged } = props;

  const totalHours = useMemo(() => crew.reduce((sum, r) => sum + (Number(r.regularHours) || 0), 0), [crew]);

  async function addRow() {
    const emp = employees[0];
    const cc = costCodes[0];
    if (!emp || !cc) return;

    const res = await fetch(`/api/reports/${reportId}/crew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: emp.id, costCodeId: cc.id, regularHours: 0, workClass: emp.workClass ?? null }),
    });
    const data = await res.json();
    onCrewChanged([...crew, normalizeCrew(data.row)]);
  }

  async function updateRow(id: string, patch: Partial<CrewRow>) {
    const current = crew.find((r) => r.id === id);
    if (!current) return;
    const next = { ...current, ...patch };

    onCrewChanged(crew.map((r) => (r.id === id ? next : r)));

    await fetch(`/api/reports/${reportId}/crew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        employeeId: next.employeeId,
        costCodeId: next.costCodeId,
        regularHours: Number(next.regularHours) || 0,
        workClass: next.workClass ?? null,
      }),
    });
  }

  async function removeRow(id: string) {
    onCrewChanged(crew.filter((r) => r.id !== id));
    await fetch(`/api/reports/${reportId}/crew`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <strong>Employee Summary</strong>
        <button onClick={addRow} style={primaryBtn} disabled={employees.length === 0 || costCodes.length === 0}>+ Add Employee</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 140px 1fr 120px 90px", gap: 8, padding: 10, fontWeight: 700, borderBottom: "1px solid #eee" }}>
        <div>Employee</div>
        <div>Work Class</div>
        <div>Cost Code</div>
        <div>Hours</div>
        <div></div>
      </div>

      {crew.map((r) => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "260px 140px 1fr 120px 90px", gap: 8, padding: 10, borderBottom: "1px solid #f3f3f3", alignItems: "center" }}>
          <select
            value={r.employeeId}
            onChange={(e) => {
              const emp = employees.find((x) => x.id === e.target.value);
              updateRow(r.id, { employeeId: e.target.value, workClass: emp?.workClass ?? null });
            }}
            style={inputStyle}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.employeeId} — {e.name}
              </option>
            ))}
          </select>

          <input value={r.workClass ?? ""} onChange={(e) => updateRow(r.id, { workClass: e.target.value })} placeholder="Class" style={inputStyle} />

          <select value={r.costCodeId} onChange={(e) => updateRow(r.id, { costCodeId: e.target.value })} style={inputStyle}>
            {costCodes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.description}
              </option>
            ))}
          </select>

          <input type="number" step="any" value={r.regularHours} onChange={(e) => updateRow(r.id, { regularHours: Number(e.target.value) })} style={inputStyle} />

          <button onClick={() => removeRow(r.id)} style={dangerBtn}>Remove</button>
        </div>
      ))}

      <div style={{ padding: 12, display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <strong>Total Hours: {totalHours.toFixed(2)}</strong>
      </div>
    </div>
  );
}

export function EquipmentSummarySection(props: {
  reportId: string;
  equipmentList: Equipment[];
  costCodes: CostCode[];
  equipmentRows: EquipRow[];
  onEquipmentChanged: (rows: EquipRow[]) => void;
}) {
  const { reportId, equipmentList, costCodes, equipmentRows, onEquipmentChanged } = props;

  const totalHours = useMemo(() => equipmentRows.reduce((sum, r) => sum + (Number(r.workTimeHours) || 0), 0), [equipmentRows]);

  async function addRow() {
    const eq = equipmentList[0];
    const cc = costCodes[0];
    if (!eq || !cc) return;

    const res = await fetch(`/api/reports/${reportId}/equipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipmentId: eq.id, costCodeId: cc.id, workTimeHours: 0 }),
    });
    const data = await res.json();
    onEquipmentChanged([...equipmentRows, normalizeEquip(data.row)]);
  }

  async function updateRow(id: string, patch: Partial<EquipRow>) {
    const current = equipmentRows.find((r) => r.id === id);
    if (!current) return;
    const next = { ...current, ...patch };

    onEquipmentChanged(equipmentRows.map((r) => (r.id === id ? next : r)));

    await fetch(`/api/reports/${reportId}/equipment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        equipmentId: next.equipmentId,
        costCodeId: next.costCodeId,
        workTimeHours: Number(next.workTimeHours) || 0,
      }),
    });
  }

  async function removeRow(id: string) {
    onEquipmentChanged(equipmentRows.filter((r) => r.id !== id));
    await fetch(`/api/reports/${reportId}/equipment`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <strong>Equipment Summary</strong>
        <button onClick={addRow} style={primaryBtn} disabled={equipmentList.length === 0 || costCodes.length === 0}>+ Add Equipment</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 140px 90px", gap: 8, padding: 10, fontWeight: 700, borderBottom: "1px solid #eee" }}>
        <div>Equipment</div>
        <div>Cost Code</div>
        <div>Hours</div>
        <div></div>
      </div>

      {equipmentRows.map((r) => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "320px 1fr 140px 90px", gap: 8, padding: 10, borderBottom: "1px solid #f3f3f3", alignItems: "center" }}>
          <select value={r.equipmentId} onChange={(e) => updateRow(r.id, { equipmentId: e.target.value })} style={inputStyle}>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.equipmentId} — {eq.description}
              </option>
            ))}
          </select>

          <select value={r.costCodeId} onChange={(e) => updateRow(r.id, { costCodeId: e.target.value })} style={inputStyle}>
            {costCodes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.description}
              </option>
            ))}
          </select>

          <input type="number" step="any" value={r.workTimeHours} onChange={(e) => updateRow(r.id, { workTimeHours: Number(e.target.value) })} style={inputStyle} />

          <button onClick={() => removeRow(r.id)} style={dangerBtn}>Remove</button>
        </div>
      ))}

      <div style={{ padding: 12, display: "flex", justifyContent: "flex-end" }}>
        <strong>Total Equipment Hours: {totalHours.toFixed(2)}</strong>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: 10, borderRadius: 12, border: "1px solid #ccc" };
const primaryBtn: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid #999", background: "#f2f2f2", cursor: "pointer" };
const dangerBtn: React.CSSProperties = { padding: "10px 10px", borderRadius: 12, border: "1px solid #c55", background: "#fff0f0", cursor: "pointer" };

function normalizeCrew(row: any): CrewRow {
  return { id: row.id, employeeId: row.employeeId, regularHours: row.regularHours ?? 0, workClass: row.workClass ?? null, costCodeId: row.costCodeId };
}
function normalizeEquip(row: any): EquipRow {
  return { id: row.id, equipmentId: row.equipmentId, workTimeHours: row.workTimeHours ?? 0, costCodeId: row.costCodeId };
}
