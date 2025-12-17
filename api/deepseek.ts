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

        // Log response status
        console.log('DeepSeek API response status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));

        // Always read response as text first to handle both JSON and non-JSON responses
        const responseText = await response.text();
        console.log('DeepSeek API response status:', response.status);
        console.log('Response preview:', responseText.substring(0, 200));

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            // If parsing fails, it's not valid JSON - wrap it in an error response
            console.error('Failed to parse response as JSON:', parseError);
            console.error('Raw response:', responseText.substring(0, 500));

            return new Response(JSON.stringify({
                error: 'Invalid API response format',
                message: 'DeepSeek API returned non-JSON response. This may indicate an API key issue, rate limiting, or service error.',
                status: response.status,
                rawResponse: responseText.substring(0, 200),
                hint: response.status === 401 ? 'Check your API key' :
                    response.status === 429 ? 'Rate limit exceeded, try again later' :
                        response.status >= 500 ? 'DeepSeek service error, try again later' :
                            'Unknown error'
            }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // If API returned an error status, ensure we return it as valid JSON
        if (!response.ok) {
            console.error('DeepSeek API error:', data);

            // Ensure error response is valid JSON
            const errorResponse = {
                error: data.error || data.message || 'API request failed',
                message: data.message || data.error?.message || `DeepSeek API error (${response.status})`,
                status: response.status,
                details: data
            };

            return new Response(JSON.stringify(errorResponse), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Success - return the parsed JSON data
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Handler error:', error);

        // Ensure error response is always valid JSON
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message || 'An unexpected error occurred',
            details: error.toString(),
            stack: error.stack?.substring(0, 200)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
