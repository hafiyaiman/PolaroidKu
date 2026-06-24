"use client";

import * as React from "react";
import type { Canvas, FabricObject, Rect, Textbox, ActiveSelection } from "fabric";

declare module "fabric" {
  interface FabricObject {
    isCanvasBgRect?: boolean;
    isPhotoSlotRect?: boolean;
    isPhotoSlotText?: boolean;
    hiddenTextareaContainer?: HTMLElement | null;
  }
}

interface FabricCanvasElement extends HTMLCanvasElement {
  _fc_instance?: Canvas;
}

const safeDispose = (canvas: Canvas | null) => {
  if (!canvas) return;
  try {
    const result = canvas.dispose();
    if (result instanceof Promise) {
      result.catch((err: unknown) => {
        console.warn("Fabric canvas async dispose error ignored:", err);
      });
    }
  } catch (err) {
    console.warn("Fabric canvas sync dispose error ignored:", err);
  }
};

export interface FabricCanvasHandle {
  addText: () => void;
  addRect: () => void;
  addCircle: () => void;
  addLine: () => void;
  importImageFile: (file: File) => void;
  importImageUrl: (url: string) => void;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  exportPNG: (multiplier?: number) => Promise<Blob>;
  getSelectedTextProps: () => {
    color: string;
    fontSize: number;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
  } | null;
  applyTextProps: (
    props: Partial<{
      color: string;
      fontSize: number;
      fontFamily: string;
      isBold: boolean;
      isItalic: boolean;
    }>,
  ) => void;
  getSelectedShapeProps: () => {
    fill: string;
    stroke: string;
    strokeWidth: number;
  } | null;
  applyShapeProps: (
    props: Partial<{
      fill: string;
      stroke: string;
      strokeWidth: number;
    }>,
  ) => void;
  applyOpacity: (v: number) => void;
  setCanvasBgColor: (color: string) => void;
  bringToFront: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  sendToBack: () => void;
}

interface FabricCanvasProps {
  width: number;
  height: number;
  photoAlign: "top" | "center" | "bottom";
  showOverlay: boolean;
  /** Multiplier applied on export so the PNG is at full Instagram resolution. Default: 2 */
  exportMultiplier?: number;
  onSelectionChange: (
    isText: boolean,
    isShape: boolean,
    hasSelection: boolean,
    opacity: number,
  ) => void;
}

const PHOTO_SLOT = {
  w: 1022.4 / 3, // 340.8
  h: 1354.7 / 3, // ~451.6
  canvasW: 360,
  canvasH: 640,
};

function getPhotoSlotY(
  canvasHeight: number,
  align: "top" | "center" | "bottom",
): number {
  const padding = 10;
  switch (align) {
    case "top":
      return padding;
    case "bottom":
      return canvasHeight - PHOTO_SLOT.h - padding;
    case "center":
    default:
      return (canvasHeight - PHOTO_SLOT.h) / 2;
  }
}

export const FabricCanvas = React.forwardRef<
  FabricCanvasHandle,
  FabricCanvasProps
