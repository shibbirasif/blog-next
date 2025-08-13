'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/react';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    action: () => void;
    description: string;
}

interface AIKeyboardHandlerProps {
    editor: Editor | null;
    isModalOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
    onQuickGenerate: () => void;
    onQuickComplete: () => void;
    onQuickEnhance: () => void;
    onTabChange?: (tab: 'generate' | 'complete' | 'enhance') => void;
}

export const useAIKeyboardShortcuts = ({
    editor,
    isModalOpen,
    onOpenModal,
    onCloseModal,
    onQuickGenerate,
    onQuickComplete,
    onQuickEnhance,
    onTabChange
}: AIKeyboardHandlerProps) => {

    const shortcuts: KeyboardShortcut[] = useMemo(() => [
        {
            key: 'k',
            ctrlKey: true,
            action: onOpenModal,
            description: 'Open AI Assistant'
        },
        {
            key: 'g',
            ctrlKey: true,
            shiftKey: true,
            action: onQuickGenerate,
            description: 'Quick Generate Content'
        },
        {
            key: 'c',
            ctrlKey: true,
            shiftKey: true,
            action: onQuickComplete,
            description: 'Complete Text'
        },
        {
            key: 'e',
            ctrlKey: true,
            shiftKey: true,
            action: onQuickEnhance,
            description: 'Enhance Selected Text'
        },
        {
            key: 'Escape',
            action: onCloseModal,
            description: 'Close AI Modal'
        }
    ], [onOpenModal, onQuickGenerate, onQuickComplete, onQuickEnhance, onCloseModal]);

    const handleKeydown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts if user is typing in an input field
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            (event.target as HTMLElement)?.isContentEditable) {
            // Only allow Escape to close modal when typing
            if (event.key === 'Escape' && isModalOpen) {
                event.preventDefault();
                onCloseModal();
            }
            return;
        }

        for (const shortcut of shortcuts) {
            const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
            const matchesCtrl = shortcut.ctrlKey ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
            const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;

            if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
                event.preventDefault();
                event.stopPropagation();
                shortcut.action();
                break;
            }
        }

        // Tab navigation within modal
        if (isModalOpen && event.key === 'Tab' && !event.shiftKey && onTabChange) {
            // Simple tab cycling - in a real implementation, you'd track current tab
            event.preventDefault();
        }
    }, [
        shortcuts,
        isModalOpen,
        onCloseModal,
        onTabChange
    ]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, [handleKeydown]);

    return {
        shortcuts: shortcuts.map((shortcut) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { action, ...rest } = shortcut;
            return rest;
        }),
        isEnabled: !!editor
    };
};

export default function AIKeyboardHandler(props: AIKeyboardHandlerProps) {
    useAIKeyboardShortcuts(props);
    return null; // This is a logic-only component
}
