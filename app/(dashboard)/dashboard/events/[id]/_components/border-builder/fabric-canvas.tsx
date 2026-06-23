"use client";

import * as React from "react";

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
    color: string; fontSize: number; fontFamily: string;
    isBold: boolean; isItalic: boolean;
  } | null;
  applyTextProps: (props: Partial<{
    color: string; fontSize: number; fontFamily: string;
    isBold: boolean; isItalic: boolean;
  }>) => void;
  getSelectedShapeProps: () => {
    fill: string; stroke: string; strokeWidth: number;
  } | null;
  applyShapeProps: (props: Partial<{
    fill: string; stroke: string; strokeWidth: number;
  }>) => void;
  applyOpacity: (v: number) => void;
  setCanvasBgColor: (color: string) => void;
}

interface FabricCanvasProps {
  width: number;
  height: number;
  /** Multiplier applied on export so the PNG is at full Instagram resolution. Default: 2 */
  exportMultiplier?: number;
  onSelectionChange: (isText: boolean, isShape: boolean, hasSelection: boolean, opacity: number) => void;
}

export const FabricCanvas = React.forwardRef<FabricCanvasHandle, FabricCanvasProps>(
  function FabricCanvas({ width, height, exportMultiplier = 2, onSelectionChange }, ref) {
    const canvasElRef = React.useRef<HTMLCanvasElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fabricRef = React.useRef<any>(null);
    const historyRef = React.useRef<string[]>([]);
    const historyIdxRef = React.useRef(-1);
    // Always reflect the latest multiplier without re-registering the handle
    const exportMultRef = React.useRef(exportMultiplier);
    React.useEffect(() => { exportMultRef.current = exportMultiplier; }, [exportMultiplier]);

    const saveHistory = React.useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const json = JSON.stringify(canvas.toJSON(['backgroundColor', 'isCanvasBgRect']));
      // Truncate future if we undid
      historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
      historyRef.current.push(json);
      historyIdxRef.current = historyRef.current.length - 1;
    }, []);

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
        try { fabricRef.current.dispose(); } catch { /* ignore */ }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const el = canvasElRef.current as any;
        if (el._fc_instance) {
          try { el._fc_instance.dispose(); } catch { /* ignore */ }
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
        (bgRect as any).isCanvasBgRect = true;
        canvas.add(bgRect);
        canvas.sendObjectToBack(bgRect);

        canvas.renderAll();

        fabricRef.current = canvas;

        canvas.on("selection:created", () => {
          const obj = canvas.getActiveObject();
          const isText = obj?.type === "textbox" || obj?.type === "i-text";
          const isShape = obj?.type === "rect" || obj?.type === "circle" || obj?.type === "line";
          onSelectionChange(isText, isShape, true, (obj as any)?.opacity ?? 1);
        });
        canvas.on("selection:updated", () => {
          const obj = canvas.getActiveObject();
          const isText = obj?.type === "textbox" || obj?.type === "i-text";
          const isShape = obj?.type === "rect" || obj?.type === "circle" || obj?.type === "line";
          onSelectionChange(isText, isShape, true, (obj as any)?.opacity ?? 1);
        });
        canvas.on("selection:cleared", () => onSelectionChange(false, false, false, 1));
        canvas.on("object:modified", saveHistory);
        canvas.on("object:added", (e: any) => {
          const obj = e.target || e;
          if (obj && (obj.type === "textbox" || obj.type === "i-text")) {
            obj.hiddenTextareaContainer = containerRef.current || undefined;
          }
          saveHistory();
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
          try { snap.dispose(); } catch { /* ignore */ }
        }
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

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
      },

      addRect: async () => {
        const { Rect } = await import("fabric");
        const r = new Rect({
          left: 60, top: 60, width: 120, height: 80,
          fill: "transparent",
          stroke: "#000000", // Default to black stroke
          strokeWidth: 4,
        });
        fabricRef.current?.add(r);
        fabricRef.current?.setActiveObject(r);
        fabricRef.current?.renderAll();
      },

      addCircle: async () => {
        const { Circle } = await import("fabric");
        const c = new Circle({
          left: 80, top: 80, radius: 50,
          fill: "transparent",
          stroke: "#000000",
          strokeWidth: 4,
        });
        fabricRef.current?.add(c);
        fabricRef.current?.setActiveObject(c);
        fabricRef.current?.renderAll();
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
      },

      importImageFile: async (file: File) => {
        const url = URL.createObjectURL(file);
        const { FabricImage } = await import("fabric");
        const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        const scale = Math.min(width / img.width!, height / img.height!) * 0.5;
        img.scale(scale);
        img.set({ left: (width - img.getScaledWidth()) / 2, top: (height - img.getScaledHeight()) / 2 });
        fabricRef.current?.add(img);
        fabricRef.current?.setActiveObject(img);
        fabricRef.current?.renderAll();
      },

      importImageUrl: async (url: string) => {
        const { FabricImage } = await import("fabric");
        const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        const scale = Math.min(width / img.width!, height / img.height!) * 0.5;
        img.scale(scale);
        img.set({ left: (width - img.getScaledWidth()) / 2, top: (height - img.getScaledHeight()) / 2 });
        fabricRef.current?.add(img);
        fabricRef.current?.setActiveObject(img);
        fabricRef.current?.renderAll();
      },

      undo: () => {
        if (historyIdxRef.current <= 0) return;
        historyIdxRef.current--;
        const json = historyRef.current[historyIdxRef.current];
        fabricRef.current?.loadFromJSON(json).then(() => {
          fabricRef.current?.getObjects().forEach((obj: any) => {
            if (obj.type === "textbox" || obj.type === "i-text") {
              obj.hiddenTextareaContainer = containerRef.current || undefined;
            }
          });
          fabricRef.current?.renderAll();
        });
      },

      redo: () => {
        if (historyIdxRef.current >= historyRef.current.length - 1) return;
        historyIdxRef.current++;
        const json = historyRef.current[historyIdxRef.current];
        fabricRef.current?.loadFromJSON(json).then(() => {
          fabricRef.current?.getObjects().forEach((obj: any) => {
            if (obj.type === "textbox" || obj.type === "i-text") {
              obj.hiddenTextareaContainer = containerRef.current || undefined;
            }
          });
          fabricRef.current?.renderAll();
        });
      },

      deleteSelected: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type === "activeselection") {
          (obj as any).forEachObject((o: any) => canvas.remove(o));
          canvas.discardActiveObject();
        } else {
          canvas.remove(obj);
        }
        canvas.renderAll();
        saveHistory();
      },

      exportPNG: (multiplier?: number) => {
        return new Promise<Blob>((res, rej) => {
          const canvas = fabricRef.current;
          if (!canvas) return rej(new Error("Canvas not ready"));
          canvas.discardActiveObject();
          canvas.renderAll();
          const mult = multiplier ?? exportMultRef.current;
          const dataUrl = canvas.toDataURL({ format: "png", multiplier: mult });
          fetch(dataUrl).then((r) => r.blob()).then(res).catch(rej);
        });
      },

      getSelectedTextProps: () => {
        const obj = fabricRef.current?.getActiveObject();
        if (!obj || (obj.type !== "textbox" && obj.type !== "i-text")) return null;
        return {
          color: (obj.fill as string) || "#000000",
          fontSize: obj.fontSize || 36,
          fontFamily: obj.fontFamily || "Arial",
          isBold: obj.fontWeight === "bold",
          isItalic: obj.fontStyle === "italic",
        };
      },

      applyTextProps: (props) => {
        const obj = fabricRef.current?.getActiveObject();
        if (!obj || (obj.type !== "textbox" && obj.type !== "i-text")) return;
        if (props.color !== undefined) obj.set("fill", props.color);
        if (props.fontSize !== undefined) obj.set("fontSize", props.fontSize);
        if (props.fontFamily !== undefined) obj.set("fontFamily", props.fontFamily);
        if (props.isBold !== undefined) obj.set("fontWeight", props.isBold ? "bold" : "normal");
        if (props.isItalic !== undefined) obj.set("fontStyle", props.isItalic ? "italic" : "normal");
        fabricRef.current?.renderAll();
        saveHistory();
      },

      getSelectedShapeProps: () => {
        const obj = fabricRef.current?.getActiveObject();
        if (!obj || (obj.type !== "rect" && obj.type !== "circle" && obj.type !== "line")) return null;
        return {
          fill: (obj.fill as string) || "transparent",
          stroke: obj.stroke || "#000000",
          strokeWidth: obj.strokeWidth || 4,
        };
      },

      applyShapeProps: (props) => {
        const obj = fabricRef.current?.getActiveObject();
        if (!obj || (obj.type !== "rect" && obj.type !== "circle" && obj.type !== "line")) return;
        if (props.fill !== undefined) obj.set("fill", props.fill);
        if (props.stroke !== undefined) obj.set("stroke", props.stroke);
        if (props.strokeWidth !== undefined) obj.set("strokeWidth", props.strokeWidth);
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
        let bgRect = canvas.getObjects().find((obj: any) => obj.isCanvasBgRect);
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
        <style dangerouslySetInnerHTML={{ __html: `
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
        `}} />
        <canvas ref={canvasElRef} />
      </div>
    );
  }
);
