import Tag from '@/models/Tag';
import { dbConnect } from '@/lib/db';
import { buildTagDtos, TagDto } from '@/dtos/TagDto';

class TagService {
    async searchTags(query: string): Promise<TagDto[]> {
        await dbConnect();

        const regex = new RegExp(query, 'i');
        return buildTagDtos(await (await Tag.find({ name: regex, isActive: true }).sort({ name: 1 })));
    }

    async getAllTags(): Promise<TagDto[]> {
        await dbConnect();

        return buildTagDtos(await Tag.find({ isActive: true }).sort({ name: 1 }));

    }
}

export const tagService = new TagService();
