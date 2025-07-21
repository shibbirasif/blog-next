"use client";

import { useState, useEffect, useRef } from 'react';
import { TextInput, Spinner } from 'flowbite-react';
import { HiOutlineUser, HiChevronDown } from 'react-icons/hi';
import { UserDto } from '@/dtos/UserDto';
import { apiFetcher } from '@/utils/apiFetcher';
import { API_ROUTES } from '@/constants/apiRoutes';
import { PAGINATION } from '@/constants/common';

interface AuthorSearchDropdownProps {
    value: string;
    onChange: (authorId: string) => void;
    placeholder?: string;
}

export default function AuthorSearchDropdown({
    value,
    onChange,
    placeholder = "Search authors..."
}: AuthorSearchDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [authors, setAuthors] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAuthorName, setSelectedAuthorName] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Find selected author name when value changes
    useEffect(() => {
        if (value && authors.length > 0) {
            const selectedAuthor = authors.find(author => author._id === value);
            setSelectedAuthorName(selectedAuthor?.name || '');
        } else if (!value) {
            setSelectedAuthorName('');
        }
    }, [value, authors]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search authors with debounce
    const searchAuthors = async (search: string) => {
        if (!search.trim()) {
            setAuthors([]);
            return;
        }

        setLoading(true);
        try {
            const searchedAuthors = await apiFetcher<UserDto[]>(
                `${API_ROUTES.USERS.LIST(true)}?search=${encodeURIComponent(search)}&limit=${PAGINATION.USERS_SEARCH_LIMIT}`
            );
            setAuthors(searchedAuthors);
        } catch (error) {
            console.error('Error searching authors:', error);
            setAuthors([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change with debounce
    const handleSearchChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for 300ms debounce
        searchTimeoutRef.current = setTimeout(() => {
            searchAuthors(newSearchTerm);
        }, 300);
    };

    const handleAuthorSelect = (author: UserDto) => {
        onChange(author._id);
        setSelectedAuthorName(author.name);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        onChange('');
        setSelectedAuthorName('');
        setSearchTerm('');
    };

    const displayText = selectedAuthorName || 'All Authors';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Main Input/Display */}
            <div
                className="relative cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <div className="flex items-center gap-2">
                        <HiOutlineUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className={selectedAuthorName ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                            {displayText}
                        </span>
                    </div>
                    <HiChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg dark:bg-gray-700 dark:border-gray-600 max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <TextInput
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            sizing="sm"
                            autoFocus
                        />
                    </div>

                    {/* Options */}
                    <div className="max-h-48 overflow-y-auto">
                        {/* Clear Selection Option */}
                        {selectedAuthorName && (
                            <div
                                className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600"
                                onClick={handleClearSelection}
                            >
                                <span className="text-gray-500 dark:text-gray-400">All Authors</span>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="px-3 py-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Spinner size="sm" />
                                Searching...
                            </div>
                        )}

                        {/* Authors List */}
                        {!loading && authors.length > 0 && (
                            authors.map((author) => (
                                <div
                                    key={author._id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${author._id === value
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-900 dark:text-white'
                                        }`}
                                    onClick={() => handleAuthorSelect(author)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                            <HiOutlineUser className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                                        </div>
                                        <span>{author.name}</span>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* No Results */}
                        {!loading && searchTerm && authors.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                No authors found matching &quot;{searchTerm}&quot;
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !searchTerm && authors.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                Start typing to search authors...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
