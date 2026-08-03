export interface DogSharePayload {
  brand: string;
  title: string;
  profileLabel: string;
  monthlyLabel: string;
  monthlyText: string;
  yearlyLabel: string;
  yearlyText: string;
  setupLine: string;
  readinessLabel: string;
  readinessText: string;
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

export async function renderDogSharePng(
  payload: DogSharePayload,
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
  gradient.addColorStop(0.45, "#ffffff");
  gradient.addColorStop(1, "#ecfdf5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 48, 48, width - 96, height - 96, 48);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#fdba74";
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
  ctx.font = "700 42px system-ui, sans-serif";
  const titleLines = wrapText(ctx, payload.title, width - 240);
  let y = 290;
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, edge, y);
    y += 52;
  }

  ctx.fillStyle = "#334155";
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText(payload.profileLabel, edge, y + 20);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText(payload.setupLine, edge, y + 58);

  ctx.fillStyle = "#9a3412";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(payload.monthlyLabel, edge, y + 130);
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 52px ui-monospace, monospace";
  ctx.fillText(payload.monthlyText, edge, y + 195);

  ctx.fillStyle = "#047857";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(payload.yearlyLabel, edge, y + 265);
  ctx.fillStyle = "#065f46";
  ctx.font = "700 36px ui-monospace, monospace";
  ctx.fillText(payload.yearlyText, edge, y + 320);

  ctx.fillStyle = "#475569";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(payload.readinessLabel, edge, y + 390);
  ctx.fillStyle = "#0f172a";
  ctx.font = "700 40px ui-monospace, monospace";
  ctx.fillText(payload.readinessText, edge, y + 445);

  ctx.fillStyle = "#334155";
  ctx.font = "500 26px system-ui, sans-serif";
  let iy = y + 510;
  for (const line of wrapText(ctx, payload.insight, width - 240).slice(0, 5)) {
    ctx.fillText(line, edge, iy);
    iy += 36;
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

export async function downloadDogCard(
  payload: DogSharePayload,
  filename = "dailylogic-dog-ownership.png",
) {
  const blob = await renderDogSharePng(payload);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyDogCardImage(
  payload: DogSharePayload,
): Promise<boolean> {
  const blob = await renderDogSharePng(payload);
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
