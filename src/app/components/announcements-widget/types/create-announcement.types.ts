import { Announcement } from '../../../shared/interfaces/announcement.interface';

export type CreateAnnouncementResult = Pick<
  Announcement,
  'title' | 'description' | 'linkUrl' | 'startDate' | 'endDate' | 'status'
> & { attachment?: File; removeAttachment?: boolean; intent?: 'draft' | 'publish' };

export interface AnnouncementEditorData {
  mode: 'create' | 'edit';
  announcement?: Announcement;
}
