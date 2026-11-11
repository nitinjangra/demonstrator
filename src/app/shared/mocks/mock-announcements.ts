import { Announcements } from '../interfaces/announcement.interface';

const announcementStart = new Date();
const announcementEnd = new Date(announcementStart);
announcementEnd.setDate(announcementEnd.getDate() + 7);

export const mockAnnouncements: Announcements = [
  {
    title: '💪Enhancements to table functionality',
    description:
      'we are excited to announce that we have made some enhancements to the table functionality in our application. These improvements include better sorting and filtering options, as well as improved performance when working with large datasets. We hope that these enhancements will make it easier for you to manage and analyze your data effectively.',
    startDate: new Date(announcementStart),
    endDate: new Date(announcementEnd),
    id: 'mock-announcement-1',
    status: 'Published',
  },
  {
    title: '🚀 Release 2026.2',
    description:
      'We have made huge changes in this release. For more details, please check the release notes.',
    startDate: new Date(announcementStart),
    endDate: new Date(announcementEnd),
    linkUrl: 'https://www.postman.com/release-notes/postman-app/#12-14-3',
    id: 'mock-announcement-2',
    status: 'Published',
  },
  {
    title: '📢 New Announcement related to downtime',
    description:
      'We will be performing scheduled maintenance on our servers this weekend. During this time, the application may be unavailable. We apologize for any inconvenience this may cause.',
    startDate: new Date(announcementStart),
    endDate: new Date(announcementEnd),
    id: 'mock-announcement-3',
    status: 'Published',
  },
  {
    title: ' 🛠️ Scheduled Maintenance',
    description:
      'We will be performing scheduled maintenance on our servers this weekend. During this time, the application may be unavailable. We apologize for any inconvenience this may cause.',
    startDate: undefined,
    endDate: undefined,
    id: 'mock-announcement-4',
    status: 'Published',
  },
];
