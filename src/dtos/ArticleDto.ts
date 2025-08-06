import mongoose from "mongoose";
import { IArticle } from "@/models/Article";

export interface ArticleDto {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    tags: {
        id: string;
        name: string;
        color?: string;
    }[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ArticleListDto {
    id: string;
    title: string;
    slug: string;
    content: string; // Could be truncated for list views
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    tags: {
        id: string;
        name: string;
        color?: string;
    }[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function buildArticleDto(articleDoc: IArticle): ArticleDto {
    const author = articleDoc.author as unknown as { _id: mongoose.Types.ObjectId; name: string; image?: string }; // Populated author
    const tags = articleDoc.tags as unknown as { _id: mongoose.Types.ObjectId; name: string; color?: string }[]; // Populated tags
    return {
        id: articleDoc._id.toString(),
        title: articleDoc.title,
        slug: articleDoc.slug,
        content: articleDoc.content,
        author: {
            id: author._id.toString(),
            name: author.name,
            avatar: author.image,
        },
        tags: tags.map(tag => ({
            id: tag._id.toString(),
            name: tag.name,
            color: tag.color,
        })),
        isPublished: articleDoc.isPublished,
        createdAt: articleDoc.createdAt,
        updatedAt: articleDoc.updatedAt,
    };
}

export function buildArticleListDto(articleDoc: IArticle): ArticleListDto {
    const author = articleDoc.author as unknown as { _id: mongoose.Types.ObjectId; name: string; image?: string }; // Populated author
    const tags = articleDoc.tags as unknown as { _id: mongoose.Types.ObjectId; name: string; color?: string }[]; // Populated tags

    return {
        id: articleDoc._id.toString(),
        title: articleDoc.title,
        slug: articleDoc.slug,
        content: articleDoc.content.substring(0, 200) + '...',
        author: {
            id: author._id.toString(),
            name: author.name,
            avatar: author.image,
        },
        tags: tags.map(tag => ({
            id: tag._id.toString(),
            name: tag.name,
            color: tag.color,
        })),
        isPublished: articleDoc.isPublished,
        createdAt: articleDoc.createdAt,
        updatedAt: articleDoc.updatedAt,
    };
}
