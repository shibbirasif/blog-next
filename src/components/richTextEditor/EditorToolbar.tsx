'use client'

import { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import {
    Button,
    Tooltip,
    Modal,
    TextInput,
    Dropdown,
    DropdownItem,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'flowbite-react';
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaImage,
    FaVideo,
    FaSmile,
    FaHeading
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';


const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type Props = {
    editor: Editor | null;
}

export default function EditorToolbar({ editor }: Props) {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [emojiTheme, setEmojiTheme] = useState<Theme>(Theme.AUTO)

    const insertImage = () => {
        if (imageUrl) {
            editor?.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setImageModalOpen(false);
        }
    }

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

                <div className='relative'>
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
            <Modal show={imageModalOpen} onClose={() => setImageModalOpen(false)}>
                <ModalHeader>Insert Image</ModalHeader>
                <ModalBody>
                    <TextInput
                        id="image-url"
                        placeholder="Enter image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={insertImage}>Insert</Button>
                    <Button color="gray" onClick={() => setImageModalOpen(false)}>Cancel</Button>
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
