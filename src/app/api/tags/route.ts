import { NextResponse } from 'next/server';
import { tagService } from '@/services/tagService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    try {
        let tags;
        if (q) {
            tags = await tagService.searchTags(q);
        } else {
            tags = await tagService.getAllTags();
        }
        return NextResponse.json(tags);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}
