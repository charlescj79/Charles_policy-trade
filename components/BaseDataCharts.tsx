import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PolicyData } from '../types';

interface BaseDataChartsProps {
  data: PolicyData[];
}

export const BaseDataCharts: React.FC<BaseDataChartsProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      <div className="h-72 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Total Cash Value Growth</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD' }).format(value)}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="totalCV" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCv)" name="Total Cash Value" />
            <Area type="step" dataKey="totalPremiumPaid" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" fill="transparent" name="Principal Paid" />
            <Legend verticalAlign="top" height={36}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
