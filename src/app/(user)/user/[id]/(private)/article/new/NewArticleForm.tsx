'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientCreateArticleSchema, type ClientCreateArticleInput } from '@/validations/article';
import RichTextEditor from '@/components/richTextEditor/RichTextEditor';
import { Button, Label, TextInput, Textarea, Checkbox, Badge } from 'flowbite-react';
import { HiOutlineEye, HiOutlineSave, HiOutlineTag } from 'react-icons/hi';

interface Tag {
    _id: string;
    name: string;
    color: string;
    description: string;
}

interface NewArticleFormProps {
    userId: string;
    availableTags: Tag[];
}

// Create a form type that matches our needs
type ArticleFormData = {
    title: string;
    content: string;
    tags: string[];
    isPublished: boolean;
    seriesId?: string;
    partNumber?: number;
};

export default function NewArticleForm({ userId, availableTags }: NewArticleFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        setValue
    } = useForm<ArticleFormData>({
        defaultValues: {
            title: '',
            content: '',
            tags: [],
            isPublished: false,
            seriesId: '',
            partNumber: undefined
        }
    });

    const watchedContent = watch('content');

    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
        !selectedTags.includes(tag._id)
    );

    const handleTagToggle = (tagId: string) => {
        const newSelectedTags = selectedTags.includes(tagId)
            ? selectedTags.filter(id => id !== tagId)
            : [...selectedTags, tagId];

        setSelectedTags(newSelectedTags);
        setValue('tags', newSelectedTags);
    };

    const getSelectedTagObjects = () => {
        return availableTags.filter(tag => selectedTags.includes(tag._id));
    };

    const onSubmit = async (data: ArticleFormData) => {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    author: userId,
                    tags: selectedTags
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create article');
            }

            const article = await response.json();

            // Redirect to the created article or user dashboard
            router.push(`/user/${userId}/dashboard`);
            router.refresh();
        } catch (error) {
            console.error('Error creating article:', error);
            alert(error instanceof Error ? error.message : 'Failed to create article');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        const formData = { ...watch(), isPublished: false, tags: selectedTags };
        await onSubmit(formData);
    };

    const handlePublish = async () => {
        const formData = { ...watch(), isPublished: true, tags: selectedTags };
        await onSubmit(formData);
    };

    return (
        <form className="space-y-6">
            {/* Title */}
            <div>
                <Label htmlFor="title" className="mb-2 block">
                    Article Title
                </Label>
                <TextInput
                    id="title"
                    {...register('title')}
                    placeholder="Enter article title..."
                    color={errors.title ? 'failure' : 'gray'}
                />
                {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
            </div>

            {/* Content */}
            <div>
                <Label className="mb-2 block">
                    Content
                </Label>
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            content={field.value || ''}
                            onContentChange={field.onChange}
                        />
                    )}
                />
                {errors.content && (
                    <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
                )}
            </div>

            {/* Tags */}
            <div>
                <Label className="mb-2 block">
                    Tags
                </Label>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {getSelectedTagObjects().map(tag => (
                            <Badge
                                key={tag._id}
                                color="gray"
                                className="cursor-pointer"
                                onClick={() => handleTagToggle(tag._id)}
                            >
                                <span className="flex items-center gap-1">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    {tag.name}
                                    <span className="ml-1">×</span>
                                </span>
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Tag Search */}
                <div className="relative">
                    <TextInput
                        icon={HiOutlineTag}
                        placeholder="Search and select tags..."
                        value={tagSearchTerm}
                        onChange={(e) => setTagSearchTerm(e.target.value)}
                        onFocus={() => setShowTagDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                    />

                    {/* Tag Dropdown */}
                    {showTagDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredTags.length > 0 ? (
                                filteredTags.slice(0, 10).map(tag => (
                                    <div
                                        key={tag._id}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                        onClick={() => {
                                            handleTagToggle(tag._id);
                                            setTagSearchTerm('');
                                        }}
                                    >
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="font-medium">{tag.name}</span>
                                        <span className="text-sm text-gray-500">{tag.description}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-gray-500 text-sm">
                                    No tags found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Series Information (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="seriesId" className="mb-2 block">
                        Series ID (Optional)
                    </Label>
                    <TextInput
                        id="seriesId"
                        {...register('seriesId')}
                        placeholder="e.g., react-tutorial"
                        color={errors.seriesId ? 'failure' : 'gray'}
                    />
                    {errors.seriesId && (
                        <p className="text-red-600 text-sm mt-1">{errors.seriesId.message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="partNumber" className="mb-2 block">
                        Part Number (Optional)
                    </Label>
                    <TextInput
                        id="partNumber"
                        type="number"
                        {...register('partNumber', { valueAsNumber: true })}
                        placeholder="1"
                        min="1"
                        max="9999"
                        color={errors.partNumber ? 'failure' : 'gray'}
                    />
                    {errors.partNumber && (
                        <p className="text-red-600 text-sm mt-1">{errors.partNumber.message}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                    color="gray"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>

                <div className="flex gap-3">
                    <Button
                        color="light"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                    >
                        <HiOutlineSave className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>

                    <Button
                        color="blue"
                        onClick={handlePublish}
                        disabled={isSubmitting}
                    >
                        <HiOutlineEye className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
