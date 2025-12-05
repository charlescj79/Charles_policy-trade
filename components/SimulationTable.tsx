import React from 'react';
import { BuyerProjectedIRR, PolicyData } from '../types';
import { formatCurrency, formatPercent } from '../utils/finance';

interface SimulationTableProps {
  buyerProjectedIRRs: BuyerProjectedIRR[];
  saleYear: number;
}

export const SimulationTable: React.FC<SimulationTableProps> = ({ buyerProjectedIRRs, saleYear }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Policy Year
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Years Held by Buyer
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Cash Value (Exit)
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Buyer's Gain
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-emerald-600 uppercase tracking-wider">
              Buyer's IRR
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {buyerProjectedIRRs.map((row) => (
            <tr key={row.surrenderYear} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                {row.surrenderYear}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {row.surrenderYear - saleYear}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">
                {formatCurrency(row.cashValue)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right">
                {formatCurrency(row.gain)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 text-right">
                {formatPercent(row.irr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
