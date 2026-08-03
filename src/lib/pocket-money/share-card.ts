export interface PocketSharePayload {
  brand: string;
  title: string;
  profileLabel: string;
  amountLabel: string;
  amountText: string;
  splitLabel: string;
  splitText: string;
  setupLine: string;
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
  ctx.arcTo(x + w, y + h, x, y, radius);
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

export async function renderPocketSharePng(
  payload: PocketSharePayload,
): Promise<Blob> {
  const width = 1080;
  const height = 1450;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fffbeb");
  gradient.addColorStop(0.4, "#ffffff");
  gradient.addColorStop(1, "#ecfdf5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 48, 48, width - 96, height - 96, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.direction = payload.rtl ? "rtl" : "ltr";
  const align: CanvasTextAlign = payload.rtl ? "right" : "left";
  const edge = payload.rtl ? width - 120 : 120;

  const logo = await loadLogo();
  if (logo) {
    const size = 72;
    const x = payload.rtl ? width - 120 - size : 120;
    ctx.drawImage(logo, x, 100, size, size);
  }

  ctx.fillStyle = "#64748b";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = align;
  ctx.fillText(payload.brand, edge, 220);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 44px system-ui, sans-serif";
  const titleLines = wrapText(ctx, payload.title, width - 240);
  let y = 290;
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, edge, y);
    y += 54;
  }

  ctx.fillStyle = "#334155";
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillText(payload.profileLabel, edge, y + 24);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.fillText(payload.setupLine, edge, y + 64);

  ctx.fillStyle = "#0f172a";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(payload.amountLabel, edge, y + 130);
  ctx.font = "700 56px ui-monospace, monospace";
  ctx.fillText(payload.amountText, edge, y + 198);

  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillStyle = "#047857";
  ctx.fillText(payload.splitLabel, edge, y + 270);
  ctx.fillStyle = "#065f46";
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText(payload.splitText, edge, y + 318);

  let dimY = y + 390;
  for (const dim of payload.dimensions.slice(0, 4)) {
    ctx.fillStyle = "#475569";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText(`${dim.label}  ${dim.score}`, edge, dimY);
    dimY += 42;
  }

  ctx.fillStyle = "#334155";
  ctx.font = "500 28px system-ui, sans-serif";
  const insightLines = wrapText(ctx, payload.insight, width - 240);
  dimY += 20;
  for (const line of insightLines.slice(0, 5)) {
    ctx.fillText(line, edge, dimY);
    dimY += 38;
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText(payload.footer, edge, height - 110);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("PNG export failed");
  return blob;
}

export async function downloadPocketCard(
  payload: PocketSharePayload,
  filename = "dailylogic-pocket-money.png",
) {
  const blob = await renderPocketSharePng(payload);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyPocketCardImage(
  payload: PocketSharePayload,
): Promise<boolean> {
  const blob = await renderPocketSharePng(payload);
  if (!navigator.clipboard || !("ClipboardItem" in window)) return false;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
