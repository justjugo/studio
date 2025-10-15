
"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import resolveConfig from 'tailwindcss/resolveConfig'

import { ChartContainer } from "@/components/ui/chart";
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
};

interface ChartData {
    id: string;
    date: string;
    score: number;
    totalQuestions: number;
    timeTaken: number;
    testName: string;
}

// Explicitly define the shape of the data that the chart will use
interface ChartPlotData {
  uniqueId: string;
  name: string;
  Score: number;
  testName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartPlotData }[];
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-sm rounded-lg border bg-card text-card-foreground shadow-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <div className="flex flex-col">
            <span className="font-bold">{data.name}</span>
            <span>{data.testName}</span>
            <span className="font-bold">{`${data.Score}%`}</span>
        </div>
      </div>
    );
  }

  return null;
};

export default function ProgressChart({ data }: { data: ChartData[] }) {
  const chartData: ChartPlotData[] = data.map((attempt, index) => ({
    uniqueId: `${attempt.id}-${index}`,
    name: new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Score: Math.ceil((attempt.score / attempt.totalQuestions) * 100),
    testName: attempt.testName,
  }));

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="uniqueId"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const entry = chartData.find(d => d.uniqueId === value);
                return entry ? entry.name : '';
              }}
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
              cursor={{ fill: 'hsla(var(--accent), 0.1)' }}
              content={<CustomTooltip />} 
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
