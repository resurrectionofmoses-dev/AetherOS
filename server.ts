import express from "express";
import path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to retry Gemini API calls gracefully on the server-side
  async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 1000): Promise<T> {
    let attempt = 0;
    let delay = initialDelay;
    while (true) {
      try {
        return await fn();
      } catch (error: any) {
        attempt++;
        const errorMsg = error?.message || "";
        const errorStr = typeof error === 'object' ? JSON.stringify(error) : String(error);
        
        const isTransient = 
          errorMsg.includes("555") || // Safe dummy value for testing
          errorMsg.includes("503") || 
          errorMsg.includes("429") || 
          errorMsg.includes("UNAVAILABLE") || 
          errorMsg.includes("high demand") || 
          errorMsg.includes("temporary") || 
          errorMsg.includes("Resource has been exhausted") || 
          errorMsg.includes("timed out") ||
          errorMsg.includes("timeout") ||
          errorStr.includes("503") || 
          errorStr.includes("429") || 
          errorStr.includes("UNAVAILABLE") || 
          errorStr.includes("high demand") || 
          errorStr.includes("temporary") ||
          errorStr.includes("timed out") ||
          errorStr.includes("timeout");

        if (isTransient && attempt <= maxRetries) {
          const jitter = Math.random() * 500;
          const nextDelay = delay * Math.pow(1.5, attempt - 1) + jitter;
          console.warn(`[server.ts] Gemini API transient error, automatically retrying (${attempt}/${maxRetries}) in ${Math.round(nextDelay)}ms... Reason: ${errorMsg}`);
          await new Promise(resolve => setTimeout(resolve, nextDelay));
          continue;
        }
        throw error;
      }
    }
  }

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

      const response = await callGeminiWithRetry(async () => {
        const apiCall = ai.models.generateContent({
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

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Lattice sync sequence timed out")), 20000);
        });

        return await Promise.race([apiCall, timeoutPromise]) as any;
      });

      const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const base64Audio = inlineData?.data;
      const mimeType = inlineData?.mimeType || "audio/aac";
      if (base64Audio) {
        res.json({ data: base64Audio, mimeType });
      } else {
        res.status(500).json({ error: "Failed to generate audio content inside response." });
      }
    } catch (error: any) {
      console.warn("Server API TTS Error or Timeout:", error.message || String(error));
      res.status(500).json({ error: error.message || String(error) });
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

      const response = await callGeminiWithRetry(async () => {
        return await ai.models.generateContent({ 
          model: modelName || "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction
          }
        });
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Server AI Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Dynamic Workspace Inspector for code modules and block investigation
  app.get("/api/module-inspector", (req, res) => {
    try {
      const componentsDir = path.join(process.cwd(), "components");
      const rootFiles = ["App.tsx", "ViewRegistry.tsx", "types.ts", "server.ts", "index.html", "vite.config.ts"];
      const results: any[] = [];

      // Scan /components
      if (fs.existsSync(componentsDir)) {
        const files = fs.readdirSync(componentsDir);
        for (const file of files) {
          if (file.endsWith(".tsx") || file.endsWith(".ts")) {
            const filePath = path.join(componentsDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              const content = fs.readFileSync(filePath, "utf-8");
              const lines = content.split("\n");
              
              const importMatches = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];
              const hooksMatches = content.match(/use[A-Z][a-zA-Z0-9]*/g) || [];
              const functionsMatches = content.match(/(const\s+[a-zA-Z0-9_]+\s*=\s*(\(.*?\)|[a-zA-Z0-9_]+)\s*=>|function\s+[a-zA-Z0-9_]+)/g) || [];

              results.push({
                name: file,
                path: `components/${file}`,
                bytes: stats.size,
                lines: lines.length,
                chars: content.length,
                importsCount: importMatches.length,
                hooksCount: Array.from(new Set(hooksMatches)).length,
                functionsCount: functionsMatches.length,
                imports: importMatches.slice(0, 5).map(i => i.trim()),
                category: "Component Module",
              });
            }
          }
        }
      }

      // Scan Root Files
      for (const file of rootFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf-8");
          const lines = content.split("\n");
          
          const importMatches = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];
          const hooksMatches = content.match(/use[A-Z][a-zA-Z0-9]*/g) || [];
          const functionsMatches = content.match(/(const\s+[a-zA-Z0-9_]+\s*=\s*(\(.*?\)|[a-zA-Z0-9_]+)\s*=>|function\s+[a-zA-Z0-9_]+)/g) || [];

          results.push({
            name: file,
            path: file,
            bytes: stats.size,
            lines: lines.length,
            chars: content.length,
            importsCount: importMatches.length,
            hooksCount: Array.from(new Set(hooksMatches)).length,
            functionsCount: functionsMatches.length,
            imports: importMatches.slice(0, 5).map(i => i.trim()),
            category: "System Core",
          });
        }
      }

      res.json({ success: true, modules: results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Fetch full code content for a specific module under inspection
  app.get("/api/module-content", (req, res) => {
    try {
      const modulePath = req.query.path as string;
      if (!modulePath) {
        return res.status(400).json({ success: false, error: "Module path parameter required" });
      }

      // Prevent directory traversal attacks
      const resolvedPath = path.resolve(process.cwd(), modulePath);
      if (!resolvedPath.startsWith(process.cwd())) {
        return res.status(403).json({ success: false, error: "Access denied" });
      }

      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
        const content = fs.readFileSync(resolvedPath, "utf-8");
        return res.json({ success: true, content });
      }

      res.status(404).json({ success: false, error: `Module not found: ${modulePath}` });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
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
