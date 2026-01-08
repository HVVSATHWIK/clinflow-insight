import { GoogleGenAI } from "@google/genai";
import { FlowNode } from "../types";

// Initialize the client. API Key is assumed to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateNodeAnalysis = async (node: FlowNode): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI analysis unavailable (Missing API Key). Please configure the environment.";
  }

  try {
    const prompt = `
      You are a Clinical Data Scientist Assistant providing recommendations for human review.
      
      CONTEXT:
      Analyzing Data Node: "${node.label}" (${node.type}).
      Status: ${node.status}
      Upstream Inputs: ${node.inputs ? node.inputs.join(', ') : 'N/A (Source)'}
      Logic/Threshold: ${node.logic || 'N/A'}
      Current Metrics: ${JSON.stringify(node.metrics)}
      Current Issues: ${node.details?.issues.join(', ') || 'None'}

      TASK:
      1. Explain *why* the node status is ${node.status} based on the metrics/logic.
      2. Provide 2 prioritized **recommendations** for the human user to investigate (e.g., "Recommend verifying source documents", "Suggest querying Site").
      3. State the confidence level in this recommendation based on the data provided.

      CONSTRAINTS:
      - Use phrases like "The data suggests...", "It is recommended to...", "Potential area for review...".
      - DO NOT use autonomous language like "I have flagged...", "Executing...", "Correcting...".
      - DO NOT imply you have taken action. You are an analysis tool only.
      - Keep it under 150 words.
    `;

    // Using Gemini Flash Lite for low-latency responses
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: prompt,
    });

    return response.text || "Recommendation generated, but no text returned.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate recommendation due to a connection error.";
  }
};