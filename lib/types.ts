export type Role = "owner" | "cleaner";

export type JobStatus =
  | "assigned"
  | "in_progress"
  | "submitted"
  | "approved"
  | "redo";

export type AreaStatus = "pending" | "done";

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  lang: string | null;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  property_id: string;
  owner_id: string;
  cleaner_id: string | null;
  status: JobStatus;
  created_at: string;
}

export interface JobArea {
  id: string;
  job_id: string;
  area_name: string;
  position: number;
  video_path: string | null;
  status: AreaStatus;
}

/** A job row joined with its property for list/detail screens. */
export interface JobWithProperty extends Job {
  property: Pick<Property, "id" | "name" | "address"> | null;
}
