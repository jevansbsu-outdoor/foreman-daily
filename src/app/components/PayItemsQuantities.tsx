"use client";

import { useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";

export type PayItem = {
  id: string;
  itemNo: string;
  altItemNo?: string | null;
  description: string;
  unit: string;
  contractQty: number | null;
  unitPrice: number | null;
  isFavorite?: boolean;
};

export type QtyEntry = { qty: number; note?: string };
export type QtyMap = Record<string, QtyEntry>;

type Props = {
  reportId: string;
  payItems: PayItem[];
  qtyMap: QtyMap;
  onQtyMapChanged: (m: QtyMap) => void;
};

type FilterMode = "all" | "entered" | "favorites";
type ViewMode = "table" | "cards";

export function PayItemsQuantities({ reportId, payItems, qtyMap, onQtyMapChanged }: Props) {
  const [view, setView] = useState<ViewMode>("table");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return payItems.filter((p) => {
      const entry = qtyMap[p.id];
      const entered = (entry?.qty ?? 0) !== 0 || (entry?.note?.trim?.() ?? "") !== "";
      const fav = !!p.isFavorite;

      if (filterMode === "entered" && !entered) return false;
      if (filterMode === "favorites" && !fav) return false;

      if (!s) return true;
      return (
        p.itemNo.toLowerCase().includes(s) ||
        (p.altItemNo ?? "").toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.unit.toLowerCase().includes(s)
      );
    });
  }, [payItems, qtyMap, filterMode, search]);

  function nextEmpty() {
    const idx = filtered.findIndex((p) => {
      const e = qtyMap[p.id];
      const hasQty = (e?.qty ?? 0) !== 0;
      const hasNote = (e?.note?.trim?.() ?? "") !== "";
      return !hasQty && !hasNote;
    });
    if (idx === -1) return;
    const el = document.getElementById(`payitem-${filtered[idx].id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = document.getElementById(`qty-${filtered[idx].id}`) as HTMLInputElement | null;
    input?.focus();
  }

  async function saveQty(payItemId: string, qty: number) {
    const next = { ...qtyMap, [payItemId]: { ...(qtyMap[payItemId] ?? {}), qty } };
    onQtyMapChanged(next);
    await fetch(`/api/reports/${reportId}/quantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payItemId, qty, note: next[payItemId]?.note ?? "" }),
    });
  }

  async function saveNote(payItemId: string, note: string) {
    const next = { ...qtyMap, [payItemId]: { ...(qtyMap[payItemId] ?? {}), note } };
    onQtyMapChanged(next);
    await fetch(`/api/reports/${reportId}/quantity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payItemId, qty: next[payItemId]?.qty ?? 0, note }),
    });
  }

  async function toggleFavorite(payItemId: string, isFavorite: boolean) {
    // Optimistic: update local payItems? handled at parent refresh; here just call API.
    await fetch(`/api/pay-items/${payItemId}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite }),
    });
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", borderBottom: "1px solid #eee" }}>
        <strong style={{ marginRight: 8 }}>Today’s Quantities</strong>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setView("table")} style={btnStyle(view === "table")}>Table</button>
          <button onClick={() => setView("cards")} style={btnStyle(view === "cards")}>Cards</button>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setFilterMode("all")} style={btnStyle(filterMode === "all")}>All</button>
          <button onClick={() => setFilterMode("entered")} style={btnStyle(filterMode === "entered")}>Entered</button>
          <button onClick={() => setFilterMode("favorites")} style={btnStyle(filterMode === "favorites")}>Favorites</button>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pay items…"
          style={{ padding: 10, minWidth: 240, flex: "1 1 260px", borderRadius: 12, border: "1px solid #ccc" }}
        />

        <button onClick={nextEmpty} style={btnStyle(false)}>Next empty</button>
      </div>

      {view === "table" ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "36px 120px 1fr 70px 130px 1fr", fontWeight: 700, padding: 10, borderBottom: "1px solid #eee", gap: 8 }}>
            <div>★</div>
            <div>Item</div>
            <div>Description</div>
            <div>Unit</div>
            <div>Qty</div>
            <div>Note</div>
          </div>

          <List height={520} itemCount={filtered.length} itemSize={64} width={"100%"}>
            {({ index, style }) => {
              const p = filtered[index];
              const entry = qtyMap[p.id];
              const qty = entry?.qty ?? 0;
              const note = entry?.note ?? "";

              return (
                <div
                  id={`payitem-${p.id}`}
                  style={{
                    ...style,
                    display: "grid",
                    gridTemplateColumns: "36px 120px 1fr 70px 130px 1fr",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px",
                    borderBottom: "1px solid #f4f4f4",
                  }}
                >
                  <input
                    type="checkbox"
                    defaultChecked={!!p.isFavorite}
                    onChange={(e) => toggleFavorite(p.id, e.target.checked)}
                    title="Favorite"
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{p.itemNo}</div>
                    {p.altItemNo ? <div style={{ fontSize: 12, opacity: 0.75 }}>{p.altItemNo}</div> : null}
                  </div>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>
                  <div>{p.unit}</div>
                  <input
                    id={`qty-${p.id}`}
                    type="number"
                    step="any"
                    value={Number.isFinite(qty) ? qty : 0}
                    onChange={(e) => saveQty(p.id, Number(e.target.value))}
                    style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
                  />
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => saveNote(p.id, e.target.value)}
                    placeholder="Optional…"
                    style={{ padding: 10, borderRadius: 12, border: "1px solid #ccc" }}
                  />
                </div>
              );
            }}
          </List>
        </div>
      ) : (
        <div style={{ padding: 12, display: "grid", gap: 10 }}>
          {filtered.map((p) => {
            const entry = qtyMap[p.id];
            const qty = entry?.qty ?? 0;
            const note = entry?.note ?? "";
            return (
              <div key={p.id} id={`payitem-${p.id}`} style={{ border: "1px solid #eee", borderRadius: 14, padding: 12, display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{p.itemNo} <span style={{ fontWeight: 400 }}>({p.unit})</span></div>
                    {p.altItemNo ? <div style={{ fontSize: 12, opacity: 0.75 }}>{p.altItemNo}</div> : null}
                    <div style={{ opacity: 0.9 }}>{p.description}</div>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="checkbox" defaultChecked={!!p.isFavorite} onChange={(e) => toggleFavorite(p.id, e.target.checked)} />
                    Favorite
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10, alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>Qty</div>
                  <input
                    id={`qty-${p.id}`}
                    type="number"
                    step="any"
                    value={Number.isFinite(qty) ? qty : 0}
                    onChange={(e) => saveQty(p.id, Number(e.target.value))}
                    style={{ padding: 12, fontSize: 18, borderRadius: 12, border: "1px solid #ccc" }}
                  />
                  <div style={{ fontWeight: 700 }}>Note</div>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => saveNote(p.id, e.target.value)}
                    placeholder="Optional…"
                    style={{ padding: 12, borderRadius: 12, border: "1px solid #ccc" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid #ccc",
    background: active ? "#f2f2f2" : "white",
    cursor: "pointer",
  };
}
