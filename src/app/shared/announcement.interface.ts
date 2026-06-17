/**
 * This file defines the Announcement interface, which represents an announcement in the application. An announcement has an id, title, description, optional imageUrl, startDate, and endDate.
 * This interface can be used to type-check announcement objects throughout the application, ensuring that they have the correct structure and properties.
 */
interface AnnouncementDetail {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  startDate?: Date;
  endDate?: Date;
}

export type Announcements = Announcement[];
export type Announcement = AnnouncementDetail;
