"use client";

import { useMutation } from "@tanstack/react-query";

import { learnerLessonApi } from "@/Services/learner-lesson.service";

/**
 * Fetch a short-lived signed URL and start the download. The URL responds
 * with `Content-Disposition: attachment`, so the page stays where it is.
 */
export function useAttachmentDownload() {
  return useMutation({
    mutationFn: (attachmentId: string) =>
      learnerLessonApi.getAttachmentDownloadUrl(attachmentId),

    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}
