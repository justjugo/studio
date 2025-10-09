
"use client";

import type { Result } from "@/lib/types";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig } from "@/components/ui/chart";
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../tailwind.config'

const fullConfig = resolveConfig(tailwindConfig)

const getScoreColor = (score: number) => {
    if (score > 90) return fullConfig.theme.colors.purple[600];
    if (score > 70) return fullConfig.theme.colors.green[600];
    if (score > 40) return fullConfig.theme.colors.yellow[500];
    return fullConfig.theme.colors.destructive.DEFAULT;
};

const chartConfig = {
  Score: {
    label: "Score",
  },
} satisfies ChartConfig;

interface ChartData {
    id: string;
    date: string;
    score: number;
    totalQuestions: number;
    timeTaken: number;
    testName: string;
}

export default function ProgressChart({ data }: { data: ChartData[] }) {
  const chartData = data.map(attempt => ({
    name: new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Score: Math.round((attempt.score / attempt.totalQuestions) * 100),
    testName: attempt.testName,
  }));

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              content={<ChartTooltipContent 
                  formatter={(value, name, props) => {
                    const { payload } = props;
                    return (
                        <div className="flex flex-col">
                            <span>{payload.testName}</span>
                            <span className="font-bold">{`${value}%`}</span>
                        </div>
                    )
                  }}
                  labelClassName="font-bold" 
                />}
            />
            <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.Score)} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
