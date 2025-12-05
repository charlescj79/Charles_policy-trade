/**
 * Calculates the Internal Rate of Return (IRR) for a series of cash flows using the Newton-Raphson method.
 * @param cashFlows Array of numbers representing cash flows (negatives are outflows, positives are inflows).
 * @param guess Initial guess for IRR (default 0.1).
 * @returns The IRR as a decimal (e.g., 0.05 for 5%) or NaN if convergence fails.
 */
export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 1000;
  const tolerance = 0.0000001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / discountFactor;
      dNpv -= (t * cashFlows[t]) / (discountFactor * (1 + rate));
    }

    if (Math.abs(npv) < tolerance) {
      return rate;
    }

    if (Math.abs(dNpv) < tolerance) {
       // Derivative too small, might be a flat spot, try stepping
       rate += 0.001;
       continue;
    }
    
    const newRate = rate - npv / dNpv;
    
    // Safety check for wild divergence
    if (Math.abs(newRate) > 10) return NaN;

    rate = newRate;
  }

  return NaN;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
