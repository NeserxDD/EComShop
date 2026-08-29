import * as React from "react";

// Warm stone React Email template — no extra dep, plain JSX (Resend accepts react: <Component />)

export function RepairStatusEmail({
  ticketNo,
  customerName,
  device,
  oldStatus,
  newStatus,
  note,
}: {
  ticketNo: string;
  customerName: string;
  device: string;
  oldStatus: string;
  newStatus: string;
  note?: string | null;
}) {
  return (
    <div style={{ fontFamily: "Geist, system-ui, sans-serif", background: "#fafaf9", padding: "24px", color: "#1c1917" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", background: "#ffffff", border: "1px solid #e7e5e4", borderRadius: 12, padding: 24, boxShadow: "0 4px 24px rgba(28,25,23,0.06)" }}>
        <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.14em", color: "#78716c", margin: 0 }}>
          Stone & Circuit — Manila
        </p>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "8px 0 4px", fontFamily: "Inter, sans-serif" }}>Repair {ticketNo} → {newStatus}</h1>
        <p style={{ fontSize: 14, color: "#57534e", margin: "0 0 16px" }}>
          Hi {customerName}, your {device} repair moved from <strong>{oldStatus}</strong> to <strong>{newStatus}</strong>.
        </p>
        {note && (
          <p style={{ fontSize: 13, background: "#f5f5f4", border: "1px solid #e7e5e4", borderRadius: 8, padding: 12, color: "#44403c" }}>
            Note: {note}
          </p>
        )}
        <p style={{ fontSize: 13, color: "#78716c" }}>
          Track live: https://stoneandcircuit.test/repairs/track?ticket={ticketNo}
        </p>
        <p style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", color: "#a8a29e", marginTop: 16 }}>
          Warm stone minimal · Genuine parts. Expert care.
        </p>
      </div>
    </div>
  );
}
