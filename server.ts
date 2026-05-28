import express from "express";
import path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy
  app.post("/api/tts", async (req, res) => {
    const { text, voice } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set on the server." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      } as any);

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ data: base64Audio });
      } else {
        res.status(500).json({ error: "Failed to generate audio." });
      }
    } catch (error: any) {
      console.error("Server TTS Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 2FA Endpoints
  app.post("/api/2fa/generate", async (req, res) => {
    const { email } = req.body;
    const secret = speakeasy.generateSecret({
        name: `AetherOS (${email})`,
    });
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");
    
    res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl
    });
  });

  app.post("/api/2fa/verify", async (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1
    });
    
    res.json({ verified });
  });

  // Proxy for general Gemini calls (if needed)
  app.post("/api/ai", async (req, res) => {
    const { modelName, contents, systemInstruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({ 
        model: modelName || "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: systemInstruction
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Server AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
