"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type Project = { id: string; name: string; client?: string | null; location?: string | null };

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");

  async function refresh() {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
  }

  useEffect(() => { refresh(); }, []);

  async function createProject() {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, client: client || undefined, location: location || undefined }),
    });
    if (res.ok) {
      setName(""); setClient(""); setLocation("");
      refresh();
    }
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,"0");
  const dd = String(today.getDate()).padStart(2,"0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        <button onClick={() => signOut({ callbackUrl: "/login" })} style={btn}>Sign out</button>
      </div>

      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
        <strong>Create Project</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginTop: 10 }}>
          <input placeholder="Project name" value={name} onChange={(e)=>setName(e.target.value)} style={inp}/>
          <input placeholder="Client (optional)" value={client} onChange={(e)=>setClient(e.target.value)} style={inp}/>
          <input placeholder="Location (optional)" value={location} onChange={(e)=>setLocation(e.target.value)} style={inp}/>
          <button onClick={createProject} style={btn} disabled={!name.trim()}>Create</button>
        </div>
      </div>

      <div style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 260px", gap: 8, padding: 10, fontWeight: 700, borderBottom: "1px solid #eee" }}>
          <div>Name</div><div>Client</div><div>Location</div><div>Actions</div>
        </div>
        {projects.map((p) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 260px", gap: 8, padding: 10, borderBottom: "1px solid #f3f3f3", alignItems: "center" }}>
            <div>{p.name}</div>
            <div>{p.client ?? ""}</div>
            <div>{p.location ?? ""}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={`/projects/${p.id}/setup`} style={linkBtn}>Setup</Link>
              <Link href={`/projects/${p.id}/daily/${todayStr}`} style={linkBtn}>Today’s Report</Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div style={{ padding: 12, opacity: 0.75 }}>No projects yet.</div>}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: 10, borderRadius: 12, border: "1px solid #ccc" };
const btn: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid #999", background: "#f2f2f2", cursor: "pointer" };
const linkBtn: React.CSSProperties = { padding: "8px 10px", borderRadius: 12, border: "1px solid #ccc", textDecoration: "none" };
