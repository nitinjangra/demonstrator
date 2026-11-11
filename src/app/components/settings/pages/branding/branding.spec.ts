import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, of } from 'rxjs';
import type { Observable } from 'rxjs';
import { BrandingService } from '../../../../shared/services/branding.service';
import { UnsavedChangesDialogService } from '../../../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { Branding } from './branding';

describe('Branding', () => {
  let fixture: ComponentFixture<Branding>;
  let brandingSpy: jasmine.SpyObj<BrandingService>;
  let unsavedDialogSpy: jasmine.SpyObj<UnsavedChangesDialogService>;

  beforeEach(async () => {
    brandingSpy = jasmine.createSpyObj<BrandingService>(
      'BrandingService',
      ['setBrandName', 'setBrandMode', 'setBrandLogo', 'setBrandAltText'],
      {
        brandName: signal('Example app'),
        brandMode: signal('label'),
        brandLogo: signal(''),
        brandLogoName: signal(''),
        brandLogoSize: signal(0),
        brandAltText: signal(''),
      },
    );
    unsavedDialogSpy = jasmine.createSpyObj<UnsavedChangesDialogService>(
      'UnsavedChangesDialogService',
      ['confirmIfNeeded', 'warnBeforeUnload'],
    );
    unsavedDialogSpy.confirmIfNeeded.and.returnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [Branding],
      providers: [
        { provide: BrandingService, useValue: brandingSpy },
        { provide: UnsavedChangesDialogService, useValue: unsavedDialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Branding);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  it('renders the current application name', () => {
    expect(fixture.nativeElement.textContent).toContain('Header branding');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe(
      'Example app',
    );
  });

  it('saves the edited name through the branding service', () => {
    fixture.componentInstance.setDraftBrandName('New name');
    fixture.componentInstance.saveChanges();

    expect(brandingSpy.setBrandName).toHaveBeenCalledWith('New name');
    expect(brandingSpy.setBrandAltText).toHaveBeenCalledWith('');
  });

  it('starts clean and exposes dirty status and discard only after an edit', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Unsaved changes');
    expect(fixture.nativeElement.textContent).not.toContain('Discard changes');
    fixture.componentInstance.setDraftBrandName('Edited name');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unsaved changes');
    expect(fixture.nativeElement.textContent).toContain('Discard changes');
  });

  it('uses shared before-unload handling based on dirty state', () => {
    const event = { preventDefault: jasmine.createSpy('preventDefault') } as unknown as BeforeUnloadEvent;
    fixture.componentInstance.warnBeforeLeaving(event);
    expect(unsavedDialogSpy.warnBeforeUnload).toHaveBeenCalledWith(event, false);
    fixture.componentInstance.setDraftBrandName('Edited name');
    fixture.componentInstance.warnBeforeLeaving(event);
    expect(unsavedDialogSpy.warnBeforeUnload).toHaveBeenCalledWith(event, true);
  });

  it('keeps save enabled for retry after a save error', async () => {
    fixture.componentInstance.setDraftBrandName('Edited name');
    brandingSpy.setBrandName.and.throwError('save failed');
    await fixture.componentInstance.saveChanges();
    fixture.detectChanges();
    expect(fixture.componentInstance.saveState()).toBe('error');
    expect(fixture.componentInstance.canSaveChanges()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain("Couldn't save. Try again");
  });

  it('shows a live character count and disables save when the name exceeds the limit', () => {
    fixture.componentInstance.setDraftBrandName('A'.repeat(31));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#brand-name-counter').textContent).toContain('31 / 30');
    expect(fixture.nativeElement.textContent).toContain('30 characters or fewer');
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;
    const saveButton = Array.from(buttons).find((button) => button.textContent?.trim() === 'Save changes')!;
    expect(saveButton.disabled).toBeTrue();
  });

  it('does not save a label with an invalid length', () => {
    fixture.componentInstance.setDraftBrandName('A'.repeat(31));
    fixture.componentInstance.saveChanges();

    expect(brandingSpy.setBrandName).not.toHaveBeenCalled();
  });

  it('cancels edits and restores the saved name', () => {
    fixture.componentInstance.setDraftBrandName('Unsaved name');
    fixture.componentInstance.cancelChanges();

    expect(fixture.componentInstance.draftBrandName()).toBe('Example app');
    expect(fixture.componentInstance.hasUnsavedChanges()).toBeFalse();
  });

  it('uses the shared confirmation when leaving with unsaved changes', async () => {
    fixture.componentInstance.setDraftBrandName('Unsaved name');

    expect(await firstValueFrom(fixture.componentInstance.canDeactivate() as Observable<boolean>)).toBeFalse();
    expect(unsavedDialogSpy.confirmIfNeeded).toHaveBeenCalledOnceWith(true);
  });

  it('requires an image before saving image mode', () => {
    fixture.componentInstance.setDraftMode('image');

    expect(fixture.componentInstance.canSaveChanges()).toBeFalse();
  });

  it('requires alt text before saving an uploaded image', () => {
    fixture.componentInstance.draftLogo.set('data:image/png;base64,abc');
    fixture.componentInstance.setDraftMode('image');
    fixture.componentInstance.setDraftAltText('   ');

    expect(fixture.componentInstance.canSaveChanges()).toBeFalse();

    fixture.componentInstance.setDraftAltText('Organization logo');
    expect(fixture.componentInstance.canSaveChanges()).toBeTrue();
  });

  it('rejects unsupported image file types with an inline error', () => {
    const file = new File(['not an image'], 'logo.gif', { type: 'image/gif' });
    const input = { files: [file], value: 'logo.gif' } as unknown as HTMLInputElement;
    fixture.componentInstance.onLogoSelected({ target: input } as unknown as Event);

    expect(fixture.componentInstance.logoError()).toBe('Choose a PNG or JPEG image.');
  });

  it('rejects images larger than 500 KB', () => {
    const file = new File([new Uint8Array(500 * 1024 + 1)], 'logo.png', { type: 'image/png' });
    const input = { files: [file], value: 'logo.png' } as unknown as HTMLInputElement;
    fixture.componentInstance.onLogoSelected({ target: input } as unknown as Event);

    expect(fixture.componentInstance.logoError()).toBe('The image must be 500 KB or smaller.');
  });

  it('opens a Material dialog with the image removal fallback message', async () => {
    fixture.componentInstance.draftLogo.set('data:image/png;base64,abc');
    fixture.componentInstance.draftMode.set('image');
    fixture.componentInstance.requestLogoRemoval();
    fixture.detectChanges();

    expect(document.body.textContent).toContain(
      'Remove this image? The header will use the text label.',
    );
    const removeButton = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.trim() === 'Remove image');
    expect(removeButton).toBeDefined();
    const dialogClosed = firstValueFrom(TestBed.inject(MatDialog).afterAllClosed);
    removeButton!.click();
    await dialogClosed;

    expect(fixture.componentInstance.draftLogo()).toBe('');
    expect(fixture.componentInstance.draftMode()).toBe('label');
  });
});
