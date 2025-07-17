import { ITag } from "@/models/Tag";

export interface TagDto {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function buildTagDto(tagDoc: ITag): TagDto {
    return {
        _id: tagDoc._id.toString(),
        name: tagDoc.name,
        description: tagDoc.description || '',
        color: tagDoc.color || '',
        isActive: tagDoc.isActive,
        createdAt: tagDoc.createdAt,
        updatedAt: tagDoc.updatedAt
    };
}

export function buildTagDtos(tagDocs: ITag[]): TagDto[] {
    return tagDocs.map(tagDoc => buildTagDto(tagDoc));
}