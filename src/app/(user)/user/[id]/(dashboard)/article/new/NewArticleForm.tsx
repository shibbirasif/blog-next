"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientCreateArticleInput, clientCreateArticleSchema } from '@/validations/article';
import RichTextEditor from '@/components/richTextEditor/RichTextEditor';
import { Button, Label, TextInput, Badge } from 'flowbite-react';
import { HiOutlineEye, HiOutlineSave, HiOutlineTag } from 'react-icons/hi';
import { TagDto } from '@/dtos/TagDto';

interface NewArticleFormProps {
    userId: string;
    availableTags: TagDto[];
}



export default function NewArticleForm({ userId, availableTags }: NewArticleFormProps) {
    const router = useRouter();
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setValue
    } = useForm<ClientCreateArticleInput>({
        resolver: zodResolver(clientCreateArticleSchema),
        defaultValues: {
            title: '',
            content: '',
            tags: [],
            isPublished: false
        }
    });


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

    const onSubmit = async (data: ClientCreateArticleInput) => {
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
        }
    };

    const handleSaveDraft = async (data: ClientCreateArticleInput) => {
        const formData = { ...data, isPublished: false, tags: selectedTags };
        await onSubmit(formData);
    };

    const handlePublish = async (data: ClientCreateArticleInput) => {
        const formData = { ...data, isPublished: true, tags: selectedTags };
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
                    required={false}
                    placeholder="Enter article title..."
                    disabled={isSubmitting}
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
                    defaultValue=""
                    render={({ field }) => (
                        <RichTextEditor
                            content={field.value || ''}
                            onContentChange={field.onChange}
                            hasError={!!errors.content}
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
                        onClick={handleSubmit((data) => handleSaveDraft(data))}
                        disabled={isSubmitting}
                    >
                        <HiOutlineSave className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>

                    <Button
                        color="blue"
                        onClick={handleSubmit((data) => handlePublish(data))}
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
