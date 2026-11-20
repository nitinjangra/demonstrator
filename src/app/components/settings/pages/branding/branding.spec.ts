import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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

  it('saves the edited name through the branding service', async () => {
    fixture.componentInstance.setDraftBrandName('New name');
    await fixture.componentInstance.saveChanges();

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
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as BeforeUnloadEvent;
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

    expect(fixture.nativeElement.querySelector('#brand-name-counter').textContent).toContain(
      '31 / 30',
    );
    expect(fixture.nativeElement.textContent).toContain('30 characters or fewer');
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    const saveButton = Array.from(buttons).find(
      (button) => button.textContent?.trim() === 'Save changes',
    )!;
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

    expect(
      await firstValueFrom(fixture.componentInstance.canDeactivate() as Observable<boolean>),
    ).toBeFalse();
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

  it('supports alt-text fallbacks, drag states, and image dimensions', () => {
    fixture.componentInstance.draftLogo.set('data:image/png;base64,abc');
    fixture.componentInstance.draftAltText.set('');
    fixture.componentInstance.draftBrandName.set('Example organization');
    fixture.componentInstance.draftMode.set('image');
    fixture.detectChanges();
    const previewImages = fixture.nativeElement.querySelectorAll(
      '.header-preview img',
    ) as NodeListOf<HTMLImageElement>;
    expect(previewImages[0].alt).toBe('Example organization');
    expect(fixture.nativeElement.querySelector('.logo-preview-tile img').alt).toBe(
      'Brand image preview',
    );

    const dragEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as DragEvent;
    fixture.componentInstance.onLogoDragOver(dragEvent);
    expect(fixture.componentInstance.isLogoDragOver()).toBeTrue();
    fixture.componentInstance.onLogoDragLeave(dragEvent);
    expect(fixture.componentInstance.isLogoDragOver()).toBeFalse();
    expect(dragEvent.preventDefault).toHaveBeenCalledTimes(2);

    fixture.componentInstance.captureLogoDimensions({
      target: { naturalWidth: 32, naturalHeight: 48 },
    } as unknown as Event);
    expect(fixture.componentInstance.logoDimensions()).toContain('32');
    expect(fixture.componentInstance.logoDimensions()).toContain('48');
    expect(fixture.componentInstance.hasFineDetailsWarning()).toBeTrue();
    fixture.componentInstance.captureLogoDimensions({
      target: { naturalWidth: 0, naturalHeight: 0 },
    } as unknown as Event);
    expect(fixture.componentInstance.logoDimensions()).toContain('32');
    expect(fixture.componentInstance.formatFileSize(0)).toBe('1 KB');
  });

  it('rejects invalid logo selection and accepts a valid image file extension without a MIME type', () => {
    const emptyInput = { files: [], value: 'old.png' } as unknown as HTMLInputElement;
    fixture.componentInstance.onLogoSelected({ target: emptyInput } as unknown as Event);
    expect(emptyInput.value).toBe('');

    const unsupported = new File(['bad'], 'logo.svg', { type: '' });
    fixture.componentInstance.onLogoSelected({
      target: { files: [unsupported], value: 'logo.svg' },
    } as unknown as Event);
    expect(fixture.componentInstance.logoError()).toBe('Choose a PNG or JPEG image.');

    const valid = new File(['png'], 'logo.PNG', { type: '' });
    fixture.componentInstance.onLogoSelected({
      target: { files: [valid], value: 'logo.PNG' },
    } as unknown as Event);
    expect(fixture.componentInstance.isProcessing()).toBeTrue();
  });

  it('accepts a valid uploaded image and updates the accessible preview', async () => {
    const file = new File(['valid image'], 'organization.png', { type: 'image/png' });
    const input = { files: [file], value: 'organization.png' } as unknown as HTMLInputElement;
    const originalRead = FileReader.prototype.readAsDataURL;
    spyOn(FileReader.prototype, 'readAsDataURL').and.callFake(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        value: 'data:image/png;base64,abc',
      });
      this.onload?.call(this, new ProgressEvent('load') as ProgressEvent<FileReader>);
    });
    const originalImage = window.Image;
    const imageSpy = jasmine.createSpy('Image');
    (window as unknown as { Image: unknown }).Image = function () {
      const image = {
        naturalWidth: 128,
        naturalHeight: 96,
        onload: null as (() => void) | null,
        set src(_value: string) {
          this.onload?.();
        },
      };
      imageSpy();
      return image;
    } as unknown as typeof Image;
    try {
      fixture.componentInstance.setDraftBrandName('Organization');
      fixture.componentInstance.onLogoSelected({ target: input } as unknown as Event);
      fixture.detectChanges();
      expect(fixture.componentInstance.draftLogo()).toBe('data:image/png;base64,abc');
      expect(fixture.componentInstance.draftLogoName()).toBe('organization.png');
      expect(fixture.componentInstance.draftAltText()).toBe('Organization');
      expect(fixture.componentInstance.draftMode()).toBe('image');
      expect(fixture.componentInstance.uploadProgress()).toBe(100);
      expect(fixture.componentInstance.logoDimensions()).toContain('128');
      expect(fixture.componentInstance.isProcessing()).toBeFalse();
    } finally {
      FileReader.prototype.readAsDataURL = originalRead;
      (window as unknown as { Image: unknown }).Image = originalImage;
    }
  });

  it('restores dirty state after a successful save timeout when source settings remain unchanged', fakeAsync(() => {
    fixture.componentInstance.setDraftBrandName('Changed locally');
    void fixture.componentInstance.saveChanges();
    tick(16);
    tick(3000);
    expect(fixture.componentInstance.saveState()).toBe('dirty');
  }));

  it('handles a missing image file when dropped and keeps image removal when canceled', async () => {
    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      dataTransfer: { files: [] },
    } as unknown as DragEvent;
    fixture.componentInstance.onLogoDrop(event);
    expect(fixture.componentInstance.isLogoDragOver()).toBeFalse();

    fixture.componentInstance.draftLogo.set('data:image/png;base64,abc');
    fixture.componentInstance.draftMode.set('image');
    fixture.componentInstance.requestLogoRemoval();
    const closed = firstValueFrom(TestBed.inject(MatDialog).afterAllClosed);
    const keepButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === 'Keep image',
    )!;
    keepButton.click();
    await closed;
    expect(fixture.componentInstance.draftLogo()).toBe('data:image/png;base64,abc');
  });

  it('blocks route deactivation during save and confirms when save failed', async () => {
    fixture.componentInstance.saveState.set('saving');
    expect(fixture.componentInstance.canDeactivate()).toBeFalse();
    fixture.componentInstance.saveState.set('error');
    expect(
      await firstValueFrom(fixture.componentInstance.canDeactivate() as Observable<boolean>),
    ).toBeFalse();
    expect(unsavedDialogSpy.confirmIfNeeded).toHaveBeenCalledWith(true);
  });

  it('does not overwrite saving state when edits refresh the form state', () => {
    fixture.componentInstance.setDraftBrandName('Edited');
    fixture.componentInstance.saveState.set('saving');
    fixture.componentInstance.setDraftBrandName('Editing while saving');
    expect(fixture.componentInstance.saveState()).toBe('saving');
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
