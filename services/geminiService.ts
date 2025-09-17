import { GoogleGenAI, Type } from "@google/genai";
import { Holding, AssetDetails } from "../types";

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateContent = async (prompt: string): Promise<string> => {
 if (!process.env.API_KEY) {
    return "Error: Gemini API key is not configured. Please set the API_KEY environment variable.";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching analysis from Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while fetching analysis: ${error.message}`;
    }
    return "An unknown error occurred while fetching analysis.";
  }
}

export const getMarketAnalysis = async (ticker: string): Promise<string> => {
  const prompt = `Provide a brief, balanced analysis for the stock ticker ${ticker}. Include a summary of recent news, potential bullish points, and potential bearish points. Format the output as a simple text summary. Do not use markdown.`;
  return generateContent(prompt);
};

export const getStockModelAnalysis = async (prompt: string): Promise<string> => {
    return generateContent(prompt);
};

export const getPortfolioRiskAnalysis = async (holdings: Holding[]): Promise<string> => {
    const prompt = `Given the following portfolio holdings (asset, market value): ${JSON.stringify(holdings.map(h => ({ asset: h.asset, value: h.marketValue })))}. Provide a brief qualitative risk analysis. Mention concentration risk, sector-specific risks if identifiable (e.g., heavy in tech), and general market risks relevant to these assets. Format as a simple text summary with paragraphs. Do not use markdown.`;
    return generateContent(prompt);
};

export const getYieldCurveAnalysis = async (): Promise<string> => {
    const prompt = `Provide a concise analysis of the current US Treasury yield curve. Explain its current shape (e.g., normal, inverted, flat) and what it implies for the economy and for stock market investors. Format as a simple text summary. Do not use markdown.`;
    return generateContent(prompt);
};

export const getAssetAllocationDetails = async (holdings: Holding[]): Promise<AssetDetails[]> => {
  const tickers = holdings.map(h => h.asset);
  if (tickers.length === 0) {
    return [];
  }
  const prompt = `For the following stock tickers: ${tickers.join(', ')}. Provide their primary sector (e.g., Technology, Healthcare, Financials), geography (country of primary listing, e.g., USA, China), and asset type (e.g., Common Stock, ETF).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ticker: { type: Type.STRING },
              sector: { type: Type.STRING },
              geography: { type: Type.STRING },
              assetType: { type: Type.STRING },
            },
            required: ["ticker", "sector", "geography", "assetType"]
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    if (jsonStr.startsWith('[') && jsonStr.endsWith(']')) {
      return JSON.parse(jsonStr) as AssetDetails[];
    } else {
        console.error("Invalid JSON response from API:", jsonStr);
        throw new Error("Invalid JSON response from API");
    }

  } catch (error) {
    console.error("Error fetching asset allocation details from Gemini API:", error);
    // Provide a mock response as a fallback for demonstration purposes if the API fails
    return holdings.map(h => ({
      ticker: h.asset,
      sector: (h.asset === 'AAPL' || h.asset === 'GOOGL' || h.asset === 'MSFT') ? 'Technology' : 'Other',
      geography: 'USA',
      assetType: 'Equity'
    }));
  }
};
