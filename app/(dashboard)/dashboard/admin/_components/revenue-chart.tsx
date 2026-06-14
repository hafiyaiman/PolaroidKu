"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartItem {
  label: string;
  amount: number;
}

interface RevenueChartProps {
  chartData: ChartItem[];
  maxVal: number;
}

export function RevenueChart({ chartData, maxVal }: RevenueChartProps) {
  return (
    <Card className="lg:col-span-8 bg-card/65 border-border/40 flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-foreground">Revenue Trend (Last 7 Days)</CardTitle>
        <CardDescription className="text-xs">
          Gross daily sales volume processed in MYR.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="relative w-full h-[180px] flex items-center justify-center">
          <svg viewBox="0 0 800 160" width="100%" height="100%" className="overflow-visible">
            <defs>
              {/* Stripes Pattern for Inside the Bars */}
              <pattern id="bar-stripes" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-primary)" strokeWidth="2.5" />
              </pattern>
              {/* Gradient background for bars */}
              {/* <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#db2777" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#db2777" stopOpacity={0.25} />
              </linearGradient> */}
            </defs>

            {/* Clean Minimalist Background Grid */}
            <rect x="45" y="10" width="730" height="120" fill="none" className="stroke-border/10 stroke-1" />

            {/* Horizontal Grid Lines */}
            <line x1="45" y1="10" x2="775" y2="10" className="stroke-border/5 stroke-1 stroke-dasharray" strokeDasharray="3 3" />
            <line x1="45" y1="50" x2="775" y2="50" className="stroke-border/5 stroke-1 stroke-dasharray" strokeDasharray="3 3" />
            <line x1="45" y1="90" x2="775" y2="90" className="stroke-border/5 stroke-1 stroke-dasharray" strokeDasharray="3 3" />
            <line x1="45" y1="130" x2="775" y2="130" className="stroke-border/20 stroke-1" />

            {/* SVG Bars representing real daily revenue with Stripes inside the bars */}
            {chartData.map((d, i) => {
              const barWidth = 40;
              const spacing = (730 - barWidth * 7) / 8;
              const x = 45 + spacing + i * (barWidth + spacing);
              const height = (d.amount / maxVal) * 100;
              const y = 130 - height;

              return (
                <g key={d.label} className="group">
                  {/* 1. Base color bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx={3}
                    fill="url(#bar-gradient)"
                    className="transition-all duration-350 opacity-90 group-hover:opacity-100 cursor-pointer"
                  />
                  {/* 2. Striped overlay pattern inside the bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    rx={3}
                    fill="url(#bar-stripes)"
                    className="transition-all duration-350 pointer-events-none"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(8, y - 5)}
                    textAnchor="middle"
                    className="fill-foreground font-mono text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    RM{d.amount.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* X-Axis Labels */}
            {chartData.map((d, i) => {
              const barWidth = 40;
              const spacing = (730 - barWidth * 7) / 8;
              const x = 45 + spacing + i * (barWidth + spacing) + barWidth / 2;
              return (
                <text
                  key={d.label}
                  x={x}
                  y="146"
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono text-[9px]"
                >
                  {d.label}
                </text>
              );
            })}

            {/* Y-Axis Labels */}
            <text x="35" y="14" textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">RM {Math.round(maxVal)}</text>
            <text x="35" y="74" textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">RM {Math.round(maxVal / 2)}</text>
            <text x="35" y="133" textAnchor="end" className="fill-muted-foreground font-mono text-[8px]">RM 0</text>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
