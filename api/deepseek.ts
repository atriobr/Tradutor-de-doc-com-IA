export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key missing' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Log for debugging (will appear in Vercel logs)
        console.log('Calling DeepSeek API...');

        // Forward request to DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Log response status
        console.log('DeepSeek API response status:', response.status);

        // If API returned an error, pass it through
        if (!response.ok) {
            console.error('DeepSeek API error:', data);
            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Handler error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal server error',
            details: error.toString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
