"use client";

import * as React from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdatePreferences } from "../_hooks/use-settings";

interface PreferenceSettingsProps {
  defaultEventVisibility: "public" | "private";
  defaultTheme: "dark" | "light" | "system";
}

export function PreferenceSettings({
  defaultEventVisibility: initialVisibility,
  defaultTheme: initialTheme,
}: PreferenceSettingsProps) {
  const { setTheme } = useTheme();
  const [defaultVisibility, setDefaultVisibility] = React.useState<"public" | "private">(initialVisibility);
  const [defaultTheme, setDefaultTheme] = React.useState<"dark" | "light" | "system">(initialTheme);

  const { mutateAsync: savePreferences, isPending } = useUpdatePreferences();

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences({
      defaultEventVisibility: defaultVisibility,
      defaultTheme: defaultTheme,
    }).then((res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Preferences saved!");
        setTheme(defaultTheme);
      }
    }).catch((err) => {
      console.error(err);
      toast.error("An error occurred while saving preferences.");
    });
  };

  const hasChanges =
    defaultVisibility !== initialVisibility || defaultTheme !== initialTheme;

  return (
    <Card className="bg-card/45 border-border/40">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-bold text-foreground">User Preferences</CardTitle>
        <CardDescription className="text-xs">
          Set your defaults and control layout appearance parameters.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSavePreferences}>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Default Visibility */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Default Event Visibility
              </Label>
              <Select
                value={defaultVisibility}
                onValueChange={(val) => setDefaultVisibility(val as "public" | "private")}
              >
                <SelectTrigger className="w-full text-xs h-9 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground">
                  <SelectValue placeholder="Select Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Default)</SelectItem>
                  <SelectItem value="private">Private (Protected)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Control whether newly created events default to public web wall access.
              </p>
            </div>

            {/* Default Theme */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Default Theme
              </Label>
              <Select
                value={defaultTheme}
                onValueChange={(val) => setDefaultTheme(val as "dark" | "light" | "system")}
              >
                <SelectTrigger className="w-full text-xs h-9 bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-foreground">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                  <SelectItem value="light">Light Theme</SelectItem>
                  <SelectItem value="system">System Preference</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Choose your default visual layout coloring across the dashboard console.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-border/30 justify-end">
          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="text-xs h-8 cursor-pointer active:scale-95 transition-all bg-primary text-primary-foreground font-semibold"
          >
            {isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
