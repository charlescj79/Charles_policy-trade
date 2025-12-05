import { GoogleGenAI } from "@google/genai";
import { POLICY_DATA } from "../constants";

export const analyzeDeal = async (
  saleYear: number,
  sellerProfit: number,
  sellerIRR: number,
  buyerEntryCost: number,
  buyerProjectedIRR5Y: number,
  buyerProjectedIRR10Y: number,
  brokerProfit: number
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API Key not found. Please ensure process.env.API_KEY is set.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  You are a sophisticated financial analyst specializing in secondary market life insurance policies (Traded Endowment Policies).
  
  Please analyze the following transaction scenario:
  
  **Scenario:**
  - Original Policy: 5-year pay, Dividend-paying Whole Life.
  - Policy Age at Sale: ${saleYear} years.
  - Original Principal: HKD 1,000,000.
  
  **Seller (Original Holder A):**
  - Sale Price (Net): ${sellerProfit} HKD
  - Exit IRR: ${(sellerIRR * 100).toFixed(2)}%
  
  **Broker (Middleman B):**
  - Transaction Profit: ${brokerProfit} HKD
  
  **Buyer (New Holder C):**
  - Entry Cost: ${buyerEntryCost} HKD
  - Projected IRR (if held for +5 more years): ${(buyerProjectedIRR5Y * 100).toFixed(2)}%
  - Projected IRR (if held for +10 more years): ${(buyerProjectedIRR10Y * 100).toFixed(2)}%

  **Policy Data Reference (Year: TotalCashValue):**
  ${JSON.stringify(POLICY_DATA.slice(saleYear - 1, saleYear + 10).map(d => `${d.year}:${d.totalCV}`))}

  **Instructions:**
  1. Evaluate if this is a good exit for the Seller compared to holding.
  2. Evaluate the risk/reward for the Buyer given the entry cost and projected returns.
  3. Comment on the Broker's cut - is it reasonable?
  4. Provide a succinct verdict (Buy/Sell/Hold) for each party.
  
  Keep the response concise (under 200 words), professional, and formatted with markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate analysis. Please try again.";
  }
};
