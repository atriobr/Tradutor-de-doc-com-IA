import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export type TranslationProvider = 'gemini' | 'openai' | 'deepseek';

interface TranslationOptions {
    text: string;
    provider: TranslationProvider;
    apiKey?: string; // Optional, might use env vars if not provided
}

const SYSTEM_PROMPT = "You are a professional translator. Translate the following text from English to Portuguese (Brazil). Maintain the original tone and context. Return ONLY the translated text, without explanations.";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;

        console.warn(`Translation failed, retrying in ${delay / 1000}s... (${retries} retries left). Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));

        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
}

export async function translateText({ text, provider, apiKey }: TranslationOptions): Promise<string> {
    const envApiKey = getApiKey(provider);
    const finalApiKey = apiKey || envApiKey;

    if (!finalApiKey || finalApiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error(`API Key for ${provider} is missing. Please check your configuration.`);
    }

    const translateFn = async () => {
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
    };

    return retryWithBackoff(translateFn);
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
    // IMPLEMENTATION: Chunking to avoid Vercel Timeouts
    // If text is too long (> 1500 chars), split it into smaller chunks
    const MAX_CHUNK_SIZE = 1500;

    if (text.length > MAX_CHUNK_SIZE) {
        console.log(`Text too long (${text.length} chars), splitting into chunks...`);
        const chunks = splitTextCheck(text, MAX_CHUNK_SIZE);
        let translatedChunks = [];

        for (const chunk of chunks) {
            // Translate each chunk sequentially
            const translatedChunk = await translateWithDeepSeek(chunk, apiKey);
            translatedChunks.push(translatedChunk);
        }

        return translatedChunks.join(' ');
    }

    // Use Vercel API route to avoid CORS
    const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: text }
            ],
            model: "deepseek-chat",
        }),
    });

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        // Handle non-JSON response gracefully to propagate a clearer error
        const text = await response.text();
        throw new Error(`DeepSeek API returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
        const errorMsg = data.error || data.message || response.statusText || 'Unknown error';
        throw new Error(`DeepSeek API error (${response.status}): ${errorMsg}`);
    }

    if (data.error) {
        throw new Error(`DeepSeek API error: ${data.error.message || data.error}`);
    }

    return data.choices[0].message.content || "";
}

function splitTextCheck(text: string, maxLength: number): string[] {
    if (text.length <= maxLength) return [text];

    const chunks: string[] = [];
    let currentChunk = '';

    // Split by paragraphs first using our normalized newline
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        // If adding this paragraph exceeds limit
        if ((currentChunk.length + paragraph.length + 1) > maxLength) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
                currentChunk = '';
            }

            // If paragraph ITSELF is huge, hard split it
            if (paragraph.length > maxLength) {
                let remaining = paragraph;
                while (remaining.length > maxLength) {
                    // Try to split at a sentence boundary near limit
                    let splitIndex = remaining.lastIndexOf('.', maxLength);
                    if (splitIndex === -1) splitIndex = remaining.lastIndexOf(' ', maxLength);
                    if (splitIndex === -1) splitIndex = maxLength; // Hard cut

                    chunks.push(remaining.substring(0, splitIndex));
                    remaining = remaining.substring(splitIndex).trim();
                }
                currentChunk = remaining;
            } else {
                currentChunk = paragraph;
            }
        } else {
            if (currentChunk.length > 0) currentChunk += '\n';
            currentChunk += paragraph;
        }
    }

    if (currentChunk.length > 0) chunks.push(currentChunk);

    return chunks;
}
