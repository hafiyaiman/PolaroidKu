import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalIcon, ActivityIcon } from "@phosphor-icons/react/dist/ssr";

interface LogItem {
  time: string;
  action: string;
  details: string;
  user: string;
}

interface AdminLogsProps {
  formattedLogs: LogItem[];
}

export function AdminLogs({ formattedLogs }: AdminLogsProps) {
  return (
    <Card className="bg-card/45 border-border/40 lg:col-span-8 flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/25">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <TerminalIcon className="size-4.5 text-pink-500" />
          Live Architecture Operations Log Stream
        </CardTitle>
        <CardDescription className="text-xs">
          Real-time activity log entries tracking bucket provisions, upgrade triggers, and backend operations.
        </CardDescription>
      </CardHeader>
      <CardContent className="font-mono text-[10px] space-y-3 p-4 flex-1">
        {formattedLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No architecture logs recorded yet.
          </div>
        ) : (
          formattedLogs.map((log, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-muted/20 border border-border/40 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-pink-500 tracking-wider flex items-center gap-1.5">
                  <ActivityIcon className="size-3.5" />
                  {log.action}
                </span>
                <span className="text-muted-foreground">{log.time}</span>
              </div>
              <p className="text-foreground/80 leading-relaxed font-sans">{log.details}</p>
              <span className="text-muted-foreground/60 text-[9px] font-sans">Triggered by: {log.user}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
