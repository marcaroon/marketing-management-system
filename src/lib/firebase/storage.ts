import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";

export async function uploadFile(
  path: string,
  file: File
): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

export async function uploadEventDocumentation(
  eventId: string,
  file: File
): Promise<string> {
  const path = `events/${eventId}/docs/${Date.now()}_${file.name}`;
  return uploadFile(path, file);
}

export async function uploadProposal(
  prospectId: string,
  file: File
): Promise<string> {
  const path = `prospects/${prospectId}/proposals/${Date.now()}_${file.name}`;
  return uploadFile(path, file);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
