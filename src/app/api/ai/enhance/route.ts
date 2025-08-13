import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { aiService } from '@/services/aiService';
import { enhanceSchema } from '@/validations/aiValidation';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!aiService.isConfigured()) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const body = await request.json();
    const validationResult = enhanceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { content, type, options } = validationResult.data;
    const result = await aiService.enhanceContent(content, type, options);

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI Enhance API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}