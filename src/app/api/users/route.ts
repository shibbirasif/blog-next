import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';
import { PAGINATION } from '@/constants/common';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || PAGINATION.USERS_SEARCH_LIMIT.toString());

        if (search) {
            const users = await userService.searchUsersByName(search, limit);
            return NextResponse.json(users);
        } else {
            const users = await userService.getAllUsers();
            return NextResponse.json(users);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
