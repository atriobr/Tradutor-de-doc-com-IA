// Translation cache using localStorage
interface TranslationCache {
    fileName: string;
    provider: string;
    timestamp: number;
    pages: Array<{
        pageNumber: number;
        originalText: string;
        translatedText: string;
    }>;
}

const CACHE_KEY = 'pdf_translation_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function saveTranslationProgress(
    fileName: string,
    provider: string,
    translatedPages: Array<{ pageNumber: number; text: string }>,
    originalPages: Array<{ pageNumber: number; text: string }>
): void {
    try {
        const cache: TranslationCache = {
            fileName,
            provider,
            timestamp: Date.now(),
            pages: translatedPages.map((tp, index) => ({
                pageNumber: tp.pageNumber,
                originalText: originalPages[index]?.text || '',
                translatedText: tp.text,
            })),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        console.log(`✅ Saved progress: ${translatedPages.length} pages`);
    } catch (error) {
        console.error('Failed to save translation progress:', error);
    }
}

export function loadTranslationProgress(
    fileName: string,
    provider: string
): Array<{ pageNumber: number; text: string }> | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cache: TranslationCache = JSON.parse(cached);

        // Check if cache is expired
        if (Date.now() - cache.timestamp > CACHE_EXPIRY) {
            clearTranslationCache();
            return null;
        }

        // Check if it's the same file and provider
        if (cache.fileName !== fileName || cache.provider !== provider) {
            return null;
        }

        console.log(`✅ Loaded cached progress: ${cache.pages.length} pages`);
        return cache.pages.map(p => ({
            pageNumber: p.pageNumber,
            text: p.translatedText,
        }));
    } catch (error) {
        console.error('Failed to load translation progress:', error);
        return null;
    }
}

export function clearTranslationCache(): void {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Translation cache cleared');
}

export function getCacheInfo(): { fileName: string; pageCount: number; age: string } | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cache: TranslationCache = JSON.parse(cached);
        const ageMs = Date.now() - cache.timestamp;
        const ageMinutes = Math.floor(ageMs / 60000);

        return {
            fileName: cache.fileName,
            pageCount: cache.pages.length,
            age: ageMinutes < 60
                ? `${ageMinutes} minutos atrás`
                : `${Math.floor(ageMinutes / 60)} horas atrás`,
        };
    } catch {
        return null;
    }
}
