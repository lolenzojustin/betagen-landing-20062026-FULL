export const IMAGE_UPLOAD_ACCEPT =
  ".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/jpg,image/pjpeg,image/png,image/webp";

const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".jfif", ".png", ".webp"];

export function isAcceptedImageUpload(file: Pick<File, "name" | "type">) {
  const fileType = file.type.toLowerCase();

  if (fileType.startsWith("image/")) {
    return true;
  }

  const fileName = file.name.toLowerCase();

  return ACCEPTED_IMAGE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );
}

export function normalizeImageUploadFile(file: File) {
  const fileName = file.name.toLowerCase();
  const shouldNormalizeToJpg =
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".jfif") ||
    file.type.toLowerCase() === "image/pjpeg";

  if (!shouldNormalizeToJpg) {
    return file;
  }

  const normalizedName =
    file.name.replace(/(\.(?:jpeg|jfif))+$/i, "") || "upload";

  return new File([file], `${normalizedName}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
