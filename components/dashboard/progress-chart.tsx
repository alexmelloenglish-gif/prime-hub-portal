'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { week: 'Sem 1', progress: 20 },
  { week: 'Sem 2', progress: 28 },
  { week: 'Sem 3', progress: 35 },
  { week: 'Sem 4', progress: 42 },
  { week: 'Sem 5', progress: 52 },
  { week: 'Sem 6', progress: 60 },
  { week: 'Sem 7', progress: 68 },
]

export function ProgressChart() {
  return (
    <div className="glass-card p-6">
      <h2 className="font-display text-xl font-bold text-white mb-6">
        Progresso Mensal
      </h2>
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
