export interface ShareCardPayload {
  brand: string;
  title: string;
  scoreLabel: string;
  scoreText: string;
  badge?: string;
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
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
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

/** Renders a shareable PNG card entirely in the browser (no server). */
export async function renderShareCardPng(
  payload: ShareCardPayload,
): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fff1f2");
  gradient.addColorStop(0.45, "#ffffff");
  gradient.addColorStop(1, "#fff7ed");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 48, 48, width - 96, height - 96, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#fecdd3";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.direction = payload.rtl ? "rtl" : "ltr";
  const align: CanvasTextAlign = payload.rtl ? "right" : "left";
  const edge = payload.rtl ? width - 120 : 120;

  const logo = await loadLogo();
  if (logo) {
    const logoSize = 72;
    const logoX = payload.rtl ? width - 120 - logoSize : 120;
    ctx.drawImage(logo, logoX, 110, logoSize, logoSize);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "600 28px system-ui, Segoe UI, Arial";
  ctx.textAlign = align;
  ctx.fillText(payload.brand, edge, 220);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 44px system-ui, Segoe UI, Arial";
  const titleLines = wrapText(ctx, payload.title, width - 240).slice(0, 3);
  let y = 290;
  for (const line of titleLines) {
    ctx.fillText(line, edge, y);
    y += 56;
  }

  ctx.fillStyle = "#e11d48";
  ctx.font = "700 28px system-ui, Segoe UI, Arial";
  ctx.fillText(payload.scoreLabel, edge, y + 40);

  ctx.font = "800 120px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(payload.scoreText, edge, y + 160);

  if (payload.badge) {
    const badgeY = y + 210;
    ctx.font = "600 26px system-ui, Segoe UI, Arial";
    const badgeWidth = ctx.measureText(payload.badge).width + 48;
    const badgeX = payload.rtl ? edge - badgeWidth : edge;
    roundRect(ctx, badgeX, badgeY - 34, badgeWidth, 52, 26);
    ctx.fillStyle = "#ffe4e6";
    ctx.fill();
    ctx.fillStyle = "#be123c";
    ctx.fillText(
      payload.badge,
      payload.rtl ? edge - 24 : edge + 24,
      badgeY,
    );
    y = badgeY + 50;
  } else {
    y += 220;
  }

  ctx.fillStyle = "#334155";
  ctx.font = "500 32px system-ui, Segoe UI, Arial";
  const insightLines = wrapText(ctx, payload.insight, width - 240).slice(0, 8);
  y += 40;
  for (const line of insightLines) {
    ctx.fillText(line, edge, y);
    y += 46;
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 24px system-ui, Segoe UI, Arial";
  ctx.fillText(payload.footer, edge, height - 120);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
    );
  });
}

export async function downloadShareCard(
  payload: ShareCardPayload,
  filename = "dailylogic-love-calculator.png",
): Promise<void> {
  const blob = await renderShareCardPng(payload);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function copyShareCardImage(
  payload: ShareCardPayload,
): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }
  try {
    const blob = await renderShareCardPng(payload);
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
