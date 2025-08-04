"use client";

import { UserDto } from "@/dtos/UserDto";
import { ProfileEditInput, profileEditSchema } from "@/validations/profileEdit";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, TextInput, Button, Label } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaPencilAlt } from "react-icons/fa";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/imageCropper";
import RichTextEditor from "../richTextEditor/RichTextEditor";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiFetcher } from "@/utils/apiFetcher";

export default function EditProfileForm() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [showCropper, setShowCropper] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<ProfileEditInput>({
        resolver: zodResolver(profileEditSchema),
        defaultValues: {
            name: "",
            bio: "",
        }
    });

    // Avatar cropping states
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
    const [croppedAvatarFile, setCroppedAvatarFile] = useState<File | undefined>(undefined);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setValue("avatar", file);
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropSave = async () => {
        setShowCropper(false);
        if (!imageSrc || !croppedAreaPixels) return;

        // Get cropped image blob
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedBlob) {
            const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
            setCroppedAvatarFile(croppedFile);
            setValue("avatar", croppedFile);
            setAvatarPreview(URL.createObjectURL(croppedBlob));
        }
    };

    const onSubmit = async (formData: ProfileEditInput) => {
        if (isSubmitting) return;

        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("bio", formData.bio || "");
            submitData.append("uploadedFileIds", JSON.stringify(uploadedFileIds));
            if (croppedAvatarFile) {
                submitData.append("avatar", croppedAvatarFile);
            }

            const response = await fetch(API_ROUTES.USERS.UPDATE(session!.user.id), {
                method: 'PUT',
                body: submitData,
            }) as any;

            const data = await response.json();

            if (data.user) {
                setSuccessMessage("Profile updated successfully!");

                await update({
                    user: {
                        name: data.user.name,
                        avatar: data.user.avatar,
                    },
                });

                router.refresh();
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            if (session?.user) {
                const user = await apiFetcher<UserDto>(API_ROUTES.USERS.SHOW(session.user.id));
                setValue("name", user.name || "");
                setValue("bio", user.bio || "");
                setAvatarPreview(user.avatar);
            }
            setIsLoading(false);
        };
        fetchUser();
    }, [session, setValue]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] w-full">
            {isLoading ? (
                <div role="status" className="w-full p-4 border border-gray-200 rounded-sm shadow-sm animate-pulse md:p-6 dark:border-gray-700 items-center">
                    <div className="flex items-center justify-center mt-4">
                        <svg className="w-36 h-36 me-3 text-gray-200 dark:text-gray-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                        </svg>
                    </div>

                    <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                    <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>

                    <span className="sr-only">Loading...</span>
                </div>

            ) : (
                <div className="w-full">
                    {successMessage && (
                        <Alert color="success">
                            <span className="font-medium">Success!</span> {successMessage}
                        </Alert>
                    )}
                    {errorMessage && (
                        <Alert color="failure">
                            <span className="font-medium">Error!</span> {errorMessage}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative inline-flex items-center justify-center w-36 h-36 bg-gray-100 rounded-full dark:bg-gray-600">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="font-medium text-gray-600 dark:text-gray-300 text-8xl">
                                        {watch("name") ? watch("name")[0].toUpperCase() : "U"}
                                    </span>
                                )}
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
                            {errors.avatar && (
                                <p className="text-red-600 text-sm mt-1">{errors.avatar.message}</p>
                            )}
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
                                            <Button color="blue" onClick={handleCropSave}>Save</Button>
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
                                {...register("name")}
                                placeholder="Your Name"
                                required
                                disabled={isSubmitting}
                                color={errors.name ? "failure" : "gray"}
                            />
                            {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
                        </div>

                        {/* Bio */}
                        <div>
                            <Label htmlFor="bio" className="mb-2 block">Bio</Label>
                            <Controller
                                name="bio"
                                control={control}
                                render={({ field }) => (
                                    <RichTextEditor
                                        content={field.value || ''}
                                        onContentChange={field.onChange}
                                        hasError={!!errors.bio}
                                        onImageUpload={fileId => setUploadedFileIds(ids => [...ids, fileId])}
                                    />
                                )}
                            />
                            {errors.bio && <span className="text-red-600 text-sm">{errors.bio.message}</span>}
                        </div>

                        <Button type="submit" color="blue" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );

}
