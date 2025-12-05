export interface PolicyData {
  year: number;
  premiumPaidYearly: number;
  totalPremiumPaid: number;
  guaranteedCV: number;
  totalCV: number; // (A) + (B) + (C)
}

export interface SimulationResult {
  sellerIRR: number; // IRR for Person A selling at specific year
  sellerROI: number; // Return on Investment (Total Return) for Person A
  buyerEntryCost: number; // Cost for Person C
  brokerProfit: number; // Profit for Person B
  buyerProjectedIRRs: BuyerProjectedIRR[]; // Future IRRs for C if they hold
}

export interface BuyerProjectedIRR {
  surrenderYear: number;
  cashValue: number;
  irr: number;
  gain: number;
}