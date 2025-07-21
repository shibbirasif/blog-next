"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Badge, TextInput, Select } from 'flowbite-react';
import { HiOutlineSearch, HiOutlineCalendar, HiOutlineTag, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { TagDto } from '@/dtos/TagDto';
import { ArticleSortOrder } from '@/constants/enums';
import { PAGINATION } from '@/constants/common';
import AuthorSearchDropdown from './AuthorSearchDropdown';

interface SearchFilterProps {
    tags: TagDto[];
}

export default function SearchFilter({ tags }: SearchFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL parameters
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        searchParams.get('tags')?.split(',').filter(Boolean) || []
    );
    const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || ArticleSortOrder.NEWEST);

    // Tags visibility state
    const [showAllTags, setShowAllTags] = useState(false);

    // Sync state with URL parameters when they change
    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
        setSelectedTags(searchParams.get('tags')?.split(',').filter(Boolean) || []);
        setSelectedAuthor(searchParams.get('author') || '');
        setSortBy(searchParams.get('sortBy') || ArticleSortOrder.NEWEST);
    }, [searchParams]);

    const handleTagToggle = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleFilter = () => {
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.set('search', searchTerm.trim());
        if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
        if (selectedAuthor) params.set('author', selectedAuthor);
        if (sortBy && sortBy !== ArticleSortOrder.NEWEST) params.set('sortBy', sortBy);

        const queryString = params.toString();
        const url = queryString ? `/?${queryString}` : '/';

        router.push(url);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedTags([]);
        setSelectedAuthor('');
        setSortBy(ArticleSortOrder.NEWEST);
        router.push('/');
    };

    const hasActiveFilters = searchTerm || selectedTags.length > 0 || selectedAuthor || sortBy !== ArticleSortOrder.NEWEST;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            {/* Search - Full Width */}
            <div className="mb-4">
                <TextInput
                    icon={HiOutlineSearch}
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Author Filter */}
                <AuthorSearchDropdown
                    value={selectedAuthor}
                    onChange={setSelectedAuthor}
                />

                {/* Sort */}
                <Select
                    icon={HiOutlineCalendar}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value={ArticleSortOrder.NEWEST}>Newest First</option>
                    <option value={ArticleSortOrder.OLDEST}>Oldest First</option>
                </Select>
            </div>

            {/* Tag Filter */}
            <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                    <HiOutlineTag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filter by tags:
                    </span>
                </div>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 transition-all duration-300 ease-in-out">
                        {(showAllTags ? tags : tags.slice(0, PAGINATION.TAGS_INITIAL_LIMIT)).map((tag) => (
                            <Badge
                                key={tag._id}
                                color={selectedTags.includes(tag._id) ? "blue" : "gray"}
                                className={`cursor-pointer transition-all duration-200 ${selectedTags.includes(tag._id)
                                    ? 'ring-2 ring-blue-300 scale-105'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                                    }`}
                                onClick={() => handleTagToggle(tag._id)}
                            >
                                <span className="flex items-center gap-1">
                                    {tag.color && (
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                    )}
                                    {tag.name}
                                </span>
                            </Badge>
                        ))}
                    </div>

                    {/* Show More/Less Button */}
                    {tags.length > PAGINATION.TAGS_INITIAL_LIMIT && (
                        <div className="flex justify-center">
                            <Button
                                color="light"
                                size="xs"
                                onClick={() => setShowAllTags(!showAllTags)}
                                className="!text-xs !py-1.5 !px-3 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                            >
                                <span className="flex items-center gap-1.5">
                                    {showAllTags ? (
                                        <>
                                            <HiChevronUp className="w-3 h-3" />
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <HiChevronDown className="w-3 h-3" />
                                            Show {tags.length - PAGINATION.TAGS_INITIAL_LIMIT} More Tags
                                        </>
                                    )}
                                </span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 justify-end">
                {hasActiveFilters && (
                    <Button
                        color="gray"
                        onClick={resetFilters}
                    >
                        Reset All Filters
                    </Button>
                )}

                <Button
                    color="blue"
                    onClick={handleFilter}
                >
                    <HiOutlineSearch className="w-4 h-4 mr-2" />
                    Filter
                </Button>
            </div>
        </div>
    );
}
