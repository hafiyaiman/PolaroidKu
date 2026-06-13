"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import { useUpdateProfile } from "../_hooks/use-settings";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface AccountSettingsProps {
  user: User;
  phoneNumber: string;
}

const AVATARS = [
  { id: "avatar-camera", emoji: "📸", bg: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { id: "avatar-star", emoji: "🌟", bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { id: "avatar-cool", emoji: "😎", bg: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "avatar-fox", emoji: "🦊", bg: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "avatar-artist", emoji: "🎨", bg: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "avatar-rocket", emoji: "🚀", bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
];

export function AccountSettings({ user, phoneNumber: initialPhone }: AccountSettingsProps) {
  const [name, setName] = React.useState(user.name);
  const [phoneNumber, setPhoneNumber] = React.useState(initialPhone);
  const [selectedAvatar, setSelectedAvatar] = React.useState(user.image || "avatar-camera");

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    updateProfile({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      image: selectedAvatar,
    }).then((res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile settings updated successfully!");
      }
    }).catch((err) => {
      console.error(err);
      toast.error("An error occurred while updating profile settings.");
    });
  };

  const hasChanges =
    name !== user.name ||
    phoneNumber !== initialPhone ||
    selectedAvatar !== (user.image || "avatar-camera");

  return (
    <Card className="bg-card/45 border-border/40">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="text-sm font-bold text-foreground">Profile Information</CardTitle>
        <CardDescription className="text-xs">
          Update your basic user details and select an avatar representation.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateProfile}>
        <CardContent className="space-y-6 pt-4">
          {/* Avatar Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">Select Profile Photo / Avatar</Label>
            <div className="flex flex-wrap gap-3 items-center">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`size-12 rounded-xl flex items-center justify-center text-xl border transition-all cursor-pointer ${av.bg} ${
                      isSelected
                        ? "ring-2 ring-primary ring-offset-2 scale-110 shadow"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {av.emoji}
                  </button>
                );
              })}

              {!selectedAvatar.startsWith("avatar-") && selectedAvatar && (
                <div className="size-12 rounded-xl overflow-hidden border border-primary/20 ring-2 ring-primary ring-offset-2">
                  <img src={selectedAvatar} alt="Profile Photo" className="size-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="text-xs bg-background/50"
                disabled={isPending}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs font-semibold text-foreground">
                Phone Number (Optional)
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +60123456789"
                className="text-xs bg-background/50"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5 max-w-full">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </Label>
              <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] py-0 px-1.5 font-medium flex items-center gap-0.5">
                <ShieldCheckIcon className="size-3" />
                Auth Verified
              </Badge>
            </div>
            <Input
              id="email"
              value={user.email}
              readOnly
              disabled
              className="text-xs bg-muted/40 text-muted-foreground border-border/25 cursor-not-allowed select-none"
            />
            <p className="text-[10px] text-muted-foreground">
              Your login email is managed via Neon Auth and cannot be modified here.
            </p>
          </div>
        </CardContent>
        <CardFooter className="pt-3 border-t border-border/30 justify-end">
          <Button
            type="submit"
            disabled={isPending || !hasChanges}
            className="text-xs h-8 cursor-pointer active:scale-95 transition-all bg-primary text-primary-foreground font-semibold"
          >
            {isPending ? "Saving changes..." : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
