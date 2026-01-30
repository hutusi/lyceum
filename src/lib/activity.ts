import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { userActivities } from "@/lib/db/schema";

export type ActivityType =
  | "course_enrolled"
  | "course_completed"
  | "lesson_completed"
  | "discussion_created"
  | "comment_added"
  | "project_submitted"
  | "project_approved"
  | "tool_published"
  | "review_added";

export type ResourceType =
  | "course"
  | "lesson"
  | "discussion"
  | "comment"
  | "project"
  | "tool"
  | "review"
  | "article";

interface TrackActivityParams {
  userId: string;
  type: ActivityType;
  resourceType?: ResourceType;
  resourceId?: string;
  resourceTitle?: string;
  metadata?: Record<string, unknown>;
}

export async function trackActivity({
  userId,
  type,
  resourceType,
  resourceId,
  resourceTitle,
  metadata,
}: TrackActivityParams) {
  try {
    await db.insert(userActivities).values({
      id: nanoid(),
      userId,
      type,
      resourceType,
      resourceId,
      resourceTitle,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    // Log but don't throw - activity tracking should not break the main flow
    console.error("Failed to track activity:", error);
  }
}
