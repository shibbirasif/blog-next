import { NextResponse } from 'next/server';
import { aiService } from '@/services/aiService';

export async function GET() {
    try {
        const status = await aiService.getServiceStatus();

        return NextResponse.json({
            success: true,
            services: status.services,
            overall: status.overall,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('AI status check failed:', error);

        return NextResponse.json({
            success: false,
            services: [],
            overall: 'offline',
            error: 'Failed to check AI services',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
