'use client';

import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Tabs, TabItem, Button, Textarea, Select, Alert, Spinner } from 'flowbite-react';
import { Editor } from '@tiptap/react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { FaRobot, FaMagic, FaEdit, FaCheckCircle, FaCopy, FaTimes } from 'react-icons/fa';
import { Tone, EnhancementType } from '@/constants/ai';

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    editor: Editor;
}

const toneOptions = [
    { value: Tone.FORMAL, label: 'Formal' },
    { value: Tone.CASUAL, label: 'Casual' },
    { value: Tone.PROFESSIONAL, label: 'Professional' },
];

const enhancementOptions = [
    { value: EnhancementType.GRAMMAR, label: 'Grammar & Spelling', icon: FaCheckCircle },
    { value: EnhancementType.STYLE, label: 'Style & Clarity', icon: FaEdit },
    { value: EnhancementType.SEO, label: 'SEO Optimization', icon: FaMagic },
];

export default function AIAssistantModal({ isOpen, onClose, editor }: AIAssistantModalProps) {
    const { isLoading, error, generateContent, completeText, enhanceContent, clearError } = useAIAssistant();
    const [prompt, setPrompt] = useState('');
    const [selectedTone, setSelectedTone] = useState<Tone>(Tone.CASUAL);
    const [enhancementType, setEnhancementType] = useState<EnhancementType>(EnhancementType.GRAMMAR);
    const [generatedContent, setGeneratedContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    // Clear states when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPrompt('');
            setGeneratedContent('');
            setShowPreview(false);
            clearError();
        }
    }, [isOpen, clearError]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );

        const response = await generateContent({
            type: 'generate',
            prompt: prompt.trim(),
            context: selectedText || undefined,
            options: { tone: selectedTone }
        });

        if (response.success && response.content) {
            setGeneratedContent(response.content);
            setShowPreview(true);
        }
    };

    const handleComplete = async () => {
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );

        if (!selectedText) {
            // Get text before cursor
            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(Math.max(0, from - 200), from);

            if (!textBefore.trim()) {
                alert('Please select some text or place cursor after existing text to complete.');
                return;
            }

            const response = await completeText(textBefore, { tone: selectedTone });

            if (response.success && response.content) {
                setGeneratedContent(response.content);
                setShowPreview(true);
            }
        } else {
            const response = await completeText(selectedText, { tone: selectedTone });

            if (response.success && response.content) {
                setGeneratedContent(response.content);
                setShowPreview(true);
            }
        }
    };

    const handleEnhance = async () => {
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to
        );

        if (!selectedText) {
            alert('Please select text to enhance.');
            return;
        }

        const response = await enhanceContent(selectedText, enhancementType, { tone: selectedTone });

        if (response.success && response.content) {
            setGeneratedContent(response.content);
            setShowPreview(true);
        }
    };

    const insertContent = () => {
        if (generatedContent) {
            editor.chain().focus().insertContent(generatedContent).run();
            setGeneratedContent('');
            setShowPreview(false);
            onClose();
        }
    };

    const replaceContent = () => {
        if (generatedContent) {
            const { from, to } = editor.state.selection;
            editor.chain().focus().setTextSelection({ from, to }).insertContent(generatedContent).run();
            setGeneratedContent('');
            setShowPreview(false);
            onClose();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        // You can add a toast notification here
    };

    return (
        <Modal show={isOpen} onClose={onClose} size="4xl" popup>
            <ModalHeader className="border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                    <FaRobot className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI Writing Assistant
                    </h3>
                </div>
            </ModalHeader>

            <ModalBody className="p-6">
                {error && (
                    <Alert color="failure" className="mb-4">
                        <span className="font-medium">Error:</span> {error}
                    </Alert>
                )}

                <Tabs
                    aria-label="AI Assistant features"
                    variant="underline"
                >
                    <TabItem active title="Generate" icon={FaRobot}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    What would you like to write about?
                                </label>
                                <Textarea
                                    placeholder="e.g., Write a blog post introduction about Next.js benefits..."
                                    rows={4}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tone
                                    </label>
                                    <Select
                                        value={selectedTone}
                                        onChange={(e) => setSelectedTone(e.target.value as Tone)}
                                        disabled={isLoading}
                                    >
                                        {toneOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <Button onClick={handleGenerate} disabled={!prompt.trim() || isLoading} className="w-full" color="blue">
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" light className="mr-2" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FaRobot className="mr-2" />
                                        Generate Content
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabItem>

                    <TabItem title="Complete" icon={FaMagic}>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                <p className="font-medium mb-1">How to use:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Select text you want to continue</li>
                                    <li>Or place cursor after existing text</li>
                                    <li>Click &quot;Complete Text&quot; to continue writing</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tone
                                </label>
                                <Select
                                    value={selectedTone}
                                    onChange={(e) => setSelectedTone(e.target.value as Tone)}
                                    disabled={isLoading}
                                >
                                    {toneOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <Button
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="w-full"
                                color="green"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" light className="mr-2" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <FaMagic className="mr-2" />
                                        Complete Text
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabItem>

                    <TabItem title="Enhance" icon={FaEdit}>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                <p className="font-medium mb-1">How to use:</p>
                                <p>Select the text you want to improve, then choose an enhancement type.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Enhancement Type
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {enhancementOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${enhancementType === option.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="enhancement"
                                                value={option.value}
                                                checked={enhancementType === option.value}
                                                onChange={(e) => setEnhancementType(e.target.value as EnhancementType)}
                                                className="sr-only"
                                            />
                                            <option.icon className="mr-3 text-lg" />
                                            <span className="font-medium">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tone
                                </label>
                                <Select
                                    value={selectedTone}
                                    onChange={(e) => setSelectedTone(e.target.value as Tone)}
                                    disabled={isLoading}
                                >
                                    {toneOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <Button
                                onClick={handleEnhance}
                                disabled={isLoading}
                                className="w-full"
                                color="pink"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" light className="mr-2" />
                                        Enhancing...
                                    </>
                                ) : (
                                    <>
                                        <FaEdit className="mr-2" />
                                        Enhance Content
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabItem>
                </Tabs>
            </ModalBody>

            {/* Content Preview in Footer */}
            {showPreview && generatedContent && (
                <ModalFooter className="border-t border-gray-200 dark:border-gray-600">
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">Generated Content:</h4>
                            <div className="flex gap-2">
                                <Button size="xs" color="gray" onClick={copyToClipboard}>
                                    <FaCopy className="mr-1" />
                                    Copy
                                </Button>
                                <Button size="xs" color="gray" onClick={() => setShowPreview(false)}>
                                    <FaTimes />
                                </Button>
                            </div>
                        </div>
                        <div className="prose dark:prose-invert max-w-none mb-4">
                            <p className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded border">
                                {generatedContent}
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" color="blue" onClick={insertContent}>
                                Insert at Cursor
                            </Button>
                            <Button size="sm" color="green" onClick={replaceContent}>
                                Replace Selection
                            </Button>
                        </div>
                    </div>
                </ModalFooter>
            )}
        </Modal>
    );
}