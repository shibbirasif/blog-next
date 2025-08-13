'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { Button, Badge } from 'flowbite-react';
import { FaLightbulb, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Tone } from '@/constants/ai';

import debounce from 'lodash.debounce';

interface AISuggestion {
    id: string;
    type: 'completion' | 'improvement' | 'correction';
    content: string;
    confidence: number;
    position: { from: number; to: number };
    reason?: string;
}

interface InlineAISuggestionsProps {
    editor: Editor;
    isEnabled: boolean;
    triggerWords?: number; // Number of words to trigger suggestions
    debounceMs?: number;
}

export default function InlineAISuggestions({
    editor,
    isEnabled = true,
    triggerWords = 5,
    debounceMs = 1000
}: InlineAISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const { completeText } = useAIAssistant();
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const lastContentRef = useRef('');
    const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced function to generate suggestions
    const debouncedGenerateSuggestions = useMemo(
        () => debounce(
            async (content: string, cursorPos: number) => {
                if (!isEnabled || content.length < triggerWords * 5) return; // Rough word estimate

                setIsLoading(true);

                try {
                    // Get context around cursor (last 100 characters)
                    const contextStart = Math.max(0, cursorPos - 100);
                    const context = content.substring(contextStart, cursorPos);

                    // Get text completion suggestion
                    const response = await completeText(context, {
                        tone: Tone.CASUAL,
                        maxLength: 50 // Short suggestions
                    });

                    if (response.success && response.content) {
                        const suggestion: AISuggestion = {
                            id: Date.now().toString(),
                            type: 'completion',
                            content: response.content,
                            confidence: 0.8,
                            position: { from: cursorPos, to: cursorPos },
                            reason: 'Continue writing'
                        };

                        setSuggestions([suggestion]);
                        setShowSuggestions(true);

                        // Auto-hide after 10 seconds
                        if (suggestionTimeoutRef.current) {
                            clearTimeout(suggestionTimeoutRef.current);
                        }
                        suggestionTimeoutRef.current = setTimeout(() => {
                            setShowSuggestions(false);
                        }, 10000);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (error) {
                    console.error('Error generating AI suggestions:', error);
                    setSuggestions([]);
                    setShowSuggestions(false);
                } finally {
                    setIsLoading(false);
                }
            },
            debounceMs
        ),
        [completeText, isEnabled, triggerWords, debounceMs]
    );

    const updateCursorPosition = useCallback(() => {
        if (!editor) return;

        try {
            const { from } = editor.state.selection;
            const coords = editor.view.coordsAtPos(from);
            const editorRect = editor.view.dom.getBoundingClientRect();

            setCursorPosition({
                x: coords.left - editorRect.left,
                y: coords.bottom - editorRect.top
            });
        } catch {
            // Ignore coordinate errors
        }
    }, [editor]);

    // Monitor editor changes
    useEffect(() => {
        if (!editor || !isEnabled) return;

        const handleUpdate = () => {
            const { from } = editor.state.selection;
            const content = editor.getHTML();

            // Only generate suggestions if content has changed significantly
            const wordCount = content.split(/\s+/).length;
            const lastWordCount = lastContentRef.current.split(/\s+/).length;

            if (Math.abs(wordCount - lastWordCount) >= triggerWords) {
                lastContentRef.current = content;

                // Update cursor position for suggestion placement
                updateCursorPosition();

                // Generate suggestions
                debouncedGenerateSuggestions(content, from);
            }
        };

        const handleSelectionUpdate = () => {
            updateCursorPosition();

            // Hide suggestions when user moves cursor
            if (showSuggestions && suggestions.length > 0) {
                const { from } = editor.state.selection;
                const suggestion = suggestions[0];
                if (from !== suggestion.position.from) {
                    setShowSuggestions(false);
                }
            }
        };

        editor.on('update', handleUpdate);
        editor.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editor.off('update', handleUpdate);
            editor.off('selectionUpdate', handleSelectionUpdate);
        };
    }, [editor, isEnabled, debouncedGenerateSuggestions, showSuggestions, suggestions, triggerWords, updateCursorPosition]);

    const acceptSuggestion = (suggestion: AISuggestion) => {
        if (!editor) return;

        const { from, to } = suggestion.position;
        editor.chain()
            .focus()
            .setTextSelection({ from, to })
            .insertContent(suggestion.content)
            .run();

        setSuggestions([]);
        setShowSuggestions(false);
    };

    const rejectSuggestion = (suggestionId: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        if (suggestions.length <= 1) {
            setShowSuggestions(false);
        }
    };

    const rejectAllSuggestions = () => {
        setSuggestions([]);
        setShowSuggestions(false);
    };

    if (!isEnabled || (!showSuggestions && suggestions.length === 0 && !isLoading)) {
        return null;
    }

    return (
        <>
            {/* Loading indicator */}
            {isLoading && (
                <div
                    className="absolute z-50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                    style={{
                        left: cursorPosition.x,
                        top: cursorPosition.y + 5,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <FaSpinner className="animate-spin w-3 h-3" />
                    AI thinking...
                </div>
            )}

            {/* Suggestions popup */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 max-w-sm"
                    style={{
                        left: cursorPosition.x,
                        top: cursorPosition.y + 10,
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <FaLightbulb className="text-yellow-500 w-4 h-4" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            AI Suggestion
                        </span>
                        <Button
                            size="xs"
                            color="gray"
                            onClick={rejectAllSuggestions}
                            className="ml-auto"
                        >
                            <FaTimes className="w-3 h-3" />
                        </Button>
                    </div>

                    {suggestions.map(suggestion => (
                        <div key={suggestion.id} className="space-y-2">
                            <div className="flex items-start gap-2">
                                <Badge
                                    color={
                                        suggestion.type === 'completion' ? 'blue' :
                                            suggestion.type === 'improvement' ? 'green' :
                                                'yellow'
                                    }
                                    size="xs"
                                >
                                    {suggestion.type}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-white break-words">
                                        {suggestion.content}
                                    </p>
                                    {suggestion.reason && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {suggestion.reason}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="xs"
                                    color="blue"
                                    onClick={() => acceptSuggestion(suggestion)}
                                >
                                    <FaCheck className="w-3 h-3 mr-1" />
                                    Accept
                                </Button>
                                <Button
                                    size="xs"
                                    color="gray"
                                    onClick={() => rejectSuggestion(suggestion.id)}
                                >
                                    <FaTimes className="w-3 h-3 mr-1" />
                                    Dismiss
                                </Button>
                            </div>

                            {/* Confidence indicator */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Confidence:</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                    <div
                                        className="bg-blue-500 h-1 rounded-full"
                                        style={{ width: `${suggestion.confidence * 100}%` }}
                                    />
                                </div>
                                <span>{Math.round(suggestion.confidence * 100)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
