/** Default checklist an owner gets when creating a property/job. Editable per job. */
export const DEFAULT_AREAS = [
  "Entrance",
  "Living room",
  "Kitchen",
  "Bedroom 1",
  "Bedroom 2",
  "Bathroom",
  "Toilet",
  "Hallway",
];

/** Storage bucket that holds the cleaning clips (created by the SQL migration). */
export const VIDEO_BUCKET = "cleaning-videos";

/** Keep clips short so we stay inside the Supabase free-tier storage limit. */
export const MAX_CLIP_SECONDS = 30;