>(function FabricCanvas(
  {
    width,
    height,
    photoAlign,
    showOverlay,
    exportMultiplier = 2,
    onSelectionChange,
  },
  ref,
) {
  const canvasElRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const fabricRef = React.useRef<Canvas | null>(null);
  const historyRef = React.useRef<string[]>([]);
  const historyIdxRef = React.useRef(-1);
  const isHistoryLoadingRef = React.useRef(false);
  // Always reflect the latest multiplier without re-registering the handle
  const exportMultRef = React.useRef(exportMultiplier);
  React.useEffect(() => {
    exportMultRef.current = exportMultiplier;
  }, [exportMultiplier]);

  const photoAlignRef = React.useRef(photoAlign);
  React.useEffect(() => {
    photoAlignRef.current = photoAlign;
  }, [photoAlign]);

  const showOverlayRef = React.useRef(showOverlay);
  React.useEffect(() => {
    showOverlayRef.current = showOverlay;
  }, [showOverlay]);

  const onSelectionChangeRef = React.useRef(onSelectionChange);
  React.useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  const saveHistory = React.useCallback(() => {
    if (isHistoryLoadingRef.current) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(
      canvas.toObject([
        "backgroundColor",
        "isCanvasBgRect",
        "isPhotoSlotRect",
        "isPhotoSlotText",
        "selectable",
        "evented",
        "hoverCursor",
      ]),
    );
    // Truncate future if we undid
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(json);
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  // Sync photoAlign prop changes with canvas guide position
  React.useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const photoSlot = canvas
      .getObjects()
      .find((obj) => obj.isPhotoSlotRect === true);
    const photoText = canvas
      .getObjects()
      .find((obj) => obj.isPhotoSlotText === true);
    let changed = false;
    if (photoSlot) {
      photoSlot.set("top", getPhotoSlotY(height, photoAlign));
      changed = true;
    }
    if (photoText) {
      photoText.set(
        "top",
        getPhotoSlotY(height, photoAlign) + PHOTO_SLOT.h / 2 - 20,
      );
      changed = true;
    }
    if (changed) {
      canvas.requestRenderAll();
      saveHistory();
    }
  }, [photoAlign, height, saveHistory]);

  // Sync showOverlay prop changes with canvas guide visibility
  React.useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const photoSlot = canvas
      .getObjects()
      .find((obj) => obj.isPhotoSlotRect === true);
    const photoText = canvas
      .getObjects()
      .find((obj) => obj.isPhotoSlotText === true);
    let changed = false;
    if (photoSlot) {
      photoSlot.set("visible", showOverlay);
      changed = true;
    }
    if (photoText) {
      photoText.set("visible", showOverlay);
      changed = true;
    }
    if (changed) {
      canvas.requestRenderAll();
      saveHistory();
    }
  }, [showOverlay, saveHistory]);

  // Initialize fabric.js canvas — guarded against React StrictMode double-mount
  React.useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;

    const handleScroll = () => {
      if (container) {
        container.scrollLeft = 0;
        container.scrollTop = 0;
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    // Synchronously dispose any lingering instance before the async init
    // (handles React StrictMode's unmount → remount cycle)
    if (fabricRef.current) {
      try {
        fabricRef.current.dispose();
      } catch {
        /* ignore */
      }
      safeDispose(fabricRef.current);
      fabricRef.current = null;
    }

    (async () => {
      const fabric = await import("fabric");

      // If the effect already cleaned up while we were loading fabric, bail out
      if (!isMounted || !canvasElRef.current) return;

      // Set the global hiddenTextareaContainer prototype for all textboxes to prevent Radix Dialog focus trap issues
      if (containerRef.current) {
        fabric.Textbox.prototype.hiddenTextareaContainer = containerRef.current;
        fabric.IText.prototype.hiddenTextareaContainer = containerRef.current;
      }

      // Double-check the element isn't already managed by a Fabric instance
      // (fabric 6.x attaches _fc_instance to the canvas element)
      const el = canvasElRef.current as FabricCanvasElement | null;
      if (el?._fc_instance) {
        try {
          el._fc_instance.dispose();
        } catch {
          /* ignore */
        }
        safeDispose(el._fc_instance);
      }

      const canvas = new fabric.Canvas(canvasElRef.current, {
        width,
        height,
        backgroundColor: "#ffffff", // Default background color is white
        selection: true,
      });

      canvas.backgroundColor = "#ffffff";

      // Add a solid background rect to prevent background transparent issues on textbox edit
      const bgRect = new fabric.Rect({
        left: 0,
        top: 0,
        width,
        height,
        fill: "#ffffff",
        selectable: false,
        evented: false,
        hoverCursor: "default",
      });
      bgRect.isCanvasBgRect = true;
      canvas.add(bgRect);
      canvas.sendObjectToBack(bgRect);

      // Add the guest photo slot guide rect object
      // Use originX='center' so left=width/2 guarantees horizontal centering
      const slotTop = getPhotoSlotY(height, photoAlignRef.current);
      const slotBorderRect = new fabric.Rect({
        left: width / 2,
        top: slotTop,
        originX: "center",
        originY: "top",
        width: PHOTO_SLOT.w,
        height: PHOTO_SLOT.h,
        fill: "rgba(59, 130, 246, 0.06)",
        stroke: "rgba(59, 130, 246, 0.7)",
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false,
        visible: showOverlayRef.current,
        hoverCursor: "default",
      });
      slotBorderRect.isPhotoSlotRect = true;

      // Add the guest photo slot text label object
      const slotText = new fabric.Textbox(
        "Guest Photo Area\n(1022 x 1355 px)",
        {
          left: width / 2,
          top: slotTop + PHOTO_SLOT.h / 2 - 20,
          originX: "center",
          originY: "top",
          width: PHOTO_SLOT.w,
          fontSize: 14,
          fontFamily: "Arial",
          fill: "rgba(59, 130, 246, 0.7)",
          textAlign: "center",
          selectable: false,
          editable: false,
          evented: false,
          visible: showOverlayRef.current,
          hoverCursor: "default",
        },
      );
      slotText.isPhotoSlotText = true;

      canvas.add(slotBorderRect);
      canvas.add(slotText);
      // Initially draw guide on top of the white background
      canvas.bringObjectToFront(slotBorderRect);
      canvas.bringObjectToFront(slotText);

      canvas.renderAll();

      fabricRef.current = canvas;

      canvas.on("selection:created", () => {
        const obj = canvas.getActiveObject();
        const isText = obj?.type === "textbox" || obj?.type === "i-text";
        const isShape =
          obj?.type === "rect" ||
          obj?.type === "circle" ||
          obj?.type === "line";
        onSelectionChangeRef.current(isText, isShape, true, obj?.opacity ?? 1);
      });
      canvas.on("selection:updated", () => {
        const obj = canvas.getActiveObject();
        const isText = obj?.type === "textbox" || obj?.type === "i-text";
        const isShape =
          obj?.type === "rect" ||
          obj?.type === "circle" ||
          obj?.type === "line";
        onSelectionChangeRef.current(isText, isShape, true, obj?.opacity ?? 1);
      });
      canvas.on("selection:cleared", () =>
        onSelectionChangeRef.current(false, false, false, 1),
      );
      canvas.on("object:modified", saveHistory);
      canvas.on("object:added", (e: { target?: FabricObject }) => {
        const obj = e.target;
        if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
          obj.hiddenTextareaContainer = containerRef.current || undefined;
        }
      });

      saveHistory();
    })();

    return () => {
      isMounted = false;
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      // Use setTimeout to let any in-flight async ops finish first
      const snap = fabricRef.current;
      fabricRef.current = null;
      historyRef.current = [];
      historyIdxRef.current = -1;
      if (snap) {
        try {
          snap.dispose();
        } catch {
          /* ignore */
        }
        safeDispose(snap);
      }
    };
  }, [width, height, saveHistory]);

  React.useImperativeHandle(ref, () => ({
    addText: async () => {
      const { Textbox } = await import("fabric");
      const t = new Textbox("Your Text Here", {
        left: width / 2 - 100,
        top: height / 2 - 20,
        width: 200,
        fontSize: 36,
        fontFamily: "Arial",
        fill: "#000000", // Default to black text since bg is white by default
        textAlign: "center",
        hasControls: true,
        editable: true,
        // Attach hidden textarea inside the container to prevent Radix Dialog focus trap issues
        hiddenTextareaContainer: containerRef.current || undefined,
      });
      fabricRef.current?.add(t);
      fabricRef.current?.setActiveObject(t);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    addRect: async () => {
      const { Rect } = await import("fabric");
      const r = new Rect({
        left: 60,
        top: 60,
        width: 120,
        height: 80,
        fill: "transparent",
        stroke: "#000000", // Default to black stroke
        strokeWidth: 4,
      });
      fabricRef.current?.add(r);
      fabricRef.current?.setActiveObject(r);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    addCircle: async () => {
      const { Circle } = await import("fabric");
      const c = new Circle({
        left: 80,
        top: 80,
        radius: 50,
        fill: "transparent",
        stroke: "#000000",
        strokeWidth: 4,
      });
      fabricRef.current?.add(c);
      fabricRef.current?.setActiveObject(c);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    addLine: async () => {
      const { Line } = await import("fabric");
      const l = new Line([50, height / 2, width - 50, height / 2], {
        stroke: "#000000",
        strokeWidth: 4,
      });
      fabricRef.current?.add(l);
      fabricRef.current?.setActiveObject(l);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    importImageFile: async (file: File) => {
      const url = URL.createObjectURL(file);
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const scale = Math.min(width / img.width!, height / img.height!) * 0.5;
      img.scale(scale);
      img.set({
        left: (width - img.getScaledWidth()) / 2,
        top: (height - img.getScaledHeight()) / 2,
      });
      fabricRef.current?.add(img);
      fabricRef.current?.setActiveObject(img);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    importImageUrl: async (url: string) => {
      const { FabricImage } = await import("fabric");
      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const scale = Math.min(width / img.width!, height / img.height!) * 0.5;
      img.scale(scale);
      img.set({
        left: (width - img.getScaledWidth()) / 2,
        top: (height - img.getScaledHeight()) / 2,
      });
      fabricRef.current?.add(img);
      fabricRef.current?.setActiveObject(img);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    undo: () => {
      if (isHistoryLoadingRef.current) return;
      if (historyIdxRef.current <= 0) return;
      historyIdxRef.current--;
      const json = historyRef.current[historyIdxRef.current];
      isHistoryLoadingRef.current = true;
      fabricRef.current?.loadFromJSON(json).then(() => {
        fabricRef.current?.getObjects().forEach((obj) => {
          if (obj.type === "textbox" || obj.type === "i-text") {
            obj.hiddenTextareaContainer = containerRef.current || undefined;
          }
        });
        fabricRef.current?.renderAll();
        isHistoryLoadingRef.current = false;
      });
    },

    redo: () => {
      if (isHistoryLoadingRef.current) return;
      if (historyIdxRef.current >= historyRef.current.length - 1) return;
      historyIdxRef.current++;
      const json = historyRef.current[historyIdxRef.current];
      isHistoryLoadingRef.current = true;
      fabricRef.current?.loadFromJSON(json).then(() => {
        fabricRef.current?.getObjects().forEach((obj) => {
          if (obj.type === "textbox" || obj.type === "i-text") {
            obj.hiddenTextareaContainer = containerRef.current || undefined;
          }
        });
        fabricRef.current?.renderAll();
        isHistoryLoadingRef.current = false;
      });
    },

    deleteSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      if (obj.type === "activeselection") {
        (obj as ActiveSelection).forEachObject((o) => canvas.remove(o));
        canvas.discardActiveObject();
      } else {
        canvas.remove(obj);
      }
      canvas.renderAll();
      saveHistory();
    },

    bringToFront: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      canvas.bringObjectToFront(obj);
      // Keep background rect at the very bottom
      const bgRect = canvas
        .getObjects()
        .find((o) => o.isCanvasBgRect === true);
      if (bgRect) canvas.sendObjectToBack(bgRect);
      canvas.requestRenderAll();
      saveHistory();
    },

    bringForward: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      canvas.bringObjectForward(obj);
      canvas.requestRenderAll();
      saveHistory();
    },

    sendBackward: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;

      // Keep above the background rect
      const objects = canvas.getObjects();
      const objIdx = objects.indexOf(obj);
      const bgRect = objects.find((o) => o.isCanvasBgRect === true);
      const bgIdx = bgRect ? objects.indexOf(bgRect) : -1;

      if (objIdx > bgIdx + 1) {
        canvas.sendObjectBackwards(obj);
        canvas.requestRenderAll();
        saveHistory();
      }
    },

    sendToBack: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;

      canvas.sendObjectToBack(obj);
      // Move bgRect back to the absolute bottom
      const bgRect = canvas
        .getObjects()
        .find((o) => o.isCanvasBgRect === true);
      if (bgRect) canvas.sendObjectToBack(bgRect);
      canvas.requestRenderAll();
      saveHistory();
    },

    exportPNG: (multiplier?: number) => {
      return new Promise<Blob>(async (res, rej) => {
        try {
          const canvas = fabricRef.current;
          if (!canvas) return rej(new Error("Canvas not ready"));

          const activeObj = canvas.getActiveObject();
          canvas.discardActiveObject();

          // Locate the photo slot guide objects
          const objects = canvas.getObjects();
          const photoSlotIdx = objects.findIndex(
            (obj) => obj.isPhotoSlotRect === true,
          );
          const photoSlot = photoSlotIdx !== -1 ? objects[photoSlotIdx] : null;
          const photoText = objects.find(
            (obj) => obj.isPhotoSlotText === true,
          );

          const photoSlotVisible = photoSlot ? photoSlot.visible : false;
          const photoTextVisible = photoText ? photoText.visible : false;

          // Create and insert destination-out mask at photo slot guide position
          let mask: Rect | null = null;
          if (photoSlotIdx !== -1 && photoSlot) {
            const { Rect } = await import("fabric");
            mask = new Rect({
              left: photoSlot.left,
              top: photoSlot.top,
              originX: photoSlot.originX,
              originY: photoSlot.originY,
              width: photoSlot.width,
              height: photoSlot.height,
              fill: "black",
              globalCompositeOperation: "destination-out",
              objectCaching: false,
              selectable: false,
              evented: false,
            });

            // In Fabric v6/v7, signature is canvas.insertAt(index, ...objects)
            canvas.insertAt(photoSlotIdx, mask);
          }

          // Hide the guest photo guides during export
          if (photoSlot) photoSlot.set("visible", false);
          if (photoText) photoText.set("visible", false);
          canvas.renderAll();

          // Export the Fabric canvas to a data URL (will have transparent cutout)
          const mult = multiplier ?? exportMultRef.current;
          const dataUrl = canvas.toDataURL({ format: "png", multiplier: mult });

          // Clean up mask
          if (mask) {
            canvas.remove(mask);
          }

          // Restore guides and active object
          if (photoSlot) photoSlot.set("visible", photoSlotVisible);
          if (photoText) photoText.set("visible", photoTextVisible);
          if (activeObj) canvas.setActiveObject(activeObj);
          canvas.renderAll();

          fetch(dataUrl)
            .then((r) => r.blob())
            .then(res)
            .catch(rej);
        } catch (err) {
          rej(err);
        }
      });
    },

    getSelectedTextProps: () => {
      const obj = fabricRef.current?.getActiveObject();
      if (!obj || (obj.type !== "textbox" && obj.type !== "i-text"))
        return null;
      const textObj = obj as Textbox;
      return {
        color: (textObj.fill as string) || "#000000",
        fontSize: textObj.fontSize || 36,
        fontFamily: textObj.fontFamily || "Arial",
        isBold: textObj.fontWeight === "bold",
        isItalic: textObj.fontStyle === "italic",
      };
    },

    applyTextProps: (props) => {
      const obj = fabricRef.current?.getActiveObject();
      if (!obj || (obj.type !== "textbox" && obj.type !== "i-text")) return;
      if (props.color !== undefined) obj.set("fill", props.color);
      if (props.fontSize !== undefined) obj.set("fontSize", props.fontSize);
      if (props.fontFamily !== undefined)
        obj.set("fontFamily", props.fontFamily);
      if (props.isBold !== undefined)
        obj.set("fontWeight", props.isBold ? "bold" : "normal");
      if (props.isItalic !== undefined)
        obj.set("fontStyle", props.isItalic ? "italic" : "normal");
      fabricRef.current?.renderAll();
      saveHistory();
    },

    getSelectedShapeProps: () => {
      const obj = fabricRef.current?.getActiveObject();
      if (
        !obj ||
        (obj.type !== "rect" && obj.type !== "circle" && obj.type !== "line")
      )
        return null;
      return {
        fill: (obj.fill as string) || "transparent",
        stroke: (obj.stroke as string) || "#000000",
        strokeWidth: obj.strokeWidth || 4,
      };
    },

    applyShapeProps: (props) => {
      const obj = fabricRef.current?.getActiveObject();
      if (
        !obj ||
        (obj.type !== "rect" && obj.type !== "circle" && obj.type !== "line")
      )
        return;
      if (props.fill !== undefined) obj.set("fill", props.fill);
      if (props.stroke !== undefined) obj.set("stroke", props.stroke);
      if (props.strokeWidth !== undefined)
        obj.set("strokeWidth", props.strokeWidth);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    applyOpacity: (v) => {
      const obj = fabricRef.current?.getActiveObject();
      if (!obj) return;
      obj.set("opacity", v);
      fabricRef.current?.renderAll();
      saveHistory();
    },

    setCanvasBgColor: async (color) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const { Rect } = await import("fabric");
      let bgRect = canvas
        .getObjects()
        .find(
          (obj) =>
            obj.isCanvasBgRect === true ||
            (obj.type === "rect" &&
              obj.left === 0 &&
              obj.top === 0 &&
              obj.width === width &&
              obj.height === height &&
              !obj.selectable),
        );
      if (!bgRect) {
        bgRect = new Rect({
          left: 0,
          top: 0,
          width,
          height,
          fill: color,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        bgRect.isCanvasBgRect = true;
        canvas.add(bgRect);
        canvas.sendObjectToBack(bgRect);
      } else {
        bgRect.set("fill", color);
      }

      canvas.backgroundColor = color;
      canvas.requestRenderAll();
      saveHistory();
    },
  }));

  return (
    <div
      ref={containerRef}
      className="relative rounded-md overflow-hidden border border-border/40"
      style={{
        background:
          "repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
        width,
        height,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          textarea[data-fabric-hiddentextarea] {
            opacity: 0 !important;
            background: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            pointer-events: none !important;
            width: 0 !important;
            height: 0 !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
        `,
        }}
      />
      <canvas ref={canvasElRef} />
    </div>
  );
});
