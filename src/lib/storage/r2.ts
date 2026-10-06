import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { PRESIGNED_URL_EXPIRY_SECONDS } from "./constants";
import { STORAGE_ERRORS } from "./errors";

/**
 * Cloudflare R2 (S3-compatible). The bucket is private: browsers only ever
 * get short-lived presigned URLs, and file bytes never pass through Next.js.
 * Server-only — never import this from a client component.
 */

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("File storage is not configured");
  }

  return { accountId, accessKeyId, secretAccessKey, bucket };
}

let cached: { client: S3Client; bucket: string } | null = null;

// Created lazily so builds and pages that never touch storage don't need
// the R2 env vars.
function getR2() {
  if (!cached) {
    const config = getR2Config();

    cached = {
      bucket: config.bucket,
      client: new S3Client({
        region: "auto",
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
        // Newer AWS SDKs add CRC32 checksum params to every request by
        // default; on a presigned PUT that checksum is computed for an empty
        // body, so R2 rejects the real upload. Only send checksums when an
        // operation actually requires them (Cloudflare's recommended setting).
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      }),
    };
  }

  return cached;
}

/**
 * Presigned PUT. Content-Type and Content-Length are part of the signature,
 * so the browser must upload exactly the declared type and size.
 */
export async function createUploadUrl({
  key,
  contentType,
  size,
}: {
  key: string;
  contentType: string;
  size: number;
}) {
  const { client, bucket } = getR2();

  return getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    },
  );
}

/** Presigned GET that downloads under the original file name. */
export async function createDownloadUrl({
  key,
  filename,
  contentType,
}: {
  key: string;
  filename: string;
  contentType: string;
}) {
  const { client, bucket } = getR2();

  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: contentDisposition(filename),
      ResponseContentType: contentType,
    }),
    { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS },
  );
}

/** Size and type of an uploaded object, or null if it doesn't exist. */
export async function headObject(key: string) {
  const { client, bucket } = getR2();

  try {
    const result = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );

    return {
      size: result.ContentLength ?? 0,
      contentType: result.ContentType ?? "",
    };
  } catch (error) {
    if (httpStatus(error) === 404) {
      return null;
    }

    throw storageError("HeadObject", key, error);
  }
}

export async function deleteObject(key: string) {
  const { client, bucket } = getR2();

  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    throw storageError("DeleteObject", key, error);
  }
}

function httpStatus(error: unknown) {
  return (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode;
}

/**
 * Log the real cause server-side and return a user-facing error. R2 answers
 * 401/403 when the token lacks permission (or an IP allowlist blocks the
 * caller); the SDK surfaces that as an unhelpful "UnknownError".
 */
function storageError(operation: string, key: string, error: unknown) {
  const status = httpStatus(error);

  console.error(
    `[r2] ${operation} failed for ${key} (HTTP ${status ?? "n/a"}):`,
    error,
  );

  return new Error(
    status === 401 || status === 403
      ? STORAGE_ERRORS.denied
      : STORAGE_ERRORS.unavailable,
  );
}

function contentDisposition(filename: string) {
  // ASCII fallback plus RFC 5987 UTF-8 name for non-ASCII file names.
  const fallback = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");

  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
