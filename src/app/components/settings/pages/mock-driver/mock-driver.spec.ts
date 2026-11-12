import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockActionDataService } from '../../../actions-table-wrapper/shared/services/mock-action-data.service';
import { AgTableStateService } from '../../../actions-table-wrapper/shared/services/ag-table-state.service';
import { AnnouncementsActionService } from '../../../announcements-widget/services/announcements-action.service';
import { mockTableData } from '../../../actions-table-wrapper/shared/mock/actions-table.mock';
import { mockDriverAnnouncements } from '../../../../shared/mocks/mock-driver-announcements';
import { of } from 'rxjs';
import { MockDriver } from './mock-driver';

describe('MockDriver', () => {
  let fixture: ComponentFixture<MockDriver>;
  let mockData: jasmine.SpyObj<MockActionDataService>;
  let tableState: jasmine.SpyObj<AgTableStateService>;
  let announcements: jasmine.SpyObj<AnnouncementsActionService>;

  beforeEach(async () => {
    mockData = jasmine.createSpyObj<MockActionDataService>('MockActionDataService', ['getRows', 'saveRows']);
    mockData.getRows.and.returnValue(mockTableData);
    tableState = jasmine.createSpyObj<AgTableStateService>('AgTableStateService', ['getRowData', 'setRowData']);
    announcements = jasmine.createSpyObj<AnnouncementsActionService>('AnnouncementsActionService', [
      'getAnnouncements', 'getAllAnnouncements', 'saveAnnouncements', 'addAnnouncement', 'handleAnnouncementClick',
    ], { canAddAnnouncement: true });
    announcements.getAllAnnouncements.and.returnValue(of(mockDriverAnnouncements));
    await TestBed.configureTestingModule({
      imports: [MockDriver],
      providers: [
        provideRouter([]),
        { provide: MockActionDataService, useValue: mockData },
        { provide: AgTableStateService, useValue: tableState },
        { provide: AnnouncementsActionService, useValue: announcements },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MockDriver);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('mock-action-table-data');
    localStorage.removeItem('announcements');
  });

  it('applies an edited action dataset only to its in-memory preview', () => {
    localStorage.setItem('mock-action-table-data', '[{"id":999}]');
    localStorage.setItem('announcements', '[{"id":"existing"}]');
    const component = fixture.componentInstance;
    component.selectComponent({ target: { value: 'actions-table' } } as unknown as Event);
    component.onPayloadInput({
      target: { value: JSON.stringify([{ id: 1, entityName: 'Preview only', entityId: 'preview', dueDate: null }]) },
    } as unknown as Event);
    component.applyPayload();

    expect(component.actionRows().length).toBe(1);
    expect(component.statusMessage()).toContain('App data was not changed');
    expect(localStorage.getItem('mock-action-table-data')).toBe('[{"id":999}]');
    expect(localStorage.getItem('announcements')).toBe('[{"id":"existing"}]');
    expect(mockData.saveRows).not.toHaveBeenCalled();
    expect(tableState.setRowData).not.toHaveBeenCalled();
    expect(announcements.saveAnnouncements).not.toHaveBeenCalled();
  });

  it('handles component selection and protects dirty drafts when switching', () => {
    const component = fixture.componentInstance;
    const selection = { target: { value: 'actions-table' } } as unknown as Event;
    component.selectComponent(selection);
    expect(component.selectedComponent()).toBe('actions-table');
    expect(component.appliedState()).toBe('Project default');

    component.onPayloadInput({ target: { value: '[] ' } } as unknown as Event);
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    const rejectedSwitch = { target: { value: 'announcement-widget' } } as unknown as Event;
    component.selectComponent(rejectedSwitch);
    expect((rejectedSwitch.target as HTMLSelectElement).value).toBe('actions-table');
    expect(component.selectedComponent()).toBe('actions-table');

    confirm.and.returnValue(true);
    component.selectComponent({ target: { value: 'announcement-widget' } } as unknown as Event);
    expect(component.selectedComponent()).toBe('announcement-widget');
    expect(component.announcementItems().length).toBeGreaterThan(0);
    expect(component.announcementStatusCounts().Published).toBeGreaterThan(0);

    component.selectComponent({ target: { value: 'unknown' } } as unknown as Event);
    expect(component.selectedComponent()).toBeNull();
    expect(component.validationError()).toBe('Choose a component to edit its mock data.');
    expect(component.itemCount()).toBeNull();
  });

  it('loads scenarios for both components and clears the loading preview timer', fakeAsync(() => {
    const component = fixture.componentInstance;
    const confirm = spyOn(window, 'confirm').and.returnValue(true);
    component.selectedComponent.set('actions-table');
    const scenario = (value: string) => component.selectScenario({ target: { value } } as unknown as Event);

    scenario('');
    expect(component.statusMessage()).toBe('');
    scenario('default');
    scenario('empty');
    expect(component.actionRows()).toEqual([]);
    scenario('many');
    expect(component.actionRows().length).toBe(50);
    scenario('long-text');
    expect(component.actionRows()[0].entityName.length).toBeGreaterThan(100);
    scenario('error');
    expect(component.validationError()).toBe('Enter valid JSON containing an array.');
    scenario('loading');
    expect(component.isLoadingPreview()).toBeTrue();
    tick(1500);
    expect(component.isLoadingPreview()).toBeFalse();

    component.selectedComponent.set('announcement-widget');
    scenario('empty');
    expect(component.announcementItems()).toEqual([]);
    scenario('many');
    expect(component.announcementItems().length).toBe(50);
    scenario('long-text');
    expect(component.announcementItems()[0].description?.length).toBeGreaterThan(100);
    scenario('mixed-statuses');
    expect(component.announcementStatusCounts().Draft).toBeGreaterThan(0);
    expect(confirm).toHaveBeenCalled();
  }));

  it('loads defaults into drafts with reset confirmation and reports preview apply state', () => {
    const component = fixture.componentInstance;
    component.resetToDefault();
    expect(component.payload()).toBe('[]');

    component.selectedComponent.set('actions-table');
    component.appliedPayload.set('previous applied payload');
    component.payload.set('[{"id":7}]');
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    component.resetToDefault();
    expect(component.payload()).toBe('[{"id":7}]');
    confirm.and.returnValue(true);
    component.resetToDefault();
    expect(component.payload()).toBe(JSON.stringify(mockTableData, null, 2));
    expect(component.statusMessage()).toContain('Project default loaded into the draft');
    component.appliedPayload.set(component.payload());
    component.resetToDefault();
    expect(component.statusMessage()).toBe('Project default is already applied.');

    component.selectedComponent.set('announcement-widget');
    component.payload.set(JSON.stringify([{ id: 'custom', title: 'Custom', status: 'Published' }]));
    component.appliedPayload.set('');
    component.applyPayload();
    expect(component.appliedState()).toBe('Custom data applied');
    expect(component.statusMessage()).toBe('Applied to this preview. App data was not changed.');
    expect(announcements.saveAnnouncements).not.toHaveBeenCalled();
  });

  it('validates action row object, id, name, entity, date, and priority fields', () => {
    const component = fixture.componentInstance;
    component.selectedComponent.set('actions-table');
    const invalidPayloads = [
      ['must be an object', '[null]'],
      ['numeric id', '[{"id":"1","entityName":"A","entityId":"a","dueDate":null}]'],
      ['entityName', '[{"id":1,"entityName":" ","entityId":"a","dueDate":null}]'],
      ['entityId', '[{"id":1,"entityName":"A","entityId":" ","dueDate":null}]'],
      ['dueDate', '[{"id":1,"entityName":"A","entityId":"a","dueDate":"bad"}]'],
      ['priority', '[{"id":1,"entityName":"A","entityId":"a","dueDate":null,"priority":"Urgent"}]'],
    ];
    for (const [message, payload] of invalidPayloads) {
      component.payload.set(payload);
      expect(component.validationError()).toContain(message);
    }

    component.payload.set(JSON.stringify([
      { id: 1, entityName: 'No priority', entityId: 'none', dueDate: null },
      { id: 2, entityName: 'Valid priority', entityId: 'priority', dueDate: '2026-11-12', priority: 'High' },
    ]));
    expect(component.validationError()).toBeNull();
    expect(component.actionRows().length).toBe(2);
    expect(component.announcementItems()).toEqual([]);

    component.payload.set('{');
    expect(component.validationError()).toBe('Enter valid JSON containing an array.');
    component.payload.set('{}');
    expect(component.validationError()).toBe('The payload must be a JSON array.');
  });

  it('validates announcement fields, optional data, dates, and status counts', () => {
    const component = fixture.componentInstance;
    component.selectedComponent.set('announcement-widget');
    const invalidPayloads = [
      '[null]',
      '[{"id":" ","title":"Title","status":"Published"}]',
      '[{"id":"one","title":" ","status":"Published"}]',
      '[{"id":"one","title":"Title","status":"Unknown"}]',
      '[{"id":"one","title":"Title","status":"Published","description":7}]',
      '[{"id":"one","title":"Title","status":"Published","startDate":7}]',
      '[{"id":"one","title":"Title","status":"Published","endDate":"invalid"}]',
    ];
    for (const payload of invalidPayloads) {
      component.payload.set(payload);
      expect(component.validationError()).toBeTruthy();
    }

    component.payload.set(JSON.stringify([
      { id: 'one', title: 'One', status: 'Published', description: 'Text', imageUrl: '', attachmentUrl: '', attachmentName: '', linkUrl: '', startDate: null, endDate: null },
      { id: 'two', title: 'Two', status: 'Scheduled', startDate: '2026-11-13' },
      { id: 'three', title: 'Three', status: 'Draft', endDate: '2026-11-14' },
      { id: 'four', title: 'Four', status: 'Expired' },
    ]));
    expect(component.validationError()).toBeNull();
    expect(component.itemCount()).toBe(4);
    expect(component.announcementStatusCounts()).toEqual({ Published: 1, Scheduled: 1, Draft: 1, Expired: 1 });
    expect(component.actionRows()).toEqual([]);
  });
});
