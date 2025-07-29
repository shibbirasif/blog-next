'use client'

import { Editor } from '@tiptap/react';
import { useEffect, useState, useRef } from 'react';
import {
    Button,
    Tooltip,
    Modal,
    TextInput,
    Dropdown,
    DropdownItem,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Alert
} from 'flowbite-react';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaImage,
    FaVideo,
    FaSmile,
    FaHeading,
    FaUpload,
    FaLink
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';
import { ImageUploadHandler } from './ImageUploadHandler';


const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type Props = {
    editor: Editor | null;
    imageUploadConfig?: {
        uploadUrl: string;
    };
    onImageUpload?: (fileId: string) => void;
}

export default function EditorToolbar({ editor, imageUploadConfig, onImageUpload }: Props) {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [emojiTheme, setEmojiTheme] = useState<Theme>(Theme.AUTO);
    const [showEmoji, setShowEmoji] = useState(false);

    const insertImage = () => {
        if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setImageModalOpen(false);
            setUploadError(null);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Default altText to file name without extension
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setAltText(nameWithoutExt);

        setIsUploading(true);
        setUploadError(null);

        const validation = ImageUploadHandler.validateFile(file);
        if (!validation.valid) {
            setUploadError(validation.error || 'Invalid file');
            setIsUploading(false);
            return;
        }

        try {
            const uploadUrl = imageUploadConfig?.uploadUrl || '/api/articles/uploads';
            const result = await ImageUploadHandler.uploadToServer(file, uploadUrl, altText);
            if (result.success && result.src && result.uploadedFileId) {
                editor?.chain().focus().setImage({ src: result.src, alt: altText }).run();
                onImageUpload?.(result.uploadedFileId);
                setImageModalOpen(false);
                setUploadError(null);
                resetImageModal();
            } else {
                setUploadError(result.error || 'Upload failed');
            }
        } catch (error) {
            setUploadError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const resetImageModal = () => {
        setImageUrl('');
        setAltText('');
        setUploadError(null);
        setUploadMode('url');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const insertVideo = () => {
        if (videoUrl) {
            editor?.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
            setVideoUrl('');
            setVideoModalOpen(false);
        }
    }

    const setHeading = (level: 1 | 2 | 3 | 4) => {
        editor?.chain().focus().toggleHeading({ level }).run();
    }

    useEffect(() => {
        const checkTheme = () => {
            setEmojiTheme(document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT);
        }
        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            observer.disconnect();
        }
    }, []);

    if (!editor) {
        return null;
    }

    return (
        <>
            <div className="flex flex-wrap justify-center py-2 gap-2 items-center shadow-sm rounded-lg dark:bg-gray-700">
                <Tooltip content="Bold">
                    <Button size="xs" color="light" onClick={() => editor.chain().focus().toggleBold().run()}>
                        <FaBold />
                    </Button>
                </Tooltip>

                <Tooltip content="Italic">
                    <Button size="xs" color="light" onClick={() => editor.chain().focus().toggleItalic().run()}>
                        <FaItalic />
                    </Button>
                </Tooltip>

                <Tooltip content="Underline">
                    <Button size="xs" color="light" onClick={() => editor.chain().focus().toggleUnderline().run()}>
                        <FaUnderline />
                    </Button>
                </Tooltip>

                <Dropdown label={<FaHeading />} size="xs" color="light" dismissOnClick={true}>
                    <DropdownItem onClick={() => setHeading(1)}>Heading 1 (H1)</DropdownItem>
                    <DropdownItem onClick={() => setHeading(2)}>Heading 2 (H2)</DropdownItem>
                    <DropdownItem onClick={() => setHeading(3)}>Heading 3 (H3)</DropdownItem>
                    <DropdownItem onClick={() => setHeading(4)}>Heading 4 (H4)</DropdownItem>
                </Dropdown>

                <Tooltip content="Insert Image">
                    <Button size="xs" color="light" onClick={() => setImageModalOpen(true)}>
                        <FaImage />
                    </Button>
                </Tooltip>

                <Tooltip content="Embed Video">
                    <Button size="xs" color="light" onClick={() => setVideoModalOpen(true)}>
                        <FaVideo />
                    </Button>
                </Tooltip>

                {/* Emoji button now centered with others */}
                <div className="relative">
                    <Tooltip content="Emoji">
                        <Button size="xs" color="light" onClick={() => setShowEmoji((prev) => !prev)}>
                            <FaSmile />
                        </Button>
                    </Tooltip>

                    {showEmoji && (
                        <div className="z-10 mb-4 absolute top-9 right-0">
                            <EmojiPicker
                                onEmojiClick={(e) => {
                                    editor.chain().focus().insertContent(e.emoji).run()
                                    setShowEmoji(false)
                                }}
                                skinTonesDisabled={true}
                                theme={emojiTheme}
                            />
                        </div>
                    )}
                </div>
            </div>



            {/* Image Modal */}
            <Modal show={imageModalOpen} onClose={() => { setImageModalOpen(false); resetImageModal(); }}>
                <ModalHeader>Insert Image</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        {/* Upload Mode Toggle */}
                        <div className="flex gap-2 mb-4">
                            <Button
                                size="sm"
                                color={uploadMode === 'url' ? 'blue' : 'gray'}
                                onClick={() => setUploadMode('url')}
                            >
                                <FaLink className="mr-2" />
                                URL
                            </Button>
                            <Button
                                size="sm"
                                color={uploadMode === 'upload' ? 'blue' : 'gray'}
                                onClick={() => setUploadMode('upload')}
                            >
                                <FaUpload className="mr-2" />
                                Upload
                            </Button>
                        </div>

                        {/* Error Alert */}
                        {uploadError && (
                            <Alert color="failure" onDismiss={() => setUploadError(null)}>
                                {uploadError}
                            </Alert>
                        )}

                        {/* URL Input */}
                        {uploadMode === 'url' && (
                            <TextInput
                                id="image-url"
                                placeholder="Enter image URL (https://example.com/image.jpg)"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                disabled={isUploading}
                            />
                        )}

                        {/* File Upload */}
                        {uploadMode === 'upload' && (
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file && altText === '') {
                                            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                                            setAltText(nameWithoutExt);
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    disabled={isUploading}
                                />
                                <TextInput
                                    id="alt-text"
                                    placeholder="Image alt text"
                                    value={altText}
                                    onChange={e => setAltText(e.target.value)}
                                    className="mt-2"
                                    disabled={isUploading}
                                />
                                <Button
                                    color="blue"
                                    className="mt-2"
                                    onClick={async () => {
                                        if (!fileInputRef.current?.files?.[0]) return;
                                        await handleFileUpload({
                                            target: fileInputRef.current
                                        } as React.ChangeEvent<HTMLInputElement>);
                                    }}
                                    disabled={isUploading || !fileInputRef.current?.files?.[0]}
                                >
                                    Upload
                                </Button>
                                <p className="mt-2 text-sm text-gray-500">
                                    Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                                </p>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {isUploading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        onClick={insertImage}
                        disabled={isUploading || (uploadMode === 'url' && !imageUrl)}
                    >
                        Insert
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => { setImageModalOpen(false); resetImageModal(); }}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Video Modal */}
            <Modal show={videoModalOpen} onClose={() => setVideoModalOpen(false)}>
                <ModalHeader>Embed YouTube/Vimeo Video</ModalHeader>
                <ModalBody>
                    <TextInput
                        id="video-url"
                        placeholder="Enter video URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={insertVideo}>Embed</Button>
                    <Button color="gray" onClick={() => setVideoModalOpen(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};
