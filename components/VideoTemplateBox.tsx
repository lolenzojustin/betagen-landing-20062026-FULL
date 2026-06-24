"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  IMAGE_UPLOAD_ACCEPT,
  isAcceptedImageUpload,
} from "@/lib/image-upload";

interface VideoTemplateBoxProps {
  templateVideoUrl: string;
  onFileSelected: (file: File) => void;
  previewUrl?: string | null;
}

export default function VideoTemplateBox({
  templateVideoUrl,
  onFileSelected,
  previewUrl,
}: VideoTemplateBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [activatedVideoUrl, setActivatedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasActivatedVideo = !previewUrl && activatedVideoUrl === templateVideoUrl;

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!isAcceptedImageUpload(file)) return;

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = "";
  };

  const activateVideoWithSound = async () => {
    const video = videoRef.current;
    if (!video || hasActivatedVideo) return;

    video.muted = false;
    video.volume = 1;
    setActivatedVideoUrl(templateVideoUrl);

    try {
      await video.play();
    } catch {
      video.muted = true;
      setActivatedVideoUrl(null);
    }
  };

  const handleBoxClick = () => {
    if (previewUrl) {
      fileInputRef.current?.click();
      return;
    }

    void activateVideoWithSound();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleBoxClick();
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        transition-all duration-200
        ${!previewUrl && hasActivatedVideo ? "cursor-default" : "cursor-pointer"}
        ${isDragging ? "scale-[1.02] border-[#EA0029]" : ""}
      `}
      style={{
        width: "100%",
        aspectRatio: "16/9",
        backgroundColor: "#7DD2F1",
        border: "none",
        borderRadius: "22px",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleBoxClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={previewUrl ? "Chọn lại hình ảnh" : "Phát video có âm thanh"}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        onChange={handleChange}
      />

      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Preview"
          fill
          sizes="637px"
          unoptimized
          className="object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          src={templateVideoUrl}
          autoPlay
          loop
          muted={!hasActivatedVideo}
          playsInline
          controls={hasActivatedVideo}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
