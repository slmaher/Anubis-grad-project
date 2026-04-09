import https from 'https';
import { NextFunction, Request, Response, Router } from 'express';

import { env } from '../../config/env';

const assistantRouter = Router();

type ChatHistoryItem = {
  sender: 'user' | 'ai';
  text: string;
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  ar: 'Always respond in Arabic (العربية). If the user writes in any other language, still reply in Arabic.',
  en: 'Always respond in English.',
  fr: 'Always respond in French (Français). If the user writes in any other language, still reply in French.',
  de: 'Always respond in German (Deutsch). If the user writes in any other language, still reply in German.',
  zh: 'Always respond in Simplified Chinese (简体中文). If the user writes in any other language, still reply in Chinese.'
};

// Models available for this API key (verified via /v1beta/models endpoint)
// gemini-2.5-flash is the most capable and has been working; try it first
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-001', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];

function requestGemini(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiKey = env.geminiApiKey;

    if (!apiKey) {
      const error = new Error('Gemini API key is not configured on backend');
      (error as Error & { status?: number }).status = 500;
      reject(error);
      return;
    }

    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 700
      }
    });

    const tryModel = (modelIndex: number) => {
      if (modelIndex >= GEMINI_MODELS.length) {
        const error = new Error('All Gemini models are currently quota-limited. Please try again later or upgrade your Gemini plan.');
        (error as Error & { status?: number }).status = 429;
        reject(error);
        return;
      }

      const model = GEMINI_MODELS[modelIndex];
      console.log(`[Gemini] Trying model: ${model}`);

      const req = https.request(
        {
          hostname: 'generativelanguage.googleapis.com',
          path: `/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        },
        (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            const statusCode = res.statusCode ?? 500;

            // Fallback to next model on Not Found OR quota exceeded (429)
            if (statusCode === 404 || statusCode === 429) {
              console.log(`[Gemini] Model ${model} returned ${statusCode}, trying next model...`);
              tryModel(modelIndex + 1);
              return;
            }

            if (statusCode < 200 || statusCode >= 300) {
              try {
                const parsed = JSON.parse(data) as GeminiApiResponse;
                const message = parsed?.error?.message || `Gemini API request failed with status ${statusCode}`;
                const error = new Error(message);
                (error as Error & { status?: number }).status = 502;
                reject(error);
                return;
              } catch {
                const error = new Error(`Gemini API request failed with status ${statusCode}`);
                (error as Error & { status?: number }).status = 502;
                reject(error);
                return;
              }
            }

            try {
              const parsed = JSON.parse(data) as GeminiApiResponse;
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;

              if (!text || typeof text !== 'string') {
                const error = new Error('Gemini returned an empty response');
                (error as Error & { status?: number }).status = 502;
                reject(error);
                return;
              }

              resolve(text.trim());
            } catch {
              const error = new Error('Failed to parse Gemini response');
              (error as Error & { status?: number }).status = 502;
              reject(error);
            }
          });
        }
      );

      req.on('error', (networkError) => {
        const error = new Error(`Gemini network error: ${networkError.message}`);
        (error as Error & { status?: number }).status = 502;
        reject(error);
      });

      req.write(body);
      req.end();
    };

    tryModel(0);
  });
}

assistantRouter.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = Array.isArray(req.body?.history) ? (req.body.history as ChatHistoryItem[]) : [];
    const language = typeof req.body?.language === 'string' ? req.body.language.toLowerCase() : 'en';

    if (history.length === 0) {
      return res.status(400).json({ success: false, message: 'history is required' });
    }

    const safeHistory = history
      .filter((item) => item && (item.sender === 'user' || item.sender === 'ai') && typeof item.text === 'string')
      .slice(-20);

    if (safeHistory.length === 0) {
      return res.status(400).json({ success: false, message: 'history contains no valid messages' });
    }

    const langInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;
    const transcript = safeHistory
      .map((item) => `${item.sender === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
      .join('\n');

    const prompt = `You are Anubis, a friendly and knowledgeable AI assistant for the Revive Egypt app — a platform dedicated to Egyptian tourism, museums, culture, and history.
You are helpful, warm, and conversational. You are an expert on Egypt (museums, historical sites, culture, food, travel, restaurants, events, and more), but you can also answer general questions on any topic the user asks.
Do not restrict yourself to museums only. If a user asks about restaurants, travel tips, Egyptian cuisine, nearby places, or anything else, answer helpfully.
Be concise, engaging, and use a touch of Egyptian charm. ${langInstruction}

Conversation so far:
${transcript}

Now reply as the assistant to the latest user message.`;

    const reply = await requestGemini(prompt);

    return res.json({ success: true, data: { reply } });
  } catch (err) {
    next(err);
  }
});

export { assistantRouter };
