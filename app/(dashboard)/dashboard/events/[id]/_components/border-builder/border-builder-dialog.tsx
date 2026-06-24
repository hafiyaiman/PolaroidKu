"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  DownloadSimpleIcon,
  SpinnerGapIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsVerticalIcon,
  ImageIcon,
} from "@phosphor-icons/react";
import { FabricCanvas, FabricCanvasHandle } from "./fabric-canvas";
import { BuilderToolbar } from "./builder-toolbar";
import { TextPropertiesPanel } from "./text-properties-panel";
import { ShapePropertiesPanel } from "./shape-properties-panel";
import { requestBorderUploadUrl } from "@/app/(dashboard)/dashboard/events/_actions/event-actions";
import {
  useCreateBorder,
  useUpdateBorder,
} from "../../../_hooks/use-event-details";

const LAYOUTS = [
  {
    id: "story_916",
    label: "Story (9:16)",
    w: 360,
    h: 640,
    exportW: 1080,
    exportH: 1920,
    exportMult: 3,
  },
];



type PhotoAlign = "top" | "center" | "bottom";

interface BorderItem {
  id: string;
  name: string | null;
  imageKey: string;
  layoutType: string;
  photoAlign?: string;
  imageUrl: string;
}

interface BorderBuilderDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  borderToEdit?: BorderItem | null;
}

