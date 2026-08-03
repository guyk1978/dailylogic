export interface CalorieSharePayload {
  brand: string;
  title: string;
  totalLabel: string;
  totalText: string;
  metaLine: string;
  lines: { label: string; value: string }[];
  tip: string;
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
  ctx.arcTo(x + w, y + h, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
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

export async function renderCalorieSharePng(
  payload: CalorieSharePayload,
): Promise<Blob> {
  const width = 1080;
  const height = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#fff7ed");
  gradient.addColorStop(1, "#ffedd5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 64, 64, width - 128, height - 128, 40);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const logo = await loadLogo();
  if (logo) {
    ctx.drawImage(logo, payload.rtl ? width - 64 - 72 : 64 + 40, 100, 56, 56);
  }

  ctx.fillStyle = "#9a3412";
  ctx.font = "600 28px system-ui, sans-serif";
  ctx.textAlign = payload.rtl ? "right" : "left";
  const brandX = payload.rtl ? width - 140 : 140;
  ctx.fillText(payload.brand, brandX, 138);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 48px system-ui, sans-serif";
  const titleLines = wrapText(ctx, payload.title, width - 220);
  let y = 220;
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, payload.rtl ? width - 110 : 110, y);
    y += 58;
  }

  ctx.fillStyle = "#c2410c";
  ctx.font = "600 26px system-ui, sans-serif";
  y += 24;
  ctx.fillText(payload.totalLabel, payload.rtl ? width - 110 : 110, y);
  y += 70;
  ctx.fillStyle = "#9a3412";
  ctx.font = "800 72px system-ui, sans-serif";
  ctx.fillText(payload.totalText, payload.rtl ? width - 110 : 110, y);
  y += 48;
  ctx.fillStyle = "#64748b";
  ctx.font = "500 28px system-ui, sans-serif";
  ctx.fillText(payload.metaLine, payload.rtl ? width - 110 : 110, y);

  y += 60;
  for (const row of payload.lines.slice(0, 6)) {
    ctx.fillStyle = "#334155";
    ctx.font = "600 28px system-ui, sans-serif";
    ctx.fillText(row.label, payload.rtl ? width - 110 : 110, y);
    ctx.fillStyle = "#ea580c";
    ctx.font = "700 28px system-ui, sans-serif";
    ctx.fillText(row.value, payload.rtl ? 110 : width - 110, y);
    y += 44;
  }

  y += 30;
  ctx.fillStyle = "#475569";
  ctx.font = "500 26px system-ui, sans-serif";
  for (const line of wrapText(ctx, payload.tip, width - 220).slice(0, 4)) {
    ctx.fillText(line, payload.rtl ? width - 110 : 110, y);
    y += 36;
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText(payload.footer, payload.rtl ? width - 110 : 110, height - 110);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("PNG export failed");
  return blob;
}

export async function downloadCalorieCard(
  payload: CalorieSharePayload,
  filename = "dailylogic-calorie-burn.png",
): Promise<void> {
  const blob = await renderCalorieSharePng(payload);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyCalorieCardImage(
  payload: CalorieSharePayload,
): Promise<boolean> {
  try {
    const blob = await renderCalorieSharePng(payload);
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}
