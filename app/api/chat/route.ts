import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API key not configured',
          fallback: true
        }, 
        { status: 400 }
      );
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model (use gemini-2.0-flash-exp or fallback to gemini-pro)
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
    });

    // Extract the prompt from the request body
    const prompt = body.contents?.[0]?.parts?.[0]?.text || body.prompt || '';
    
    if (!prompt) {
      return NextResponse.json(
        { 
          error: 'No prompt provided',
          fallback: true
        }, 
        { status: 400 }
      );
    }

    // Generate content using the SDK
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return in the expected format
    return NextResponse.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: text
              }
            ]
          },
          finishReason: "STOP"
        }
      ]
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        return NextResponse.json(
          { 
            error: 'Invalid API key',
            message: 'Please check your Gemini API key configuration',
            fallback: true
          }, 
          { status: 401 }
        );
      }
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        return NextResponse.json(
          { 
            error: 'API quota exceeded',
            message: 'Gemini API quota has been exceeded',
            fallback: true
          }, 
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        fallback: true
      }, 
      { status: 500 }
    );
  }
}
