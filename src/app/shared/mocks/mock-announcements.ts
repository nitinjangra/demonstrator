import { Announcements } from '../announcement.interface';

export const mockAnnouncements: Announcements = [
  {
    title: '💪Enhancements to table functionality',
    description:
      'we are excited to announce that we have made some enhancements to the table functionality in our application. These improvements include better sorting and filtering options, as well as improved performance when working with large datasets. We hope that these enhancements will make it easier for you to manage and analyze your data effectively.',
    startDate: new Date(),
    endDate: new Date(),
    id: '1',
  },
  {
    title: '🚀 Release 2026.2',
    description:
      'We have made huge changes in this release. For more details, please check the release notes.',
    startDate: new Date(),
    endDate: new Date(),
    linkUrl: 'https://www.postman.com/release-notes/postman-app/#12-14-3',
    id: '2',
  },
  {
    title: '📢 New Announcement related to downtime',
    description:
      'We will be performing scheduled maintenance on our servers this weekend. During this time, the application may be unavailable. We apologize for any inconvenience this may cause.',
    startDate: new Date(),
    endDate: new Date(),
    id: '3',
  },
];
