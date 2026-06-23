"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TextBIcon, TextItalicIcon } from "@phosphor-icons/react";

interface TextPropertiesProps {
  color: string;
  fontSize: number;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  onChange: (props: Partial<{
    color: string;
    fontSize: number;
    fontFamily: string;
    isBold: boolean;
    isItalic: boolean;
  }>) => void;
}

const FONTS = [
  "Arial",
  "Georgia",
  "Playfair Display",
  "Dancing Script",
  "Montserrat",
  "Roboto",
  "Lato",
  "Pacifico",
  "Great Vibes",
  "Cinzel",
];

export function TextPropertiesPanel({
  color,
  fontSize,
  fontFamily,
  isBold,
  isItalic,
  onChange,
}: TextPropertiesProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Text Properties
      </p>

      <div className="grid grid-cols-2 gap-2">
        {/* Font family */}
        <div className="space-y-1 col-span-2">
          <Label className="text-[10px] text-muted-foreground">Font</Label>
          <Select value={fontFamily} onValueChange={(v) => onChange({ fontFamily: v })}>
            <SelectTrigger className="h-8 text-xs bg-background border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font size */}
        <div className="space-y-1">
          <Label htmlFor="font-size" className="text-[10px] text-muted-foreground">Size</Label>
          <Input
            id="font-size"
            type="number"
            min={8}
            max={200}
            value={fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="h-8 text-xs bg-background border-border/60"
          />
        </div>

        {/* Color */}
        <div className="space-y-1">
          <Label htmlFor="text-color" className="text-[10px] text-muted-foreground">Color</Label>
          <div className="flex gap-1.5 items-center">
            <input
              id="text-color"
              type="color"
              value={color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="h-8 w-8 rounded cursor-pointer border border-border/40 bg-background p-0.5"
            />
            <Input
              value={color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="h-8 text-xs bg-background border-border/60 font-mono"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Bold / Italic */}
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant={isBold ? "default" : "outline"}
          size="sm"
          onClick={() => onChange({ isBold: !isBold })}
          className={cn("h-7 w-8 p-0 text-xs cursor-pointer", isBold && "bg-primary text-primary-foreground")}
        >
          <TextBIcon className="size-3.5" weight="bold" />
        </Button>
        <Button
          type="button"
          variant={isItalic ? "default" : "outline"}
          size="sm"
          onClick={() => onChange({ isItalic: !isItalic })}
          className={cn("h-7 w-8 p-0 text-xs cursor-pointer", isItalic && "bg-primary text-primary-foreground")}
        >
          <TextItalicIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
