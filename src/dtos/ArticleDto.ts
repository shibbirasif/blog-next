import mongoose from "mongoose";
import { IArticle } from "@/models/Article";
import { UserDto } from "./UserDto";
import { TagDto } from "./TagDto";

export interface ArticleDto {
    _id: string;
    title: string;
    slug: string;
    content: string;
    author: UserDto;
    tags: TagDto[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ArticleListDto {
    _id: string;
    title: string;
    slug: string;
    content: string; // Could be truncated for list views
    author: {
        _id: string;
        name: string;
        image?: string;
    };
    tags: {
        _id: string;
        name: string;
        color?: string;
    }[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function buildArticleDto(articleDoc: IArticle): ArticleDto {
    return {
        _id: articleDoc._id.toString(),
        title: articleDoc.title,
        slug: articleDoc.slug,
        content: articleDoc.content,
        author: articleDoc.author as unknown as UserDto, // Assumes populated
        tags: articleDoc.tags as unknown as TagDto[], // Assumes populated
        isPublished: articleDoc.isPublished,
        createdAt: articleDoc.createdAt,
        updatedAt: articleDoc.updatedAt,
    };
}

export function buildArticleListDto(articleDoc: IArticle): ArticleListDto {
    const author = articleDoc.author as unknown as { _id: mongoose.Types.ObjectId; name: string; image?: string }; // Populated author
    const tags = articleDoc.tags as unknown as { _id: mongoose.Types.ObjectId; name: string; color?: string }[]; // Populated tags

    return {
        _id: articleDoc._id.toString(),
        title: articleDoc.title,
        slug: articleDoc.slug,
        content: articleDoc.content.substring(0, 200) + '...', // Truncate for list view
        author: {
            _id: author._id.toString(),
            name: author.name,
            image: author.image,
        },
        tags: tags.map(tag => ({
            _id: tag._id.toString(),
            name: tag.name,
            color: tag.color,
        })),
        isPublished: articleDoc.isPublished,
        createdAt: articleDoc.createdAt,
        updatedAt: articleDoc.updatedAt,
    };
}
