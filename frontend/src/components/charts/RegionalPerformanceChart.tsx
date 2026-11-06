"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { RegionalPerformance } from "@/types";

interface Props {
  data: RegionalPerformance[];
}

export const RegionalPerformanceChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis
            dataKey="region"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            fontFamily="JetBrains Mono"
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[80, 100]}
            fontFamily="JetBrains Mono"
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F1422",
              borderColor: "#334155",
              borderRadius: "8px",
              color: "#F8FAFC",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
            }}
            formatter={(value: any, name: any) => [
              `${value}%`,
              "On-Time Delivery",
            ]}
          />
          <Bar
            dataKey="on_time_pct"
            name="On-Time Delivery %"
            fill="#06B6D4"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
