import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

// Set up JSON body parser with increased limit to support food image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI client with appropriate headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Food Image Analysis Endpoint
app.post("/api/ai/analyze-food", async (req, res): Promise<any> => {
  try {
    const { image, mimeType } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Missing image base64 data or mimeType" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Go to Settings > Secrets to add it." 
      });
    }

    // Set up the system instruction with Gen Z slang style nutrition wisdom
    const systemInstruction = 
      "You are a cutting-edge, super hype Gen Z sports nutrition coach and AI assistant. " +
      "Analyze the food photo provided. Give extremely realistic estimates for: " +
      "Calories (kcal), Protein (grams), Carbs (grams), and Fats (grams). " +
      "If there are multiple food items, total them up. Be fun, engaging, and output " +
      "in precise fields with genuine nutritional validation. Do not larp or hallucinate " +
      "unreasonable numbers - estimate reasonably according to real portion sizes, " +
      "but deliver the commentary with high main-character-energy, using relatable modern phrases like " +
      "'no cap', 'valid eating', 'locked in', 'caught in 4k', 'dialed of the charts', 'bestie' etc. " +
      "Keep the output fully structures as JSON.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: image
          }
        },
        "Analyze this meal and provide calories, protein, carbs, fats, name of the meal, and custom feedback."
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: "Short friendly name of the food recognized."
            },
            calories: {
              type: Type.INTEGER,
              description: "Calculated calorie count (kcal)."
            },
            protein: {
              type: Type.INTEGER,
              description: "Total protein estimation in grams."
            },
            carbs: {
              type: Type.INTEGER,
              description: "Total carbohydrate estimation in grams."
            },
            fats: {
              type: Type.INTEGER,
              description: "Total fat estimation in grams."
            },
            analysisSummary: {
              type: Type.STRING,
              description: "Hype and funny description of the food detected, using hilarious modern Gen Z speak."
            },
            satisfactionTip: {
              type: Type.STRING,
              description: "A funny and engaging sports health slang tip (e.g., 'This protein is sending me, keep bulking bestie!', 'A bit carb-heavy but we stay hydrated, no cap!')."
            }
          },
          required: ["foodName", "calories", "protein", "carbs", "fats", "analysisSummary", "satisfactionTip"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return res.json(parsedResult);

  } catch (error: any) {
    console.error("Gemini Food AI Analysis Error:", error);
    return res.status(500).json({ 
      error: error?.message || "Failed to analyze food image with AI" 
    });
  }
});

// Check Server Health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Configure Vite or Static Asset Serving
async function boot() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FlexBite Backend now listening on http://localhost:${PORT}`);
  });
}

boot();