export function BorderBuilderDialog({
  eventId,
  open,
  onOpenChange,
  borderToEdit = null,
}: BorderBuilderDialogProps) {
  const [layoutId] = React.useState("story_916");
  const [borderName, setBorderName] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);
  const [canvasBgColor, setCanvasBgColor] = React.useState("#ffffff");
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  const [photoAlign, setPhotoAlign] = React.useState<PhotoAlign>("center");
  const [showOverlay, setShowOverlay] = React.useState(true);

  // Fabric canvas selection state
  const [selectionIsText, setSelectionIsText] = React.useState(false);
  const [selectionIsShape, setSelectionIsShape] = React.useState(false);
  const [hasSelection, setHasSelection] = React.useState(false);
  const [opacity, setOpacity] = React.useState(1);
  const [textProps, setTextProps] = React.useState({
    color: "#000000",
    fontSize: 36,
    fontFamily: "Arial",
    isBold: false,
    isItalic: false,
  });
  const [shapeProps, setShapeProps] = React.useState({
    fill: "transparent",
    stroke: "#000000",
    strokeWidth: 4,
  });

  const canvasRef = React.useRef<FabricCanvasHandle>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const createBorder = useCreateBorder(eventId);
  const updateBorder = useUpdateBorder(eventId);

  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0];

  React.useEffect(() => {
    if (open) {
      // Explicitly set background color on load/init
      setTimeout(() => {
        setCanvasBgColor("#ffffff");
        canvasRef.current?.setCanvasBgColor("#ffffff");
      }, 50);

      if (borderToEdit) {
        setTimeout(() => {
          setBorderName(borderToEdit.name || "");
        }, 0);
        // Pre-fill canvas with the existing image as background/object
        setTimeout(() => {
          if (borderToEdit.imageUrl) {
            canvasRef.current?.importImageUrl(borderToEdit.imageUrl);
          }
        }, 500);
      } else {
        setTimeout(() => {
          setBorderName("");
        }, 0);
      }
    }
  }, [open, borderToEdit]);

  const handleSelectionChange = (
    isText: boolean,
    isShape: boolean,
    hasSel: boolean,
    op: number,
  ) => {
    setSelectionIsText(isText);
    setSelectionIsShape(isShape);
    setHasSelection(hasSel);
    setOpacity(op);
    if (isText) {
      const props = canvasRef.current?.getSelectedTextProps();
      if (props) setTextProps(props);
    } else if (isShape) {
      const props = canvasRef.current?.getSelectedShapeProps();
      if (props) setShapeProps(props);
    }
  };

  const handleTextPropChange = (props: Partial<typeof textProps>) => {
    setTextProps((prev) => ({ ...prev, ...props }));
    canvasRef.current?.applyTextProps(props);
  };

  const handleShapePropChange = (props: Partial<typeof shapeProps>) => {
    setShapeProps((prev) => ({ ...prev, ...props }));
    canvasRef.current?.applyShapeProps(props);
  };

  const handleOpacityChange = (v: number) => {
    setOpacity(v);
    canvasRef.current?.applyOpacity(v);
  };

  const handleExportAndSave = async () => {
    if (!borderName.trim()) {
      toast.error("Please enter a name for this frame.");
      return;
    }

    setIsExporting(true);
    try {
      const blob = await canvasRef.current!.exportPNG(layout.exportMult);

      const presigned = await requestBorderUploadUrl({
        eventId,
        filename: `${borderName.replace(/\s+/g, "-").toLowerCase()}-builder.png`,
        contentType: "image/png",
      });

      if (presigned.error) {
        toast.error(presigned.error);
        return;
      }

      const { uploadUrl, key } = presigned;

      const uploadOk = await new Promise<boolean>((res) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl!, true);
        xhr.setRequestHeader("Content-Type", "image/png");
        xhr.onload = () => res(xhr.status === 200);
        xhr.onerror = () => res(false);
        xhr.send(blob);
      });

      if (!uploadOk) {
        toast.error("Upload failed. Please try again.");
        return;
      }

      const saveRes = borderToEdit
        ? await updateBorder.mutateAsync({
            borderId: borderToEdit.id,
            name: borderName.trim(),
            imageKey: key!,
            photoAlign,
          })
        : await createBorder.mutateAsync({
            name: borderName.trim(),
            imageKey: key!,
            layoutType: layoutId,
            photoAlign,
          });

      if (saveRes.error) {
        toast.error(saveRes.error);
      } else {
        toast.success(
          borderToEdit
            ? `Frame "${borderName}" updated successfully!`
            : `Frame "${borderName}" saved successfully!`,
        );
        onOpenChange(false);
        setBorderName("");
      }
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to save frame: ${msg}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[calc(100vw-10rem)] w-full h-[90vh] max-h-[90vh] p-0 flex flex-col bg-background border-border/40 overflow-hidden">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border/40 shrink-0">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <CheckCircleIcon className="size-4 text-primary" />
            Frame Builder
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar — controls */}
          <div className="w-md border-r border-border/40 flex flex-col gap-4 p-4 overflow-y-auto shrink-0">
            {/* Layout Info */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Layout Aspect Ratio
              </Label>
              <div className="px-3 py-2 rounded-lg border border-border/60 bg-muted/20 text-xs font-semibold text-foreground">
                Story (9:16)
                <span className="block text-[9px] font-normal opacity-60 mt-0.5">
                  1080 × 1920 px (export resolution)
                </span>
              </div>
            </div>

            {/* Frame name */}
            <div className="space-y-1">
              <Label
                htmlFor="frame-name-builder"
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              >
                Frame Name *
              </Label>
              <Input
                id="frame-name-builder"
                value={borderName}
                onChange={(e) => setBorderName(e.target.value)}
                placeholder="e.g. Floral Vintage"
                maxLength={50}
                className="h-8 text-xs bg-background border-border/60"
              />
            </div>

            {/* Canvas Background Color */}
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Canvas Background
              </Label>
              <div className="flex gap-1.5 items-center">
                <input
                  id="canvas-bg-color"
                  type="color"
                  value={
                    canvasBgColor === "transparent" ? "#ffffff" : canvasBgColor
                  }
                  onChange={(e) => {
                    setCanvasBgColor(e.target.value);
                    canvasRef.current?.setCanvasBgColor(e.target.value);
                  }}
                  className="h-8 w-8 rounded cursor-pointer border border-border/40 bg-background p-0.5"
                  disabled={canvasBgColor === "transparent"}
                />
                <Input
                  value={canvasBgColor}
                  onChange={(e) => {
                    setCanvasBgColor(e.target.value);
                    canvasRef.current?.setCanvasBgColor(e.target.value);
                  }}
                  className="h-8 text-xs bg-background border-border/60 font-mono flex-1"
                  placeholder="transparent or hex"
                />
                <Button
                  type="button"
                  variant={
                    canvasBgColor === "transparent" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    const nextColor =
                      canvasBgColor === "transparent"
                        ? "#ffffff"
                        : "transparent";
                    setCanvasBgColor(nextColor);
                    canvasRef.current?.setCanvasBgColor(nextColor);
                  }}
                  className="h-8 text-[10px] px-2 cursor-pointer font-semibold"
                >
                  {canvasBgColor === "transparent" ? "Solid" : "Transparent"}
                </Button>
              </div>
            </div>

            {/* Photo Slot Alignment */}
            <div className="space-y-1.5 border-t border-border/30 pt-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Photo Slot Position
              </Label>
              <p className="text-[9px] text-muted-foreground/70 leading-relaxed">
                Shows where the guest&apos;s photo will appear. The overlay
                cannot be clicked or moved.
              </p>
              <div className="flex gap-1">
                {(
                  [
                    {
                      id: "top" as PhotoAlign,
                      icon: ArrowUpIcon,
                      label: "Top",
                    },
                    {
                      id: "center" as PhotoAlign,
                      icon: ArrowsVerticalIcon,
                      label: "Center",
                    },
                    {
                      id: "bottom" as PhotoAlign,
                      icon: ArrowDownIcon,
                      label: "Bottom",
                    },
                  ] as const
                ).map(({ id, icon: Icon, label }) => (
                  <Button
                    key={id}
                    type="button"
                    variant={photoAlign === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPhotoAlign(id)}
                    className={cn(
                      "flex-1 text-[10px] h-8 cursor-pointer font-semibold flex items-center justify-center gap-1",
                      photoAlign === id && "shadow-sm",
                    )}
                  >
                    <Icon
                      className="size-3"
                      weight={photoAlign === id ? "bold" : "regular"}
                    />
                    {label}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant={showOverlay ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOverlay((v) => !v)}
                className="w-full text-[10px] h-7 cursor-pointer font-semibold flex items-center justify-center gap-1.5 mt-1"
              >
                <ImageIcon className="size-3" />
                {showOverlay ? "Hide Overlay" : "Show Overlay"}
              </Button>
            </div>

            {/* Text properties (when text selected) */}
            {selectionIsText && hasSelection && (
              <TextPropertiesPanel
                color={textProps.color}
                fontSize={textProps.fontSize}
                fontFamily={textProps.fontFamily}
                isBold={textProps.isBold}
                isItalic={textProps.isItalic}
                onChange={handleTextPropChange}
              />
            )}

            {/* Shape properties (when shape selected) */}
            {selectionIsShape && hasSelection && (
              <ShapePropertiesPanel
                fill={shapeProps.fill}
                stroke={shapeProps.stroke}
                strokeWidth={shapeProps.strokeWidth}
                onChange={handleShapePropChange}
              />
            )}

            {/* Image import trigger (hidden input) */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setUploadedImages((prev) => [...prev, url]);
                  canvasRef.current?.importImageUrl(url);
                }
                e.target.value = "";
              }}
            />

            {/* Uploaded images gallery */}
            <div className="space-y-2 border-t border-border/30 pt-3">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Uploaded Images
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 cursor-pointer flex items-center justify-center gap-1.5"
                onClick={() => imageInputRef.current?.click()}
              >
                <span>Upload Image</span>
              </Button>
              <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {uploadedImages.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => canvasRef.current?.importImageUrl(url)}
                    className="aspect-square bg-muted/40 rounded border border-border/40 overflow-hidden hover:border-foreground/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <img
                      src={url}
                      alt={`Uploaded ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {uploadedImages.length === 0 && (
                  <div className="col-span-3 text-[10px] text-muted-foreground/60 text-center py-6 border border-dashed border-border/40 rounded bg-muted/10">
                    No images uploaded yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main canvas area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="shrink-0 bg-background border-b border-border/40 p-2 z-10">
              <BuilderToolbar
                onAddText={() => canvasRef.current?.addText()}
                onAddRect={() => canvasRef.current?.addRect()}
                onAddCircle={() => canvasRef.current?.addCircle()}
                onAddLine={() => canvasRef.current?.addLine()}
                onImportImage={() => imageInputRef.current?.click()}
                onUndo={() => canvasRef.current?.undo()}
                onRedo={() => canvasRef.current?.redo()}
                onDeleteSelected={() => canvasRef.current?.deleteSelected()}
                onBringToFront={() => canvasRef.current?.bringToFront()}
                onBringForward={() => canvasRef.current?.bringForward()}
                onSendBackward={() => canvasRef.current?.sendBackward()}
                onSendToBack={() => canvasRef.current?.sendToBack()}
                opacity={opacity}
                onOpacityChange={handleOpacityChange}
                hasSelection={hasSelection}
              />
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-zinc-900">
              <div
                className="relative"
                style={{ width: layout.w, height: layout.h }}
              >
                <FabricCanvas
                  ref={canvasRef}
                  width={layout.w}
                  height={layout.h}
                  photoAlign={photoAlign}
                  showOverlay={showOverlay}
                  exportMultiplier={layout.exportMult}
                  onSelectionChange={handleSelectionChange}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-border/40 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleExportAndSave}
            disabled={isExporting || !borderName.trim()}
            className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {isExporting ? (
              <>
                <SpinnerGapIcon className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <DownloadSimpleIcon className="size-3.5" />
                Export & Save Frame
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
