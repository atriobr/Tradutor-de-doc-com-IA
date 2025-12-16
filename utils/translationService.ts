import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export type TranslationProvider = 'gemini' | 'openai' | 'deepseek';

interface TranslationOptions {
    text: string;
    provider: TranslationProvider;
    apiKey?: string; // Optional, might use env vars if not provided
}

const SYSTEM_PROMPT = "You are a professional translator. Translate the following text from English to Portuguese (Brazil). Maintain the original tone and context. Return ONLY the translated text, without explanations.";

export async function translateText({ text, provider, apiKey }: TranslationOptions): Promise<string> {
    const envApiKey = getApiKey(provider);
    const finalApiKey = apiKey || envApiKey;

    if (!finalApiKey || finalApiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error(`API Key for ${provider} is missing. Please check your configuration.`);
    }

    try {
        switch (provider) {
            case 'gemini':
                return await translateWithGemini(text, finalApiKey);
            case 'openai':
                return await translateWithOpenAI(text, finalApiKey);
            case 'deepseek':
                return await translateWithDeepSeek(text, finalApiKey);
            default:
                throw new Error('Unsupported provider');
        }
    } catch (error) {
        console.error(`Translation error with ${provider}:`, error);
        throw error;
    }
}

function getApiKey(provider: TranslationProvider): string | undefined {
    switch (provider) {
        case 'gemini': return import.meta.env.VITE_GEMINI_API_KEY;
        case 'openai': return import.meta.env.VITE_OPENAI_API_KEY;
        case 'deepseek': return import.meta.env.VITE_DEEPSEEK_API_KEY;
    }
}

async function translateWithGemini(text: string, apiKey: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or 1.5-flash

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nText to translate:\n${text}`);
    return result.response.text();
}

async function translateWithOpenAI(text: string, apiKey: string): Promise<string> {
    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text }
        ],
        model: "gpt-4o-mini", // Cost effective
    });

    return completion.choices[0].message.content || "";
}

async function translateWithDeepSeek(text: string, apiKey: string): Promise<string> {
    const openai = new OpenAI({
        baseURL: https://api.deepseek.com + '/proxy/deepseek', // Use proxy
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text }
        ],
        model: "deepseek-chat",
    });

    return completion.choices[0].message.content || "";
}

