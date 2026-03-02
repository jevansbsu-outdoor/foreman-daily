"use client";

export default function SetupHome({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const linkStyle: React.CSSProperties = { display: "inline-block", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 12, textDecoration: "none" };

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <h2>Project Setup</h2>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <a style={linkStyle} href={`/projects/${projectId}/setup/cost-codes`}>Cost Codes</a>
        <a style={linkStyle} href={`/projects/${projectId}/setup/employees`}>Employees</a>
        <a style={linkStyle} href={`/projects/${projectId}/setup/equipment`}>Equipment</a>
        <a style={linkStyle} href={`/projects/${projectId}/setup/pay-items`}>Pay Items</a>
      </div>
      <p style={{ marginTop: 14, opacity: 0.8 }}>
        After setup, open a daily report from the Projects list.
      </p>
    </div>
  );
}
