/**
 * Announcement model used across the application.
 */
export interface Announcement {
  id: string;
  title: string;
  status: AnnouncementStatus;
  description?: string;
  imageUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  linkUrl?: string;
  startDate?: Date;
  endDate?: Date;
}

export type AnnouncementStatus = 'Published' | 'Scheduled' | 'Draft' | 'Expired';

export type Announcements = Announcement[];
