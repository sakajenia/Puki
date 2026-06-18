import { supabase } from "./supabase";
import { VIDEO_BUCKET } from "./constants";

/**
 * Upload a locally-recorded (or picked) video to the private cleaning-videos
 * bucket and return the storage path. Uses fetch().arrayBuffer(), the approach
 * Supabase recommends for Expo/React Native (Blob uploads can land as 0 bytes).
 */
export async function uploadAreaVideo(
  jobId: string,
  areaId: string,
  localUri: string
): Promise<string> {
  const arrayBuffer = await (await fetch(localUri)).arrayBuffer();
  const path = `jobs/${jobId}/${areaId}.mp4`;

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: "video/mp4",
      upsert: true, // allow re-recording an area
    });
  if (error) throw error;

  return path;
}

/** Create a short-lived signed URL so the owner can play a private clip. */
export async function getSignedVideoUrl(
  path: string,
  expiresInSeconds = 60 * 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) {
    console.warn("[Puki] Failed to sign video url:", error.message);
    return null;
  }
  return data.signedUrl;
}
