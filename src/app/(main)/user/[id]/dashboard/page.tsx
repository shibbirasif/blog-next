// Fix for SSR hydration mismatch
'use client';

import React, { useState } from 'react';
import RichTextEditor from '@/components/richTextEditor/RichTextEditor'; // Adjust the import path as per your project structure
import { Button, Label, TextInput, Alert, Spinner } from 'flowbite-react'; // Assuming Flowbite components

export default function CreateArticlePage() {
    const [title, setTitle] = useState('');
    // State to hold the HTML content from the editor
    // Initialize with an empty string for new articles, or loaded HTML for editing
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitSuccess(null);
        setSubmitError(null);
        setIsSubmitting(true);

        // Basic validation
        if (!title.trim()) {
            setSubmitError('Article title cannot be empty.');
            setIsSubmitting(false);
            return;
        }
        // Check if content is empty or just the default empty paragraph from TipTap
        if (!content.trim() || content === '<p></p>') {
            setSubmitError('Article content cannot be empty.');
            setIsSubmitting(false);
            return;
        }

        try {
            // In a real application, you would send this 'title' and 'content' (HTML string)
            // to your backend API route (e.g., /api/articles) to save the article.
            console.log('Submitting Article:', { title, content });

            // Simulate an API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Example: If API call was successful
            setSubmitSuccess('Article created successfully!');
            setTitle(''); // Clear the title input
            setContent(''); // Clear the editor content
        } catch (error) {
            console.error('Article submission error:', error);
            setSubmitError('Failed to create article. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Create New Article</h1>

                {submitSuccess && (
                    <Alert color="success" onDismiss={() => setSubmitSuccess(null)} className="mb-4">
                        <span className="font-bold">Success!</span> {submitSuccess}
                    </Alert>
                )}

                {submitError && (
                    <Alert color="failure" onDismiss={() => setSubmitError(null)} className="mb-4">
                        <span className="font-bold">Error!</span> {submitError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title">Article Title</Label>
                        </div>
                        <TextInput
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter article title"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="content">Article Content</Label>
                        </div>
                        {/* The RichTextEditor component */}
                        <RichTextEditor
                            content={content} // Pass the current content state
                            onContentChange={setContent} // Update content state when editor changes
                            editable={!isSubmitting} // Make editor non-editable during submission
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Spinner size="sm" light={true} className="mr-2" />
                                Submitting...
                            </>
                        ) : (
                            'Create Article'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}