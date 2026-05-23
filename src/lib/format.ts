export function shortenId(id: string, head = 6, tail = 4): string {
  if (!id) return "";
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

export function formatRelativeTime(ts: number | null | undefined): string {
  if (!ts) return "—";
  const ms = typeof ts === "number" ? ts : Number(ts);
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const diff = Date.now() - ms;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ms).toLocaleDateString();
}

export function formatAbsoluteTime(ts: number | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export function sortIpStrings(a: string, b: string): number {
  const ax = ipKey(a);
  const bx = ipKey(b);
  return ax < bx ? -1 : ax > bx ? 1 : 0;
}

function ipKey(ip: string): string {
  // Pads each octet of an IPv4 / hex group of IPv6 so lex sort matches numeric order.
  if (ip.includes(":")) {
    return ip
      .split(":")
      .map((g) => g.padStart(4, "0"))
      .join(":");
  }
  return ip
    .split(".")
    .map((g) => g.padStart(3, "0"))
    .join(".");
}
