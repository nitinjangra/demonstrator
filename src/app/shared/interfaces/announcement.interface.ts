/**
 * Announcement model used across the application.
 */
export interface Announcement {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  linkUrl?: string;
  startDate?: Date;
  endDate?: Date;
}

export type Announcements = Announcement[];
