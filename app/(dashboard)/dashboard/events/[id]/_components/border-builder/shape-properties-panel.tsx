"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ShapePropertiesProps {
  fill: string;
  stroke: string;
  strokeWidth: number;
  onChange: (
    props: Partial<{
      fill: string;
      stroke: string;
      strokeWidth: number;
    }>,
  ) => void;
}

export function ShapePropertiesPanel({
  fill,
  stroke,
  strokeWidth,
  onChange,
}: ShapePropertiesProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Shape Properties
      </p>

      {/* Fill Color (Background) */}
      <div className="space-y-1">
        <Label
          htmlFor="shape-fill-color"
          className="text-[10px] text-muted-foreground"
        >
          Fill Color (Background)
        </Label>
        <div className="flex gap-1.5 items-center">
          <input
            id="shape-fill-color"
            type="color"
            value={fill === "transparent" ? "#ffffff" : fill}
            onChange={(e) => onChange({ fill: e.target.value })}
            className="h-8 w-8 rounded cursor-pointer border border-border/40 bg-background p-0.5"
            disabled={fill === "transparent"}
          />
          <Input
            value={fill}
            onChange={(e) => onChange({ fill: e.target.value })}
            className="h-8 text-xs bg-background border-border/60 font-mono flex-1"
            placeholder="transparent or hex"
          />
          <Button
            type="button"
            variant={fill === "transparent" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onChange({
                fill: fill === "transparent" ? "#ffffff" : "transparent",
              })
            }
            className="h-8 text-[10px] px-2 cursor-pointer font-semibold"
          >
            {fill === "transparent" ? "Solid fill" : "Transparent"}
          </Button>
        </div>
      </div>

      {/* Border Stroke Color */}
      <div className="space-y-1">
        <Label
          htmlFor="shape-stroke-color"
          className="text-[10px] text-muted-foreground"
        >
          Border Color
        </Label>
        <div className="flex gap-1.5 items-center">
          <input
            id="shape-stroke-color"
            type="color"
            value={stroke === "transparent" ? "#ffffff" : stroke}
            onChange={(e) => onChange({ stroke: e.target.value })}
            className="h-8 w-8 rounded cursor-pointer border border-border/40 bg-background p-0.5"
            disabled={stroke === "transparent"}
          />
          <Input
            value={stroke}
            onChange={(e) => onChange({ stroke: e.target.value })}
            className="h-8 text-xs bg-background border-border/60 font-mono flex-1"
            placeholder="transparent or hex"
          />
          <Button
            type="button"
            variant={stroke === "transparent" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onChange({
                stroke: stroke === "transparent" ? "#ffffff" : "transparent",
              })
            }
            className="h-8 text-[10px] px-2 cursor-pointer font-semibold"
          >
            {stroke === "transparent" ? "Solid border" : "No border"}
          </Button>
        </div>
      </div>

      {/* Border Stroke Width */}
      <div className="space-y-1">
        <Label
          htmlFor="shape-stroke-width"
          className="text-[10px] text-muted-foreground"
        >
          Border Width
        </Label>
        <Input
          id="shape-stroke-width"
          type="number"
          min={0}
          max={50}
          value={strokeWidth}
          onChange={(e) => onChange({ strokeWidth: Number(e.target.value) })}
          className="h-8 text-xs bg-background border-border/60"
        />
      </div>
    </div>
  );
}
