"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RichTextEditor from '@/components/richTextEditor/RichTextEditor';
import { Button, Label, TextInput, Badge, Alert } from 'flowbite-react';
import { HiOutlineEye, HiOutlineSave, HiOutlineTag, HiOutlineTrash } from 'react-icons/hi';
import { TagDto } from '@/dtos/TagDto';
import { ArticleDto } from '@/dtos/ArticleDto';
import { ClientCreateArticleInput, ClientUpdateArticleInput } from '@/validations/article';

type FormData = ClientCreateArticleInput | ClientUpdateArticleInput;

interface ArticleFormProps {
    availableTags: TagDto[];
    article?: ArticleDto;
    validationSchema: unknown; // Use unknown instead of any for better type safety
    defaultValues: Partial<FormData>;
    onSubmit: (data: FormData) => Promise<void>;
    onDelete?: () => Promise<void>;
    onPublishToggle?: () => Promise<void>;
    isOperating?: boolean;
    mode: 'create' | 'edit';
}

export default function ArticleForm({
    availableTags,
    article,
    validationSchema,
    defaultValues,
    onSubmit,
    onDelete,
    onPublishToggle,
    isOperating = false,
    mode
}: ArticleFormProps) {
    const router = useRouter();
    const [selectedTags, setSelectedTags] = useState<string[]>(
        article?.tags?.map(tag => tag.id) || defaultValues.tags || []
    );
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const [isPublished, setIsPublished] = useState(article?.isPublished || false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setValue
    } = useForm({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(validationSchema as any),
        defaultValues: {
            ...defaultValues,
            tags: selectedTags
        }
    });

    useEffect(() => {
        setValue('tags', selectedTags);
    }, [selectedTags, setValue]);

    // Combined loading state for UI elements
    const isLoading = isSubmitting || isOperating;

    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
        !selectedTags.includes(tag.id)
    );

    const handleTagToggle = (tagId: string) => {
        const newSelectedTags = selectedTags.includes(tagId)
            ? selectedTags.filter(id => id !== tagId)
            : [...selectedTags, tagId];

        setSelectedTags(newSelectedTags);
    };

    const getSelectedTagObjects = () => {
        return availableTags.filter(tag => selectedTags.includes(tag.id));
    };

    const handleSaveDraft = async (data: FormData) => {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await onSubmit({ ...data, isPublished: false, tags: selectedTags, uploadedFileIds });
            setSuccessMessage(mode === 'edit' ? 'Article updated successfully!' : 'Article saved as draft!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save article';
            setErrorMessage(errorMessage);
        }
    };

    const handlePublish = async (data: FormData) => {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await onSubmit({ ...data, isPublished: true, tags: selectedTags, uploadedFileIds });
            setSuccessMessage(mode === 'edit' ? 'Article updated and published!' : 'Article published successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to publish article';
            setErrorMessage(errorMessage);
        }
    };

    const handleDeleteWrapper = async () => {
        if (!onDelete) return;

        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await onDelete();
            setSuccessMessage('Article deleted successfully!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete article';
            setErrorMessage(errorMessage);
        }
    };

    const handlePublishToggleWrapper = async () => {
        if (!onPublishToggle) return;

        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await onPublishToggle();
            const newStatus = !isPublished;
            setIsPublished(newStatus);
            setSuccessMessage(`Article ${newStatus ? 'published' : 'unpublished'} successfully!`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update publish status';
            setErrorMessage(errorMessage);
        }
    };

    return (
        <div className="space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
                <Alert color="success">
                    <span className="font-medium">Success!</span> {successMessage}
                </Alert>
            )}

            {errorMessage && (
                <Alert color="failure">
                    <span className="font-medium">Error!</span> {errorMessage}
                </Alert>
            )}

            <form className="space-y-6">
                {/* Title Field */}
                <div>
                    <Label htmlFor="title" className="mb-2 block">
                        Article Title
                    </Label>
                    <TextInput
                        id="title"
                        {...register('title')}
                        maxLength={200}
                        required={false}
                        placeholder="Enter article title..."
                        disabled={isLoading}
                        color={errors.title ? 'failure' : 'gray'}
                    />
                    {errors.title && (
                        <p className="text-red-600 text-sm mt-1">
                            {typeof errors.title.message === 'string' ? errors.title.message : 'Title is required'}
                        </p>
                    )}
                </div>

                {/* Content Field */}
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
                                hasError={!!errors.content}
                                onImageUpload={fileId => setUploadedFileIds(ids => [...ids, fileId])}
                            />
                        )}
                    />
                    {errors.content && (
                        <p className="text-red-600 text-sm mt-1">
                            {typeof errors.content.message === 'string' ? errors.content.message : 'Content is required'}
                        </p>
                    )}
                </div>

                {/* Tags Field */}
                <div>
                    <Label className="mb-2 block">
                        Tags
                    </Label>

                    {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {getSelectedTagObjects().map(tag => (
                                <Badge
                                    key={tag.id}
                                    color="gray"
                                    className="cursor-pointer"
                                    onClick={() => handleTagToggle(tag.id)}
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

                    <div className="relative">
                        <TextInput
                            icon={HiOutlineTag}
                            placeholder="Search and select tags..."
                            value={tagSearchTerm}
                            onChange={(e) => setTagSearchTerm(e.target.value)}
                            onFocus={() => setShowTagDropdown(true)}
                            onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                            color={errors.tags ? 'failure' : 'gray'}
                        />

                        {showTagDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredTags.length > 0 ? (
                                    filteredTags.map(tag => (
                                        <div
                                            key={tag.id}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                                            onClick={() => {
                                                handleTagToggle(tag.id);
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
                    {errors.tags && (
                        <p className="text-red-600 text-sm mt-1">
                            {typeof errors.tags.message === 'string' ? errors.tags.message : 'Tags are required'}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <div className="flex gap-3">
                        <Button
                            color="gray"
                            onClick={() => router.back()}
                            disabled={isLoading}
                            type="button"
                        >
                            Cancel
                        </Button>

                        {/* Edit Mode: Delete Button */}
                        {mode === 'edit' && onDelete && (
                            <Button
                                color="failure"
                                onClick={handleDeleteWrapper}
                                disabled={isLoading}
                                type="button"
                            >
                                <HiOutlineTrash className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {/* Edit Mode: Publish/Unpublish Toggle */}
                        {mode === 'edit' && onPublishToggle && article && (
                            <Button
                                color={isPublished ? "warning" : "success"}
                                onClick={handlePublishToggleWrapper}
                                disabled={isLoading}
                                type="button"
                            >
                                <HiOutlineEye className="mr-2 h-4 w-4" />
                                {isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                        )}

                        {/* Save Draft Button */}
                        <Button
                            color="light"
                            onClick={handleSubmit((data) => handleSaveDraft(data))}
                            disabled={isLoading}
                            type="button"
                        >
                            <HiOutlineSave className="mr-2 h-4 w-4" />
                            Save Draft
                        </Button>

                        {/* Publish Button */}
                        <Button
                            color="blue"
                            onClick={handleSubmit((data) => handlePublish(data))}
                            disabled={isLoading}
                            type="button"
                        >
                            <HiOutlineEye className="mr-2 h-4 w-4" />
                            {isSubmitting
                                ? (mode === 'edit' ? 'Updating...' : 'Publishing...')
                                : (mode === 'edit' ? 'Update & Publish' : 'Publish')
                            }
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
