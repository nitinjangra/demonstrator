import { Announcement } from '../../../shared/interfaces/announcement.interface';

export type CreateAnnouncementResult = Pick<
  Announcement,
  'title' | 'description' | 'linkUrl' | 'startDate' | 'endDate'
> & { attachment?: File };
