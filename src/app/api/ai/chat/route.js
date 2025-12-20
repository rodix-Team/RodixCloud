import { NextResponse } from 'next/server';
import { getAIResponse } from '../../../../lib/openai';

export async function POST(request) {
    try {
        const { message, history, context } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get AI response (can be string or object with content/buttons/product)
        const aiResponse = await getAIResponse(message, history || [], context);

        // If response is a string, convert to object
        const responseData = typeof aiResponse === 'string'
            ? { content: aiResponse }
            : aiResponse;

        return NextResponse.json({
            response: responseData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Chat API Error:', error);

        // Return friendly error message
        return NextResponse.json(
            {
                error: 'عذراً، حدث خطأ. حاول مرة أخرى.',
                details: error.message
            },
            { status: 500 }
        );
    }
}
