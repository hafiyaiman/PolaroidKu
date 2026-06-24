import { PhotoSlotState } from "./slot-canvas";
import { getDateCaption } from "@/components/frames/floral-frames";

// ── Constants ─────────────────────────────────────────────────────────────────
export const CANVAS_SIZE: Record<string, { width: number; height: number }> = {
  story_916: { width: 1080, height: 1920 },
};

// Reference display canvas dimensions (design basis)
export const REF_W = 360;
export const REF_H = 640;

// Photo slot at reference resolution
export const REF_SLOT = {
  x: 9.6, // 28.8 / 3 (centered horizontally: (360 - 340.8) / 2)
  w: 340.8, // 1022.4 / 3
  h: 451.6, // 1354.7 / 3
};

// Photo slot dimensions at export resolution
export const SLOT_EXPORT = { x: 28.8, w: 1022.4, h: 1354.7 };

// Calculate photo slot Y position at export resolution based on alignment
export function getExportSlotY(photoAlign: string): number {
  const padding = 30; // ~10px at display resolution × 3
  switch (photoAlign) {
    case "top":
      return padding;
    case "bottom":
      return 1920 - SLOT_EXPORT.h - padding;
    case "center":
    default:
      return (1920 - SLOT_EXPORT.h) / 2;
  }
}

// Scale export-resolution slot Y to a given display canvas height
export function getDisplaySlotY(photoAlign: string, canvasH: number = REF_H): number {
  const exportY = getExportSlotY(photoAlign);
  // Scale from export (1920) to display canvas height
  return (exportY / 1920) * canvasH;
}

// ── Canvas merge helpers ──────────────────────────────────────────────────────
export async function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

export function clampOffset(
  offset: { x: number; y: number },
  zoom: number,
  imageAspect: number,
  slotW: number,
  slotH: number,
) {
  const slotAspect = slotW / slotH;
  const isLandscape = imageAspect > slotAspect;

  const baseW = isLandscape ? slotH * imageAspect : slotW;
  const baseH = isLandscape ? slotH : slotW / imageAspect;

  const imgW = baseW * zoom;
  const imgH = baseH * zoom;

  const maxX = Math.max(0, (imgW - slotW) / 2);
  const maxY = Math.max(0, (imgH - slotH) / 2);

  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}

