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
import {
  useSessions,
  useChangePassword,
  useRevokeSession,
  useRevokeOtherSessions,
  type SessionRecord,
} from "../_hooks/use-settings";

interface SecuritySettingsProps {
  initialSessions: SessionRecord[];
}

export function SecuritySettings({ initialSessions }: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [revokeOthers, setRevokeOthers] = React.useState(false);

  const { data: sessions = [] } = useSessions(initialSessions);

  const { mutateAsync: changePassword, isPending: isSecurityPending } = useChangePassword();
  const { mutateAsync: revokeSession } = useRevokeSession();
  const { mutateAsync: revokeOtherSessions } = useRevokeOtherSessions();

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: revokeOthers,
    }).then((res) => {
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    }).catch((err) => {
      console.error(err);
      toast.error("An error occurred while changing password.");
    });
  };

  const handleRevokeSession = async (sessionId: string, token: string) => {
    const res = await revokeSession(token || sessionId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Device logged out successfully.");
    }
  };

  const handleRevokeOtherSessions = async () => {
    const res = await revokeOtherSessions();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Logged out of all other devices.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card className="bg-card/45 border-border/40">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-bold text-foreground">Update Password</CardTitle>
          <CardDescription className="text-xs">
            Ensure your account is protected by using a secure, long password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="currPass" className="text-xs font-semibold text-foreground">
                  Current Password
                </Label>
                <Input
                  id="currPass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs bg-background/50"
                  disabled={isSecurityPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPass" className="text-xs font-semibold text-foreground">
                  New Password
                </Label>
                <Input
                  id="newPass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs bg-background/50"
                  disabled={isSecurityPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confPass" className="text-xs font-semibold text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confPass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-xs bg-background/50"
                  disabled={isSecurityPending}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                id="revokeOthers"
                type="checkbox"
                checked={revokeOthers}
                onChange={(e) => setRevokeOthers(e.target.checked)}
                className="rounded border-border bg-background text-primary focus:ring-primary size-4 cursor-pointer"
              />
              <label htmlFor="revokeOthers" className="text-xs text-muted-foreground select-none cursor-pointer">
                Sign out of all other devices upon password change
              </label>
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t border-border/30 justify-end">
            <Button
              type="submit"
              disabled={isSecurityPending || !currentPassword || !newPassword || !confirmPassword}
              className="text-xs h-8 cursor-pointer active:scale-95 transition-all bg-primary text-primary-foreground font-semibold"
            >
              {isSecurityPending ? "Changing..." : "Change password"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Active Sessions Card */}
      <Card className="bg-card/45 border-border/40">
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Active Sessions</CardTitle>
              <CardDescription className="text-xs">
                Devices currently signed in to your PolaroidKu account.
              </CardDescription>
            </div>
            {sessions.length > 1 && (
              <Button
                variant="outline"
                onClick={handleRevokeOtherSessions}
                className="text-[10px] h-7 px-2.5 font-bold text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                Sign out all other devices
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 divide-y divide-border/20">
          {sessions.map((sess: SessionRecord) => {
            const isCurrent = sess.active;
            return (
              <div key={sess.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {sess.userAgent || "Unknown Browser / Device"}
                    </span>
                    {isCurrent && (
                      <Badge className="bg-green-500/15 text-green-500 border border-green-500/20 text-[9px] py-0 px-1 font-semibold">
                        Current session
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                    <span>IP: {sess.ipAddress || "127.0.0.1"}</span>
                    <span>•</span>
                    <span>Last seen: {new Date(sess.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {!isCurrent && (
                  <Button
                    variant="ghost"
                    onClick={() => handleRevokeSession(sess.id, sess.token)}
                    className="text-[10px] h-7 px-2 text-destructive hover:bg-destructive/10 font-bold cursor-pointer"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
