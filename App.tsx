import React, { useState, useMemo, useEffect } from 'react';
import { POLICY_DATA } from './constants';
import { calculateIRR, formatCurrency, formatPercent } from './utils/finance';
import { BuyerProjectedIRR, SimulationResult } from './types';
import { InfoCard } from './components/InfoCard';
import { SimulationTable } from './components/SimulationTable';
import { BaseDataCharts } from './components/BaseDataCharts';
import { analyzeDeal } from './services/geminiService';
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  ArrowRightLeft,
  Sparkles,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  // Default: Sale at Year 10 (Breakeven is around Year 7)
  const [saleYear, setSaleYear] = useState<number>(10);
  // Default: A gets 5% premium over Cash Value
  const [sellerPremiumPct, setSellerPremiumPct] = useState<number>(5);
  // Default: B charges 2% fee on top of purchase price
  const [brokerFeePct, setBrokerFeePct] = useState<number>(2);
  
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // --- Effects ---
  // Adjust max premium allowed based on year constraints
  const maxSellerPremium = saleYear <= 6 ? 60 : 10;

  useEffect(() => {
    if (sellerPremiumPct > maxSellerPremium) {
      setSellerPremiumPct(maxSellerPremium);
    }
  }, [saleYear, maxSellerPremium, sellerPremiumPct]);

  // --- Calculations ---
  const simulation: SimulationResult = useMemo(() => {
    const policyAtSale = POLICY_DATA.find(p => p.year === saleYear);
    
    if (!policyAtSale) {
       return { sellerIRR: 0, sellerROI: 0, buyerEntryCost: 0, brokerProfit: 0, buyerProjectedIRRs: [] };
    }

    // 1. Seller A Calculations
    const baseCV = policyAtSale.totalCV;
    const sellerReceiveAmount = baseCV * (1 + sellerPremiumPct / 100);
    
    // A's Cashflows: -200k for 5 years, then 0, then +receiveAmount at saleYear
    const sellerCashFlows = [];
    for (let i = 1; i <= saleYear; i++) {
        if (i <= 5) sellerCashFlows.push(-200000);
        else sellerCashFlows.push(0);
    }
    // Adjust the last year to include the inflow
    sellerCashFlows[saleYear - 1] += sellerReceiveAmount;
    
    const sellerIRR = calculateIRR(sellerCashFlows);

    // Calculate ROI (Total Return %) for A
    // ROI = (Total Received - Total Paid) / Total Paid
    const totalPremiums = policyAtSale.totalPremiumPaid;
    const sellerROI = totalPremiums > 0 
      ? (sellerReceiveAmount - totalPremiums) / totalPremiums 
      : 0;

    // 2. Broker B Calculations
    const brokerCost = sellerReceiveAmount;
    const buyerEntryCost = brokerCost * (1 + brokerFeePct / 100);
    const brokerProfit = buyerEntryCost - brokerCost;

    // 3. Buyer C Calculations
    const buyerProjectedIRRs: BuyerProjectedIRR[] = [];
    
    // Loop through future years (from saleYear + 1 to end of data)
    POLICY_DATA.filter(p => p.year > saleYear).forEach(futurePolicy => {
        const holdingYears = futurePolicy.year - saleYear;
        const exitValue = futurePolicy.totalCV;
        const gain = exitValue - buyerEntryCost;
        
        // Buyer Cashflow: -EntryCost at T=0, +ExitValue at T=holdingYears
        // Simple IRR for single lump sum investment: (Exit/Entry)^(1/n) - 1
        // Or using the standard array method for consistency
        const buyerCashFlows = [-buyerEntryCost];
        for(let k=1; k<holdingYears; k++) buyerCashFlows.push(0);
        buyerCashFlows.push(exitValue);
        
        const irr = calculateIRR(buyerCashFlows);
        
        buyerProjectedIRRs.push({
            surrenderYear: futurePolicy.year,
            cashValue: exitValue,
            irr,
            gain
        });
    });

    return {
        sellerIRR,
        sellerROI,
        buyerEntryCost,
        brokerProfit,
        buyerProjectedIRRs
    };
  }, [saleYear, sellerPremiumPct, brokerFeePct]);

  // --- Handlers ---
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setGeminiAnalysis(null);
    
    // Get a reference point for Buyer IRR (e.g. +5 years and +10 years holding)
    const hold5 = simulation.buyerProjectedIRRs.find(r => r.surrenderYear === saleYear + 5);
    const hold10 = simulation.buyerProjectedIRRs.find(r => r.surrenderYear === saleYear + 10);

    const result = await analyzeDeal(
      saleYear,
      simulation.buyerEntryCost / (1 + brokerFeePct/100), // Approximate Seller Profit (Gross Revenue)
      simulation.sellerIRR,
      simulation.buyerEntryCost,
      hold5 ? hold5.irr : 0,
      hold10 ? hold10.irr : 0,
      simulation.brokerProfit
    );
    setGeminiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Policy<span className="text-emerald-600">Trade</span> Analyzer
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Second-Hand Insurance Market Simulator
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Key Metrics */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Controls Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-slate-500" /> 
                Transaction Settings
              </h2>
              
              <div className="space-y-6">
                {/* Sale Year Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Policy Sale Year: <span className="font-bold text-emerald-700">{saleYear}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    value={saleYear}
                    onChange={(e) => setSaleYear(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Year 2</span>
                    <span>Year 25</span>
                  </div>
                </div>

                {/* Seller Premium Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Seller Premium (A): <span className="font-bold text-emerald-700">+{sellerPremiumPct}%</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Markup over Cash Value paid to A</p>
                  <input
                    type="range"
                    min="0"
                    max={maxSellerPremium}
                    step="0.5"
                    value={sellerPremiumPct}
                    onChange={(e) => setSellerPremiumPct(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span>{maxSellerPremium}%</span>
                  </div>
                </div>

                {/* Broker Fee Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Broker Fee (B): <span className="font-bold text-emerald-700">+{brokerFeePct}%</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">Commission charged to Buyer C</p>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={brokerFeePct}
                    onChange={(e) => setBrokerFeePct(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 gap-4">
               <InfoCard 
                 title="Seller A: Realized Exit"
                 value={formatCurrency(simulation.buyerEntryCost / (1 + brokerFeePct/100))}
                 subValue={saleYear <= 6 
                   ? `Total Return: ${formatPercent(simulation.sellerROI)}` 
                   : `IRR: ${formatPercent(simulation.sellerIRR)}`
                 }
                 color="purple"
                 icon={<Users className="w-5 h-5" />}
               />
               <InfoCard 
                 title="Broker B: Commission"
                 value={formatCurrency(simulation.brokerProfit)}
                 subValue={`Margin: ${formatPercent(simulation.brokerProfit / simulation.buyerEntryCost)}`}
                 color="amber"
                 icon={<ArrowRightLeft className="w-5 h-5" />}
               />
               <InfoCard 
                 title="Buyer C: Entry Price"
                 value={formatCurrency(simulation.buyerEntryCost)}
                 subValue={`Base CV: ${formatCurrency(POLICY_DATA.find(p => p.year === saleYear)?.totalCV || 0)}`}
                 color="green"
                 icon={<DollarSign className="w-5 h-5" />}
               />
            </div>

            {/* Gemini Analysis Button */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-blue-100 p-6">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-blue-900 flex items-center">
                   <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                   AI Deal Analysis
                 </h3>
              </div>
              <p className="text-sm text-blue-800/80 mb-4 leading-relaxed">
                Use Gemini to evaluate this trade scenario for all parties involved.
              </p>
              
              {!geminiAnalysis && !isAnalyzing && (
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Analyze with Gemini</span>
                </button>
              )}

              {isAnalyzing && (
                 <div className="flex items-center justify-center space-x-2 text-blue-700 py-2">
                   <Loader2 className="w-5 h-5 animate-spin" />
                   <span className="font-medium">Thinking...</span>
                 </div>
              )}

              {geminiAnalysis && (
                <div className="prose prose-sm prose-blue max-w-none bg-white p-4 rounded-lg border border-blue-100 shadow-sm animate-in fade-in duration-500">
                  <div className="markdown-body text-slate-700 whitespace-pre-wrap text-xs leading-relaxed">
                    {geminiAnalysis}
                  </div>
                  <button 
                    onClick={() => setGeminiAnalysis(null)}
                    className="mt-3 text-xs text-blue-600 hover:underline font-medium"
                  >
                    Clear Analysis
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Visualizations & Detailed Tables */}
          <div className="lg:col-span-8 space-y-8">
             
             {/* Charts Section */}
             <BaseDataCharts data={POLICY_DATA} />

             {/* Buyer's Analysis Table */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                   <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                      Buyer C: Projected Returns
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Projected IRR if Buyer C surrenders the policy in future years.
                    </p>
                   </div>
                   <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Buyer Break-even</div>
                      <div className="text-sm font-bold text-slate-700">
                        Year {simulation.buyerProjectedIRRs.find(r => r.gain > 0)?.surrenderYear || 'N/A'}
                      </div>
                   </div>
                </div>
                
                <SimulationTable 
                  buyerProjectedIRRs={simulation.buyerProjectedIRRs} 
                  saleYear={saleYear}
                />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;