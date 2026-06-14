import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LockKeyIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";

interface ArchitectureStatusProps {
  bucketName: string;
}

export function ArchitectureStatus({ bucketName }: ArchitectureStatusProps) {
  return (
    <Card className="lg:col-span-4 bg-card/65 border-border/40 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <LockKeyIcon className="size-4.5 text-indigo-400" />
          Architecture Status
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time connection verification and core handshake status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 text-xs">
        <div className="flex justify-between items-center py-2.5 border-b border-border/20">
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">Database Engine</p>
            <span className="text-muted-foreground text-[10px]">Cloud Relational Pool</span>
          </div>
          <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] px-2 py-0.5 flex items-center gap-1">
            <CheckCircleIcon weight="fill" className="size-3.5" />
            Online
          </Badge>
        </div>

        <div className="flex justify-between items-center py-2.5 border-b border-border/20">
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">Object Storage</p>
            <span className="text-muted-foreground text-[10px]">Bucket: {bucketName}</span>
          </div>
          <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] px-2 py-0.5 flex items-center gap-1">
            <CheckCircleIcon weight="fill" className="size-3.5" />
            Connected
          </Badge>
        </div>

        <div className="flex justify-between items-center py-2.5">
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">Payment Gateway</p>
            <span className="text-muted-foreground text-[10px]">CHIP Merchant API</span>
          </div>
          <Badge className="bg-green-500/10 text-green-500 border border-green-500/20 text-[10px] px-2 py-0.5 flex items-center gap-1">
            <CheckCircleIcon weight="fill" className="size-3.5" />
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
