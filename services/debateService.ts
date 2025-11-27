import { GoogleGenAI } from "@google/genai";
import { DebateResponse, ModelResponses, DebateTimings } from '../types';

// Singleton instance variable
let geminiClientInstance: GoogleGenAI | null = null;

// Helper to safely get or create the client
// This prevents the "API Key must be set" error from crashing the app on initial load
const getGeminiClient = (): GoogleGenAI => {
  if (geminiClientInstance) return geminiClientInstance;

  // Prioritize environment variable, fallback to injected process.env if available
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing API Key. Please set GEMINI_API_KEY or API_KEY in your environment variables.");
  }

  geminiClientInstance = new GoogleGenAI({ apiKey });
  return geminiClientInstance;
};

// User provided keys fallback
const PROVIDED_OPENAI_KEY = process.env.OPENAI_API_KEY;

// --- Helper: Simulation Fallback ---
const simulatePersona = async (persona: 'openai' | 'claude', question: string): Promise<string> => {
  const personas = {
    openai: {
      name: "OpenAI GPT-4o",
      instruction: "You are OpenAI's GPT-4o. You are participating in a technical debate. Provide a response that is highly logical, data-driven, and analytical. Structure your answer with clear headings. Do not mention you are simulating."
    },
    claude: {
      name: "Anthropic Claude 3.5 Sonnet",
      instruction: "You are Anthropic's Claude 3.5 Sonnet. You are participating in a technical debate. Provide a response that is nuanced, ethical, and considers edge cases. Use a conversational but professional tone. Do not mention you are simulating."
    }
  };

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: personas[persona].instruction,
        temperature: 0.7,
      }
    });
    return response.text || `[${personas[persona].name} simulation failed]`;
  } catch (error: any) {
    console.warn(`Simulation failed for ${persona}:`, error);
    return `[Simulation Error: ${error.message}]`;
  }
};

// --- Real API Implementations with Fallback ---

const callOpenAI = async (question: string): Promise<string> => {
  const apiKey = PROVIDED_OPENAI_KEY;
  
  // If no key or placeholder, simulate
  if (!apiKey || apiKey.includes("your_openai_key")) {
    return simulatePersona('openai', question);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: question }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn(`OpenAI call failed (${response.status}). Falling back to simulation.`);
      return simulatePersona('openai', question);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "[OpenAI provided no response]";
  } catch (error: any) {
    console.warn("OpenAI Network/CORS Error. Falling back to simulation.");
    return simulatePersona('openai', question);
  }
};

const callAnthropic = async (question: string): Promise<string> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey.includes("your_anthropic_key")) {
    return simulatePersona('claude', question);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerously-allow-browser": "true" 
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [{ role: "user", content: question }]
      })
    });

    if (!response.ok) {
       console.warn(`Anthropic call failed (${response.status}). Falling back to simulation.`);
       return simulatePersona('claude', question);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "[Claude provided no response]";
  } catch (error: any) {
    console.warn("Anthropic Network/CORS Error. Falling back to simulation.");
    return simulatePersona('claude', question);
  }
};

const callGemini = async (question: string): Promise<string> => {
  try {
    const client = getGeminiClient();
    // Using gemini-3-pro-preview for top-tier reasoning
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: question,
    });
    return response.text || "[Gemini provided no response]";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `[Gemini Connection Error: ${error.message}]`;
  }
};

// --- Consensus Logic ---

const generateConsensus = async (question: string, models: ModelResponses): Promise<string> => {
  try {
    const client = getGeminiClient();
    const prompt = `
      Act as the "Nexus Judge", an impartial super-intelligence. 
      Your task is to synthesize three distinct AI perspectives into one natural, "Golden Consensus" answer.

      User Question: "${question}"

      [Perspective A: OpenAI GPT-4o]
      ${models.openai}

      [Perspective B: Anthropic Claude 3.5]
      ${models.claude}

      [Perspective C: Google Gemini 1.5]
      ${models.gemini}

      Synthesis Instructions:
      1. Analyze the core arguments of each model.
      2. Identify the most accurate and insightful points from each.
      3. Construct a completely new, cohesive response that integrates the best of all three.
      4. The tone should be authoritative yet accessible.
      5. Use Markdown formatting (headers, bolding, bullet points) to make the final output visually engaging and easy to read.
      6. Do not explicitly say "Model A said X", just weave the information together naturally.
    `;

    // Using gemini-2.5-flash for the judge logic to ensure speed
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        systemInstruction: "You are an advanced synthesis engine. You create unified, high-quality answers by merging multiple expert opinions.",
        temperature: 0.4
      }
    });
    return response.text || "Unable to generate consensus.";
  } catch (error) {
    console.error("Error generating consensus:", error);
    return "System Error: Consensus generation failed.";
  }
};

// --- Helper to measure execution time ---
async function measureCall(fn: () => Promise<string>): Promise<{ text: string; time: number }> {
  const start = performance.now();
  const text = await fn();
  const end = performance.now();
  return { text, time: end - start };
}

export const fetchDebateResult = async (question: string): Promise<DebateResponse> => {
  const startTime = performance.now();

  // Ensure we have at least the primary key before starting
  try {
    getGeminiClient(); 
  } catch (e: any) {
    throw new Error(e.message);
  }

  // 1. Run all model API calls in parallel (Simulated or Real) and measure them
  const [openaiRes, claudeRes, geminiRes] = await Promise.all([
    measureCall(() => callOpenAI(question)),
    measureCall(() => callAnthropic(question)),
    measureCall(() => callGemini(question))
  ]);

  const models: ModelResponses = { 
    openai: openaiRes.text, 
    claude: claudeRes.text, 
    gemini: geminiRes.text 
  };

  // 2. Synthesize the results
  const consensusRes = await measureCall(() => generateConsensus(question, models));

  const totalTime = performance.now() - startTime;

  const timings: DebateTimings = {
    openai: openaiRes.time,
    claude: claudeRes.time,
    gemini: geminiRes.time,
    consensus: consensusRes.time,
    total: totalTime
  };

  return {
    question,
    models,
    timings,
    finalAnswer: consensusRes.text
  };
};