"use client";

import { useRef, useState } from "react";
import Image from "next/image";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (file.type && !file.type.startsWith("image/")) return;

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

  const handleBoxClick = () => fileInputRef.current?.click();

  return (
    <div
      className={`
        relative cursor-pointer overflow-hidden rounded-2xl
        transition-all duration-200
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
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
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
          src={templateVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
