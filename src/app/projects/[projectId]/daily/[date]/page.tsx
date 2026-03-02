"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmployeeSummarySection, EquipmentSummarySection, type CostCode, type Employee, type Equipment, type CrewRow, type EquipRow } from "@/app/components/CrewEquipmentSections";
import { PayItemsQuantities, type PayItem, type QtyMap } from "@/app/components/PayItemsQuantities";

type Report = {
  id: string;
  reportDate: string;
  foremanName?: string | null;
  inspector?: string | null;
  hoursFrom?: string | null;
  hoursTo?: string | null;
  weatherAM?: string | null;
  weatherPM?: string | null;
  tempHigh?: number | null;
  tempLow?: number | null;
  precip?: number | null;
  groundCondition?: string | null;
  dayType?: string | null;
  spreadStation?: string | null;
  workPerformed?: string | null;
  delays?: string | null;
  photos?: any[];
};

export default function DailyReportPage({ params }: { params: { projectId: string; date: string } }) {
  const { projectId, date } = params;

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  const [costCodes, setCostCodes] = useState<CostCode[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [payItems, setPayItems] = useState<PayItem[]>([]);

  const [crew, setCrew] = useState<CrewRow[]>([]);
  const [equipmentRows, setEquipmentRows] = useState<EquipRow[]>([]);
  const [qtyMap, setQtyMap] = useState<QtyMap>({});
  const [photos, setPhotos] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/daily-report?date=${encodeURIComponent(date)}`);
    const data = await res.json();

    setReport(data.report);
    setCostCodes(data.costCodes ?? []);
    setEmployees(data.employees ?? []);
    setEquipmentList(data.equipment ?? []);
    setPayItems(data.payItems ?? []);
    setQtyMap(data.quantitiesByPayItemId ?? {});

    setCrew((data.report?.crew ?? []).map((r: any) => ({
      id: r.id,
      employeeId: r.employeeId,
      regularHours: r.regularHours ?? 0,
      workClass: r.workClass ?? null,
      costCodeId: r.costCodeId,
    })));

    setEquipmentRows((data.report?.equipment ?? []).map((r: any) => ({
      id: r.id,
      equipmentId: r.equipmentId,
      workTimeHours: r.workTimeHours ?? 0,
      costCodeId: r.costCodeId,
    })));

    setPhotos(data.report?.photos ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [projectId, date]);

  const reportId = report?.id;

  async function saveFields(patch: Partial<Report>) {
    if (!reportId) return;
    setReport((r) => (r ? { ...r, ...patch } : r));
    await fetch(`/api/reports/${reportId}/fields`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function uploadPhoto(file: File, caption: string) {
    if (!reportId) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", caption);
    const res = await fetch(`/api/reports/${reportId}/photos`, { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setPhotos((p) => [data.photo, ...p]);
  }

  if (loading || !report) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Daily Report — {date}</h2>
          <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href={`/projects/${projectId}/setup`} style={linkBtn}>Project Setup</Link>
            <Link href={`/`} style={linkBtn}>Projects</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <strong>Header</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          <Field label="Foreman" value={report.foremanName ?? ""} onChange={(v) => saveFields({ foremanName: v })} />
          <Field label="Inspector" value={report.inspector ?? ""} onChange={(v) => saveFields({ inspector: v })} />
          <Field label="Site Hours From" value={report.hoursFrom ?? ""} onChange={(v) => saveFields({ hoursFrom: v })} placeholder="07:00" />
          <Field label="Site Hours To" value={report.hoursTo ?? ""} onChange={(v) => saveFields({ hoursTo: v })} placeholder="17:00" />

          <Field label="Ground Condition" value={report.groundCondition ?? ""} onChange={(v) => saveFields({ groundCondition: v })} />
          <Field label="Day Type" value={report.dayType ?? ""} onChange={(v) => saveFields({ dayType: v })} placeholder="Work Day" />
          <Field label="Spread / Station" value={report.spreadStation ?? ""} onChange={(v) => saveFields({ spreadStation: v })} placeholder="Station 10+00 to 20+00" />
          <div />
        </div>
      </div>

      {/* Weather */}
      <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <strong>Weather</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          <Field label="AM" value={report.weatherAM ?? ""} onChange={(v) => saveFields({ weatherAM: v })} />
          <Field label="PM" value={report.weatherPM ?? ""} onChange={(v) => saveFields({ weatherPM: v })} />
          <Field label="High" value={(report.tempHigh ?? "").toString()} onChange={(v) => saveFields({ tempHigh: v ? Number(v) : null })} placeholder="°F" />
          <Field label="Low" value={(report.tempLow ?? "").toString()} onChange={(v) => saveFields({ tempLow: v ? Number(v) : null })} placeholder="°F" />
          <Field label="Precip" value={(report.precip ?? "").toString()} onChange={(v) => saveFields({ precip: v ? Number(v) : null })} placeholder="inches" />
        </div>
      </div>

      {/* Narratives */}
      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <strong>Work Performed</strong>
          <textarea
            value={report.workPerformed ?? ""}
            onChange={(e) => saveFields({ workPerformed: e.target.value })}
            style={ta}
            placeholder="What work was performed today?"
          />
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <strong>Delays</strong>
          <textarea
            value={report.delays ?? ""}
            onChange={(e) => saveFields({ delays: e.target.value })}
            style={ta}
            placeholder="Delays / issues / notes"
          />
        </div>
      </div>

      {/* Crew / Equipment */}
      <div style={{ marginTop: 12 }}>
        <EmployeeSummarySection reportId={reportId!} employees={employees} costCodes={costCodes} crew={crew} onCrewChanged={setCrew} />
      </div>

      <div style={{ marginTop: 12 }}>
        <EquipmentSummarySection reportId={reportId!} equipmentList={equipmentList} costCodes={costCodes} equipmentRows={equipmentRows} onEquipmentChanged={setEquipmentRows} />
      </div>

      {/* Quantities */}
      <div style={{ marginTop: 12 }}>
        <PayItemsQuantities reportId={reportId!} payItems={payItems} qtyMap={qtyMap} onQtyMapChanged={setQtyMap} />
      </div>

      {/* Photos */}
      <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <strong>Photos</strong>
        <PhotoUploader onUpload={uploadPhoto} />
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
              <img src={`/api/photos/${p.id}`} alt={p.caption ?? "photo"} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 13, opacity: 0.8 }}>{p.caption ?? ""}</div>
              </div>
            </div>
          ))}
          {photos.length === 0 && <div style={{ opacity: 0.75 }}>No photos yet.</div>}
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.75 }}>{props.label}</span>
      <input
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
      />
    </label>
  );
}

function PhotoUploader({ onUpload }: { onUpload: (file: File, caption: string) => Promise<void> }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc", flex: "1 1 220px" }} />
      <button
        onClick={async () => { if (file) { await onUpload(file, caption); setFile(null); setCaption(""); } }}
        style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #999", background: "#f2f2f2", cursor: "pointer" }}
        disabled={!file}
      >
        Upload
      </button>
    </div>
  );
}

const ta: React.CSSProperties = { width: "100%", marginTop: 10, minHeight: 120, padding: 10, borderRadius: 12, border: "1px solid #ccc" };
const linkBtn: React.CSSProperties = { padding: "8px 10px", borderRadius: 12, border: "1px solid #ccc", textDecoration: "none" };
