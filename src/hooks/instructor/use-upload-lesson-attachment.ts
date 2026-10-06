import { useMutation } from "@tanstack/react-query";

import {
  getAttachmentMimeType,
  type AttachmentMimeType,
} from "@/lib/storage/constants";
import {
  lessonApi,
  type LessonAttachmentInput,
} from "@/Services/lesson.service";

type UploadVariables = {
  courseId: string;
  lessonId?: string;
  file: File;
  /** 0–100 while the file is being sent to R2. */
  onProgress?: (percent: number) => void;
};

/**
 * PUT the file straight to the presigned R2 URL. Deliberately not the Axios
 * `/api` instance: no base URL, no cookies, no app headers — R2 only accepts
 * the exact Content-Type (and size) the URL was signed for. XHR is used for
 * upload progress events.
 */
function putToR2(
  uploadUrl: string,
  file: File,
  contentType: AttachmentMimeType,
  onProgress?: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(file);
  });
}

/**
 * Upload one lesson attachment: get a presigned URL, PUT the file to R2,
 * and resolve with the descriptor to include when the lesson is saved.
 */
export function useUploadLessonAttachment() {
  return useMutation({
    mutationFn: async ({
      courseId,
      lessonId,
      file,
      onProgress,
    }: UploadVariables): Promise<LessonAttachmentInput> => {
      const mimeType = getAttachmentMimeType(file.name);

      if (!mimeType) {
        throw new Error("Only PDF, DOC, DOCX and TXT files are allowed");
      }

      const { uploadUrl, key } = await lessonApi.createAttachmentUploadUrl(
        courseId,
        { filename: file.name, contentType: mimeType, size: file.size, lessonId },
      );

      await putToR2(uploadUrl, file, mimeType, onProgress);

      return { key, originalName: file.name, mimeType, size: file.size };
    },
  });
}
