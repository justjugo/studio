"use client";

import type { TestAttempt } from "@/lib/types";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  Score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ProgressChart({ data }: { data: TestAttempt[] }) {
  const chartData = data.map(attempt => ({
    name: new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Score: Math.round((attempt.score / attempt.totalQuestions) * 100),
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
                  formatter={(value) => `${value}%`} 
                  labelClassName="font-bold" 
                />}
            />
            <Bar dataKey="Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
