import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

function validateFile(
  file: File,
  allowedCategories: (keyof typeof ALLOWED_FILE_TYPES)[] = ["document", "image"]
): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(
      `Ukuran file terlalu besar. Maksimum ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    );
  }

  const allowedTypes = allowedCategories.flatMap(
    (cat) => ALLOWED_FILE_TYPES[cat] || []
  );

  if (!allowedTypes.includes(file.type)) {
    throw new FileValidationError(
      "Tipe file tidak didukung. Gunakan PDF, DOC, XLS, PPT, atau gambar (JPG, PNG, WebP)."
    );
  }
}

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  validateFile(file);
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

export async function uploadEventDocumentation(
  eventId: string,
  file: File
): Promise<string> {
  validateFile(file, ["document", "image"]);
  const path = `events/${eventId}/docs/${Date.now()}_${file.name}`;
  return uploadFile(path, file);
}

export async function uploadProposal(
  prospectId: string,
  file: File
): Promise<string> {
  validateFile(file, ["document"]);
  const path = `prospects/${prospectId}/proposals/${Date.now()}_${file.name}`;
  return uploadFile(path, file);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
