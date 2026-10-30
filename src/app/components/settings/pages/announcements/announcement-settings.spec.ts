import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AnnouncementSettings } from './announcement-settings';
import { AnnouncementsActionService } from '../../../announcements-widget/services/announcements-action.service';
import type { Announcement } from '../../../../shared/interfaces/announcement.interface';
import type { CreateAnnouncementResult } from '../../../announcements-widget/types/create-announcement.types';

describe('AnnouncementSettings', () => {
  let fixture: ComponentFixture<AnnouncementSettings>;
  let announcementsService: jasmine.SpyObj<AnnouncementsActionService>;
  const announcements: Announcement[] = [
    { id: 'draft', title: 'Draft announcement', status: 'Draft' },
    { id: 'expired', title: 'Expired announcement', status: 'Expired', endDate: new Date(2020, 0, 1) },
    { id: 'scheduled', title: 'Scheduled announcement', status: 'Scheduled' },
  ];
  const activeAnnouncements: Announcement[] = [
    { id: 'active', title: 'Active announcement', status: 'Published' },
  ];

  beforeEach(async () => {
    announcementsService = jasmine.createSpyObj<AnnouncementsActionService>(
      'AnnouncementsActionService', [
        'getAllAnnouncements',
        'getAnnouncements',
        'saveAnnouncements',
        'addAnnouncement',
      ],
      { canAddAnnouncement: true },
    );
    announcementsService.addAnnouncement.and.returnValue(true);
    announcementsService.getAllAnnouncements.and.returnValue(of(announcements));
    announcementsService.getAnnouncements.and.returnValue(of(activeAnnouncements));
    await TestBed.configureTestingModule({
      imports: [AnnouncementSettings],
      providers: [
        provideRouter([]),
        { provide: AnnouncementsActionService, useValue: announcementsService },
      ],
    });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AnnouncementSettings);
    fixture.detectChanges();
  });

  it('renders the announcement settings heading', () => {
    const heading = fixture.nativeElement.querySelector('h2') as HTMLHeadingElement;

    expect(heading.textContent).toContain('Announcement settings');
    expect(heading.id).toBe('announcement-settings-title');
  });

  it('shows the homepage widget preview and keeps all statuses in the manager list', () => {
    fixture.componentInstance.announcements = [...announcements, ...activeAnnouncements];
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(fixture.nativeElement.querySelector('app-announcement-preview.preview-pane')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.list-pane')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.preview-pane app-announcements')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.preview-pane .announcements-list')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.preview-pane').textContent).toContain('Active announcement');
    expect(fixture.nativeElement.querySelector('.preview-pane').textContent).not.toContain('Draft announcement');
    expect(text).toContain('Draft announcement');
    expect(text).toContain('Expired announcement');
    expect(text).toContain('Draft');
    expect(text).toContain('Expired');
    expect(fixture.nativeElement.querySelector('.announcement-row .status-badge[data-status="Draft"]')?.textContent)
      .toContain('Draft');
    expect(fixture.nativeElement.querySelector('.announcement-row .status-badge[data-status="Expired"]')?.textContent)
      .toContain('Expired');
    expect(fixture.nativeElement.querySelector('.announcement-row .status-badge[data-status="Scheduled"]')?.textContent)
      .toContain('Scheduled');
    expect(fixture.nativeElement.querySelector('.announcement-state')).toBeNull();
    const editButton = fixture.nativeElement.querySelector('.announcement-edit') as HTMLButtonElement;
    expect(editButton.getAttribute('aria-label')).toBe('Edit Draft announcement');
    expect(editButton.querySelector('mat-icon')?.textContent).toContain('edit');
    expect(announcementsService.getAllAnnouncements).toHaveBeenCalledOnceWith();
    expect(announcementsService.getAnnouncements).not.toHaveBeenCalled();
    const page = fixture.nativeElement as HTMLElement;
    const saveButtons = Array.from(
      page.querySelectorAll<HTMLButtonElement>('.announcement-settings-page button'),
    ).filter((button) => button.textContent?.includes('Save'));
    expect(saveButtons.length).toBe(1);
    expect(page.querySelector('app-sticky-footer button')?.textContent).toContain('Save');
    expect(page.querySelector('app-sticky-footer .sticky-footer--fixed')).not.toBeNull();
  });

  it('reorders and deletes items locally, then saves the complete list', () => {
    const component = fixture.componentInstance;
    const saveButton = fixture.nativeElement.querySelector('app-sticky-footer button') as HTMLButtonElement;
    expect(saveButton.disabled).toBeTrue();

    component.moveAnnouncement(0, 1);
    component.deleteAnnouncement('scheduled');
    expect(component.hasUnsavedChanges).toBeTrue();
    fixture.detectChanges();
    expect(saveButton.disabled).toBeFalse();
    expect(component.announcements.map(({ id }) => id)).toEqual(['expired', 'draft']);
    expect(announcementsService.saveAnnouncements).not.toHaveBeenCalled();

    component.save();

    expect(announcementsService.saveAnnouncements).toHaveBeenCalledOnceWith([
      announcements[1], announcements[0],
    ]);
    expect(component.saved).toBeTrue();
    expect(component.hasUnsavedChanges).toBeFalse();
    fixture.detectChanges();
    expect(saveButton.disabled).toBeTrue();
  });

  it('counts every announcement toward the ten-item Add limit', () => {
    fixture.componentInstance.announcements = Array.from({ length: 10 }, (_, index) => ({
      id: `announcement-${index}`,
      title: `Announcement ${index}`,
      status: index % 2 === 0 ? 'Published' as const : 'Draft' as const,
      ...(index === 0 ? { endDate: new Date(2020, 0, 1) } : {}),
    }));
    fixture.componentInstance.deleteAnnouncement('missing');
    expect(fixture.componentInstance.canAddAnnouncement).toBeFalse();
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.announcement-add') as HTMLButtonElement;
    expect(addButton.disabled).toBeTrue();

    fixture.componentInstance.deleteAnnouncement('announcement-0');
    fixture.detectChanges();
    expect(addButton.disabled).toBeFalse();
  });

  it('opens the shared create form in the settings drawer and saves the new announcement', () => {
    const created: CreateAnnouncementResult = { title: 'Quick update', status: 'Published' };
    const addButton = fixture.nativeElement.querySelector('.announcement-add') as HTMLButtonElement;

    expect(addButton.disabled).toBeFalse();
    addButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.editorOpen).toBeTrue();
    expect(fixture.componentInstance.editorData?.mode).toBe('create');
    expect(fixture.nativeElement.querySelector('.announcement-settings-drawer app-create-announcement-dialog'))
      .not.toBeNull();

    fixture.componentInstance.saveAnnouncementFromEditor(created);
    expect(announcementsService.saveAnnouncements).toHaveBeenCalledOnceWith(announcements);
    expect(announcementsService.addAnnouncement).toHaveBeenCalledOnceWith(created);
  });

  it('loads the shared announcement form in drawer edit mode and applies its result locally', () => {
    const component = fixture.componentInstance;
    const result: CreateAnnouncementResult = { title: 'Updated announcement', status: 'Published' };
    component.openEditAnnouncement('draft');
    fixture.detectChanges();

    expect(component.editorOpen).toBeTrue();
    expect(component.editorData).toEqual({ mode: 'edit', announcement: announcements[0] });
    expect(fixture.nativeElement.querySelector('.announcement-settings-drawer app-create-announcement-dialog'))
      .not.toBeNull();
    component.saveAnnouncementFromEditor(result);
    expect(component.announcements[0]).toEqual(
      jasmine.objectContaining({ title: 'Updated announcement', status: 'Published' }),
    );
    expect(component.saved).toBeFalse();
    component.save();
    expect(announcementsService.saveAnnouncements).toHaveBeenCalledWith(component.announcements);
  });
});
