'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ProgressPoint } from '@/lib/dashboard-data'

type ProgressChartProps = {
  data: ProgressPoint[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="glass-card p-6">
      <h2 className="mb-6 font-display text-xl font-bold text-white">Monthly progress</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="week" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,12,38,0.8)',
              border: '1px solid rgba(168,34,23,0.5)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#fff' }}
          />
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#a82217"
            strokeWidth={2}
            dot={{ fill: '#a82217', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
