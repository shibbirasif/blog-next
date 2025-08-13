'use client';

import React from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import { FaGraduationCap, FaBriefcase, FaPaintBrush, FaBullhorn, FaCode, FaNewspaper } from 'react-icons/fa';

export interface WritingStyle {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: 'formal' | 'casual' | 'professional';
    characteristics: string[];
    examples: string[];
    color: string;
}

export const WRITING_STYLES: WritingStyle[] = [
    {
        id: 'academic',
        name: 'Academic',
        description: 'Scholarly, research-based writing with citations and formal language',
        icon: FaGraduationCap,
        tone: 'formal',
        characteristics: ['Third-person perspective', 'Complex sentence structures', 'Evidence-based arguments', 'Formal vocabulary'],
        examples: ['Research papers', 'Thesis statements', 'Academic essays', 'Scientific reports'],
        color: 'blue'
    },
    {
        id: 'business',
        name: 'Business',
        description: 'Professional communication for corporate environments',
        icon: FaBriefcase,
        tone: 'professional',
        characteristics: ['Clear and concise', 'Action-oriented', 'Results-focused', 'Professional terminology'],
        examples: ['Business proposals', 'Executive summaries', 'Corporate communications', 'Reports'],
        color: 'gray'
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Expressive, imaginative writing with artistic flair',
        icon: FaPaintBrush,
        tone: 'casual',
        characteristics: ['Vivid imagery', 'Emotional language', 'Narrative techniques', 'Personal voice'],
        examples: ['Blog posts', 'Stories', 'Creative essays', 'Personal narratives'],
        color: 'purple'
    },
    {
        id: 'marketing',
        name: 'Marketing',
        description: 'Persuasive content designed to engage and convert',
        icon: FaBullhorn,
        tone: 'professional',
        characteristics: ['Compelling headlines', 'Call-to-action', 'Benefits-focused', 'Audience-targeted'],
        examples: ['Sales copy', 'Product descriptions', 'Email campaigns', 'Landing pages'],
        color: 'green'
    },
    {
        id: 'technical',
        name: 'Technical',
        description: 'Clear, precise documentation for technical audiences',
        icon: FaCode,
        tone: 'formal',
        characteristics: ['Step-by-step instructions', 'Precise terminology', 'Logical structure', 'Examples and code'],
        examples: ['API documentation', 'User manuals', 'Technical tutorials', 'System specifications'],
        color: 'indigo'
    },
    {
        id: 'journalistic',
        name: 'Journalistic',
        description: 'Objective, fact-based reporting style',
        icon: FaNewspaper,
        tone: 'professional',
        characteristics: ['Inverted pyramid structure', 'Objective tone', 'Fact-based', 'Clear attribution'],
        examples: ['News articles', 'Press releases', 'Investigative reports', 'Interviews'],
        color: 'red'
    }
];

interface WritingStylePresetsProps {
    selectedStyle?: string;
    onStyleSelect: (style: WritingStyle) => void;
    className?: string;
    showDetails?: boolean;
}

export default function WritingStylePresets({
    selectedStyle,
    onStyleSelect,
    className = '',
    showDetails = false
}: WritingStylePresetsProps) {

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {WRITING_STYLES.map(style => {
                    const IconComponent = style.icon;
                    const isSelected = selectedStyle === style.id;

                    return (
                        <Tooltip
                            key={style.id}
                            content={style.description}
                            placement="top"
                        >
                            <div
                                className={`
                                    border rounded-lg p-3 cursor-pointer transition-all duration-200
                                    ${isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }
                                `}
                                onClick={() => onStyleSelect(style)}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    <span className={`font-medium text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                        }`}>
                                        {style.name}
                                    </span>
                                </div>

                                {showDetails && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {style.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1">
                                            <Badge color={style.color as 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo'} size="xs">
                                                {style.tone}
                                            </Badge>
                                        </div>

                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            <div className="font-medium mb-1">Good for:</div>
                                            <ul className="list-disc list-inside space-y-0">
                                                {style.examples.slice(0, 2).map((example, index) => (
                                                    <li key={index}>{example}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Tooltip>
                    );
                })}
            </div>

            {selectedStyle && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                            Selected: {WRITING_STYLES.find(s => s.id === selectedStyle)?.name}
                        </span>
                        <Badge color="blue" size="xs">
                            {WRITING_STYLES.find(s => s.id === selectedStyle)?.tone}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Characteristics:
                            </div>
                            <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                                {WRITING_STYLES.find(s => s.id === selectedStyle)?.characteristics.map((char, index) => (
                                    <li key={index}>{char}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                                Best for:
                            </div>
                            <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1">
                                {WRITING_STYLES.find(s => s.id === selectedStyle)?.examples.map((example, index) => (
                                    <li key={index}>{example}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