export async function buildComposite(
  slots: PhotoSlotState[],
  layoutType: string,
  borderUrl: string,
  isPolaroidSystem: boolean,
  photoCount: number,
  photoAlign: string,
  eventName: string,
  eventDate: string,
): Promise<Blob> {
  const { width, height } = CANVAS_SIZE[layoutType] ?? CANVAS_SIZE.story_916;
  const cvs = document.createElement("canvas");
  cvs.width = width;
  cvs.height = height;
  const ctx = cvs.getContext("2d")!;

  // Pre-load custom fonts so they are active when canvas draws text
  try {
    const doc = document as unknown as {
      fonts?: {
        load: (fontSpec: string) => Promise<unknown>;
      };
    };
    if (doc.fonts && typeof doc.fonts.load === "function") {
      await Promise.all([
        doc.fonts.load("400 72px 'Great Vibes'"),
        doc.fonts.load("bold 26px 'Montserrat'"),
        doc.fonts.load("bold 24px 'Montserrat'"),
        doc.fonts.load("bold 22px 'Montserrat'"),
        doc.fonts.load("italic 72px 'Playfair Display'"),
        doc.fonts.load("400 72px 'Playfair Display'"),
      ]);
    }
  } catch (e) {
    console.warn("Failed to pre-load fonts for Canvas", e);
  }

  // Fill canvas with black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Cutout slot position at export resolution (1080x1920)
  const exportX = SLOT_EXPORT.x;
  const exportY = getExportSlotY(photoAlign);
  const exportW = SLOT_EXPORT.w;
  const exportH = SLOT_EXPORT.h;

  // Subtract gaps (18px export = 6px display)
  const gapSize = 18;
  const totalGapsHeight = (photoCount - 1) * gapSize;
  const slotH = (exportH - totalGapsHeight) / photoCount;
  const slotAspect = exportW / slotH;

  // 1. Draw frame background first (only for system templates)
  if (isPolaroidSystem) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else if (
    borderUrl &&
    borderUrl.startsWith("/frames/pink_roses_corner.png")
  ) {
    // ── PINK FLORAL STRIP ──
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#FFF5F6");
    grad.addColorStop(0.5, "#FFEBEF");
    grad.addColorStop(1, "#FFDFE6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FBCFE8";
    ctx.strokeRect(15, 15, width - 30, height - 30);

    try {
      const flower = await loadImg(
        `/api/proxy-image?url=${encodeURIComponent(borderUrl)}`,
      );
      ctx.drawImage(flower, 15, 15, 180, 180);
      ctx.save();
      ctx.translate(width - 15, 15);
      ctx.scale(-1, 1);
      ctx.drawImage(flower, 0, 0, 180, 180);
      ctx.restore();
    } catch (err) {
      console.error(err);
    }

    ctx.fillStyle = "#9D4E62";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 26px 'Montserrat', sans-serif";
    ctx.fillText("RAIKAN CINTA", width / 2, 140);

    ctx.fillStyle = "#742A3A";
    ctx.font = "italic 72px 'Great Vibes', 'Playfair Display', Georgia, serif";
    ctx.fillText(eventName || "Aiman & Hafiya", width / 2, 230);

    ctx.strokeStyle = "#FBCFE8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 310);
    ctx.lineTo(width / 2 + 180, 310);
    ctx.stroke();

    ctx.fillStyle = "#9D4E62";
    ctx.font = "bold 24px 'Montserrat', sans-serif";
    ctx.fillText(
      getDateCaption(eventDate) || "SABTU | 7 | FEB | 2026",
      width / 2,
      335,
    );

    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 360);
    ctx.lineTo(width / 2 + 180, 360);
    ctx.stroke();

    ctx.fillStyle = "#9D4E62";
    ctx.font = "bold 22px 'Montserrat', sans-serif";
    ctx.fillText("KOTAKFLASH.MY", width / 2, height - 50);
  } else if (
    borderUrl &&
    borderUrl.startsWith("/frames/blue_flowers_corner.png")
  ) {
    // ── BLUE FLORAL STRIP ──
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#F8FAFC");
    grad.addColorStop(0.5, "#EFF6FF");
    grad.addColorStop(1, "#DBEAFE");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 10;
    ctx.strokeStyle = "#BFDBFE";
    ctx.strokeRect(15, 15, width - 30, height - 30);

    try {
      const flower = await loadImg(
        `/api/proxy-image?url=${encodeURIComponent(borderUrl)}`,
      );
      ctx.drawImage(flower, 15, 15, 180, 180);
      ctx.save();
      ctx.translate(width - 15, 15);
      ctx.scale(-1, 1);
      ctx.drawImage(flower, 0, 0, 180, 180);
      ctx.restore();
    } catch (err) {
      console.error(err);
    }

    ctx.fillStyle = "#1E3A8A";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 26px 'Montserrat', sans-serif";
    ctx.fillText("RAIKAN CINTA", width / 2, 140);

    ctx.fillStyle = "#1D4ED8";
    ctx.font = "italic 72px 'Great Vibes', 'Playfair Display', Georgia, serif";
    ctx.fillText(eventName || "Aiman & Hafiya", width / 2, 230);

    ctx.strokeStyle = "#BFDBFE";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 310);
    ctx.lineTo(width / 2 + 180, 310);
    ctx.stroke();

    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 24px 'Montserrat', sans-serif";
    ctx.fillText(
      getDateCaption(eventDate) || "SABTU | 7 | FEB | 2026",
      width / 2,
      335,
    );

    ctx.beginPath();
    ctx.moveTo(width / 2 - 180, 360);
    ctx.lineTo(width / 2 + 180, 360);
    ctx.stroke();

    ctx.fillStyle = "#1E3A8A";
    ctx.font = "bold 22px 'Montserrat', sans-serif";
    ctx.fillText("KOTAKFLASH.MY", width / 2, height - 50);
  } else {
    // ── CUSTOM USER TEMPLATE BACKGROUND ──
    // Default to solid white background so that transparent cutouts and gaps between photos render cleanly
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw photo slots
  for (let idx = 0; idx < photoCount; idx++) {
    const slot = slots[idx];
    if (slot?.previewUrl) {
      try {
        const img = await loadImg(slot.previewUrl);
        const isLandscape = img.naturalWidth / img.naturalHeight > slotAspect;
        const baseW = isLandscape
          ? (slotH / img.naturalHeight) * img.naturalWidth
          : exportW;
        const baseH = isLandscape
          ? slotH
          : (exportW / img.naturalWidth) * img.naturalHeight;
        const sw = baseW * slot.zoom;
        const sh = baseH * slot.zoom;

        const y = exportY + idx * (slotH + gapSize);
        const dx = exportX + (exportW - sw) / 2 + slot.offset.x * 3;
        const dy = y + (slotH - sh) / 2 + slot.offset.y * 3;

        ctx.save();
        ctx.beginPath();
        // Square/sharp corners for the image slot (rounded-none)
        ctx.rect(exportX, y, exportW, slotH);
        ctx.clip();
        ctx.drawImage(img, dx, dy, sw, sh);
        ctx.restore();
      } catch (err) {
        console.error("Failed to load/draw slot image", err);
      }
    }
  }

  // 3. Draw custom frame overlay on top (only for custom user uploaded templates)
  if (borderUrl && !borderUrl.startsWith("/frames/")) {
    try {
      const fr = await loadImg(
        `/api/proxy-image?url=${encodeURIComponent(borderUrl)}`,
      );
      ctx.drawImage(fr, 0, 0, width, height);
    } catch {
      console.warn("Frame overlay failed to load");
    }
  }

  return new Promise<Blob>((res, rej) =>
    cvs.toBlob(
      (b) => (b ? res(b) : rej(new Error("toBlob failed"))),
      "image/jpeg",
      0.92,
    ),
  );
}
