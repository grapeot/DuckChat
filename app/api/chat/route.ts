import { NextRequest, NextResponse } from 'next/server';

const AI_BUILDER_API_URL = 'https://space.ai-builders.com/backend/v1/chat/completions';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'grok-4-fast' } = await request.json();
    
    const token = process.env.AI_BUILDER_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: 'AI_BUILDER_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const requestBody = {
      model,
      messages,
      stream: false,
      temperature: 0.7,
      max_tokens: 2048,
    };

    console.log('=== AI Builder API Request ===');
    console.log('URL:', AI_BUILDER_API_URL);
    console.log('Method: POST');
    console.log('Model:', model);
    console.log('Messages count:', messages?.length);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('Token present:', !!token);
    console.log('Token length:', token?.length);

    const response = await fetch(AI_BUILDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('=== AI Builder API Response ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      let errorDetails: any = {};
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.error || errorMessage;
        errorDetails = errorData;
        console.error('=== Error Response (JSON) ===');
        console.error(JSON.stringify(errorData, null, 2));
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
            console.error('=== Error Response (Text) ===');
            console.error(errorText);
          }
        } catch (e) {
          console.error('=== Failed to read error response ===');
          console.error(e);
        }
      }
      
      console.error('=== Full Error Details ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error Message:', errorMessage);
      console.error('Error Details:', errorDetails);
      
      // If model not found, suggest alternatives
      if (response.status === 400 || response.status === 422) {
        return NextResponse.json(
          { 
            error: errorMessage,
            suggestion: 'Try using one of these models: deepseek, secondmind-agent-v1, gemini-2.5-pro, or gpt-5'
          },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('=== Chat API Exception ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

