
import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

interface WeeklyActivitySparklineProps {
  data: { day: string; count: number }[];
}

const WeeklyActivitySparkline: React.FC<WeeklyActivitySparklineProps> = ({ data }) => (
  <div className="h-56 flex items-center">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Bar dataKey="count" fill="#00eefc" radius={4} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default WeeklyActivitySparkline;
