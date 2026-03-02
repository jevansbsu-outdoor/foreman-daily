"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    if ((res as any)?.error) setError("Login failed.");
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, border: "1px solid #ddd", borderRadius: 14, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Foreman Daily</h2>
        <p style={{ opacity: 0.8, marginTop: 4 }}>Sign in</p>

        <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={inp} />
        </label>

        {error && <div style={{ marginTop: 12, color: "#b00" }}>{error}</div>}

        <button type="submit" style={{ marginTop: 14, width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #999", background: "#f2f2f2" }}>
          Sign in
        </button>

        <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
          First run uses the seeded admin login (change it after you deploy).
        </p>
      </form>
    </div>
  );
}

const inp: React.CSSProperties = { padding: 10, borderRadius: 12, border: "1px solid #ccc" };
