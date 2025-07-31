"use client";

import { useState, useRef } from "react";
import { H1 } from '@/components/ui/Headers';
import { Button, Label, TextInput } from 'flowbite-react';
import RichTextEditor from '@/components/richTextEditor/RichTextEditor';
import Cropper from 'react-easy-crop';
import { FaPencilAlt } from "react-icons/fa";

export default function AboutMePage() {
    // Example initial values, replace with actual user data from props or context
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    // You need a function to get the cropped image from the cropper (see react-easy-crop docs for getCroppedImg)
    // For brevity, this is omitted here.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            // TODO: Implement API call to update user info
            setSuccessMessage("Profile updated successfully!");
        } catch (error) {
            setErrorMessage("Failed to update profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <H1 className='text-center mb-6'>About Me</H1>
            {/* Success/Error Messages */}
            {successMessage && (
                <div className="text-green-600 text-sm">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                    <div className="relative inline-flex items-center justify-center w-36 h-36 bg-gray-100 rounded-full dark:bg-gray-600">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-medium text-gray-600 dark:text-gray-300 text-8xl">
                                {name ? name[0].toUpperCase() : "U"}
                            </span>
                        )}
                        {/* Pencil icon overlay */}
                        <label className="absolute top-2 right-2 rounded-full p-2 shadow cursor-pointer focus:outline-none focus:ring-4 bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <FaPencilAlt className="text-gray-100" />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>
                    {/* Cropper Modal */}
                    {showCropper && imageSrc && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-4 rounded shadow-lg">
                                <div className="relative w-72 h-72">
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        cropShape="round"
                                        showGrid={false}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={onCropComplete}
                                    />
                                </div>
                                <div className="flex justify-between mt-4">
                                    <Button color="gray" onClick={() => setShowCropper(false)}>Cancel</Button>
                                    <Button color="blue" onClick={() => {
                                        // TODO: Get cropped image and setAvatar
                                        setShowCropper(false);
                                    }}>Save</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Name */}
                <div>
                    <Label htmlFor="name" className="mb-2 block">Name</Label>
                    <TextInput
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your Name"
                        required
                        disabled={isSubmitting}
                        color="gray"
                    />
                </div>

                {/* Bio (RichTextEditor) */}
                <div>
                    <Label htmlFor="bio" className="mb-2 block">Bio</Label>
                    <RichTextEditor
                        content={bio}
                        onContentChange={setBio}
                        editable={!isSubmitting}
                        hasError={false}
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" color="blue" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </div>
    );
}
