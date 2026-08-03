export interface RelationshipSharePayload {
  brand: string;
  title: string;
  profileLabel: string;
  scoreLabel: string;
  scoreText: string;
  dimensions: { label: string; score: string }[];
  insight: string;
  footer: string;
  rtl: boolean;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = words[0]!;
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) current = next;
    else {
      lines.push(current);
      current = words[i]!;
    }
  }
  lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

async function loadLogo(): Promise<HTMLImageElement | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/icon.svg";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("logo"));
    });
    return img;
  } catch {
    return null;
  }
}

export async function renderRelationshipSharePng(
  payload: RelationshipSharePayload,
): Promise<Blob> {
  const width = 1080;
  const height = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#eff6ff");
  gradient.addColorStop(0.5, "#ffffff");
  gradient.addColorStop(1, "#fdf2f8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 48, 48, width - 96, height - 96, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#bfdbfe";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.direction = payload.rtl ? "rtl" : "ltr";
  const align: CanvasTextAlign = payload.rtl ? "right" : "left";
  const edge = payload.rtl ? width - 120 : 120;

  const logo = await loadLogo();
  if (logo) {
    const size = 72;
    const x = payload.rtl ? width - 120 - size : 120;
    ctx.drawImage(logo, x, 110, size, size);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "600 28px system-ui, Segoe UI, Arial";
  ctx.textAlign = align;
  ctx.fillText(payload.brand, edge, 220);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 42px system-ui, Segoe UI, Arial";
  let y = 290;
  for (const line of wrapText(ctx, payload.title, width - 240).slice(0, 2)) {
    ctx.fillText(line, edge, y);
    y += 52;
  }

  ctx.fillStyle = "#2563eb";
  ctx.font = "600 28px system-ui, Segoe UI, Arial";
  ctx.fillText(payload.profileLabel, edge, y + 24);

  ctx.fillStyle = "#1d4ed8";
  ctx.font = "700 26px system-ui, Segoe UI, Arial";
  ctx.fillText(payload.scoreLabel, edge, y + 80);
  ctx.font = "800 110px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(payload.scoreText, edge, y + 200);

  y += 260;
  ctx.fillStyle = "#334155";
  ctx.font = "600 28px system-ui, Segoe UI, Arial";
  for (const dim of payload.dimensions.slice(0, 4)) {
    ctx.fillText(`${dim.label}: ${dim.score}`, edge, y);
    y += 44;
  }

  y += 24;
  ctx.fillStyle = "#475569";
  ctx.font = "500 30px system-ui, Segoe UI, Arial";
  for (const line of wrapText(ctx, payload.insight, width - 240).slice(0, 7)) {
    ctx.fillText(line, edge, y);
    y += 42;
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 24px system-ui, Segoe UI, Arial";
  ctx.fillText(payload.footer, edge, height - 120);

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });
}

export async function downloadRelationshipCard(
  payload: RelationshipSharePayload,
  filename = "dailylogic-relationship-depth.png",
): Promise<void> {
  const blob = await renderRelationshipSharePng(payload);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyRelationshipCardImage(
  payload: RelationshipSharePayload,
): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }
  try {
    const blob = await renderRelationshipSharePng(payload);
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
