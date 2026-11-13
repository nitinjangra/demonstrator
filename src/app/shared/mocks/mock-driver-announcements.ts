import type { Announcement } from '../interfaces/announcement.interface';

const today = new Date();
const inDays = (days: number): Date => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

export const mockDriverAnnouncements: Announcement[] = [
  {
    id: 'mock-announcement-published',
    title: 'Product update',
    status: 'Published',
    description:
      'A published announcement without date restrictions for the homepage widget preview.',
  },
  {
    id: 'mock-announcement-scheduled',
    title: 'Scheduled maintenance window',
    status: 'Scheduled',
    description:
      'Maintenance is planned for next week. This item starts in seven days and ends two days later.',
    startDate: inDays(7),
    endDate: inDays(9),
  },
  {
    id: 'mock-announcement-draft',
    title: 'Draft announcement with no emoji',
    status: 'Draft',
  },
  {
    id: 'mock-announcement-expired',
    title: 'Expired announcement',
    status: 'Expired',
    description: 'This item ended yesterday and is included to test status handling.',
    startDate: inDays(-8),
    endDate: inDays(-1),
  },
  {
    id: 'mock-announcement-long-title',
    title: `A deliberately long announcement title for testing wrapping and narrow layouts ${'across different screen sizes '.repeat(3)}`,
    status: 'Published',
    imageUrl: 'https://placehold.co/640x360/png',
    attachmentUrl: 'https://example.com/announcement-brief.pdf',
    attachmentName: 'announcement-brief.pdf',
    linkUrl: 'https://example.invalid/preview-link',
  },
  {
    id: 'mock-announcement-rtl',
    title: '\u062a\u062d\u062f\u064a\u062b \u0647\u0627\u0645 \u0644\u0644\u062e\u062f\u0645\u0629',
    status: 'Published',
    description:
      '\u0646\u0635 \u062a\u062c\u0631\u064a\u0628\u064a \u0644\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0639\u0631\u0636 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0645\u0646 \u0627\u0644\u064a\u0645\u064a\u0646 \u0625\u0644\u0649 \u0627\u0644\u064a\u0633\u0627\u0631.',
  },
];
