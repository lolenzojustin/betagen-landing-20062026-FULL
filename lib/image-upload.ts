export const IMAGE_UPLOAD_ACCEPT =
  ".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/jpg,image/png,image/webp";

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
