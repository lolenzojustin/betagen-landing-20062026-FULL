export const IMAGE_UPLOAD_ACCEPT =
  ".jpg,.jpeg,.jfif,.png,.webp,.heic,.heif,image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/heic,image/heif";

const ACCEPTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".webp",
  ".heic",
  ".heif",
];
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const OUTPUT_IMAGE_TYPE = "image/jpeg";
const OUTPUT_IMAGE_QUALITY = 0.86;
const MIN_OUTPUT_IMAGE_QUALITY = 0.68;
const MAX_IMAGE_DIMENSION = 1920;
const MAX_NORMALIZED_IMAGE_BYTES = 3.6 * 1024 * 1024;

export function isAcceptedImageUpload(file: Pick<File, "name" | "type">) {
  const fileType = file.type.toLowerCase();

  if (ACCEPTED_IMAGE_TYPES.has(fileType)) {
    return true;
  }

  const fileName = file.name.toLowerCase();

  return ACCEPTED_IMAGE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );
}

export function getImageUploadValidationError(file: Pick<File, "name" | "type">) {
  if (isAcceptedImageUpload(file)) {
    return null;
  }

  return "Ảnh chưa đúng định dạng. Vui lòng chọn ảnh JPG, PNG, WEBP hoặc ảnh chụp từ điện thoại.";
}

function getOutputFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "") || "betagen-upload";

  return `${baseName}.jpg`;
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(
        new Error(
          "Không đọc được ảnh. Vui lòng đổi ảnh sang JPG/PNG rõ nét rồi thử lại."
        )
      );
    };

    image.src = imageUrl;
  });
}

function getNormalizedSize(width: number, height: number) {
  const longestSide = Math.max(width, height);

  if (longestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / longestSide;

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Không thể xử lý ảnh. Vui lòng thử ảnh khác."));
      },
      OUTPUT_IMAGE_TYPE,
      quality
    );
  });
}

export async function normalizeImageForUpload(file: File) {
  const image = await loadImageFromFile(file);
  let size = getNormalizedSize(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh. Vui lòng thử lại.");
  }

  const drawImageToCanvas = () => {
    canvas.width = size.width;
    canvas.height = size.height;
    context.drawImage(image, 0, 0, size.width, size.height);
  };

  let quality = OUTPUT_IMAGE_QUALITY;
  drawImageToCanvas();
  let blob = await canvasToBlob(canvas, quality);

  while (
    blob.size > MAX_NORMALIZED_IMAGE_BYTES &&
    quality > MIN_OUTPUT_IMAGE_QUALITY
  ) {
    quality = Math.max(MIN_OUTPUT_IMAGE_QUALITY, quality - 0.08);
    blob = await canvasToBlob(canvas, quality);
  }

  while (blob.size > MAX_NORMALIZED_IMAGE_BYTES && Math.max(size.width, size.height) > 1280) {
    size = {
      width: Math.round(size.width * 0.85),
      height: Math.round(size.height * 0.85),
    };
    quality = OUTPUT_IMAGE_QUALITY;
    drawImageToCanvas();
    blob = await canvasToBlob(canvas, quality);
  }

  return new File([blob], getOutputFileName(file.name), {
    type: OUTPUT_IMAGE_TYPE,
    lastModified: Date.now(),
  });
}
