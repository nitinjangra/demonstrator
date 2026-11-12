import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { UnsavedChangesDialogService } from '../../../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { BrandingService } from '../../../../shared/services/branding.service';
import type { BrandDisplayMode } from '../../../../shared/services/branding.service';

const MAX_BRAND_NAME_LENGTH = 30;

@Component({
  selector: 'app-remove-brand-image-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Remove brand image?</h2>
    <mat-dialog-content>Remove this image? The header will use the text label.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" mat-dialog-close>Keep image</button>
      <button matButton="filled" type="button" [mat-dialog-close]="true">Remove image</button>
    </mat-dialog-actions>
  `,
})
class RemoveBrandImageDialog {}

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    StickyFooterComponent,
  ],
  template: `
    <section aria-labelledby="branding-title">
      <h2 id="branding-title">Header branding</h2>
      <p>Choose what appears beside the home icon in the application header. Visible to everyone in your organization.</p>

      <div class="branding-card">
        <div class="branding-card-header">
          <h3 class="card-section-title">Header content</h3>
          <mat-button-toggle-group
            role="radiogroup"
            aria-label="Header branding type"
            [value]="draftMode()"
            (change)="setDraftMode($event.value)"
          >
            <mat-button-toggle value="image">Image</mat-button-toggle>
            <mat-button-toggle value="label">Text label</mat-button-toggle>
          </mat-button-toggle-group>
        </div>

        @if (draftMode() === 'label') {
          <div class="label-settings">
            <mat-form-field appearance="outline">
              <mat-label>Application name</mat-label>
              <input
                matInput
                autocomplete="off"
                [value]="draftBrandName()"
                [attr.aria-invalid]="!isBrandNameValid()"
                aria-describedby="brand-name-counter brand-name-error"
                (input)="setDraftBrandName($any($event.target).value)"
              />
            </mat-form-field>
            @if (!isBrandNameValid()) {
              <p class="brand-name-error" id="brand-name-error" role="alert">
                Application name must be {{ maxBrandNameLength }} characters or fewer.
              </p>
            }
            <div
              class="brand-name-counter"
              [class.brand-name-counter--error]="!isBrandNameValid()"
              id="brand-name-counter"
              aria-live="polite"
            >
              {{ draftBrandName().length }} / {{ maxBrandNameLength }} characters
            </div>
          </div>
        } @else {
          <div class="logo-settings">
            <h3 class="card-section-title">Brand image</h3>
            <div class="logo-controls">
              <div class="logo-controls-row">
                <div
                  class="logo-preview-tile"
                  [class.logo-preview-tile--dragging]="isLogoDragOver()"
                  role="group"
                  aria-label="Brand image preview and drop zone"
                  (dragover)="onLogoDragOver($event)"
                  (dragleave)="onLogoDragLeave($event)"
                  (drop)="onLogoDrop($event)"
                >
                  @if (draftLogo()) {
                    <img [src]="draftLogo()" [alt]="draftAltText() || 'Brand image preview'" (load)="captureLogoDimensions($event)" />
                  } @else {
                    <span>Drop image here</span>
                  }
                </div>
                <div class="logo-file-details">
                  @if (draftLogoName()) {
                    <p class="file-details">
                      <strong>{{ draftLogoName() }}</strong> · {{ formatFileSize(draftLogoSize()) }}
                      @if (logoDimensions()) { · {{ logoDimensions() }} }
                    </p>
                  } @else {
                    <p class="file-details">No image selected</p>
                  }
                  <div class="upload-actions">
                    <label class="upload-button">
                      <mat-icon aria-hidden="true">upload</mat-icon>
                      {{ draftLogo() ? 'Replace image' : 'Upload image' }}
                      <input
                        class="visually-hidden"
                        id="brand-logo"
                        type="file"
                        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                        aria-describedby="brand-logo-help brand-logo-error"
                        (change)="onLogoSelected($event)"
                      />
                    </label>
                    @if (draftLogo()) {
                      <button
                        class="remove-image"
                        matButton="outlined"
                        type="button"
                        (click)="requestLogoRemoval()"
                      >
                        Remove
                      </button>
                    }
                  </div>
                </div>
              </div>
              <p id="brand-logo-help" class="upload-help">
                PNG or JPEG, up to 500 KB. Square marks work best; wide logos are scaled to 32 px tall.
                Transparent backgrounds are supported. Drag an image onto the preview to replace it.
              </p>
              @if (hasFineDetailsWarning()) {
                <p class="image-quality-warning" role="status">
                  <mat-icon aria-hidden="true">warning</mat-icon>
                  Fine detail or small text in this image may be hard to read at header size. Check the previews below.
                </p>
              }
              @if (isProcessing()) {
                <div class="upload-progress" role="status" aria-live="polite">
                  <span>Processing image…</span>
                  <progress [value]="uploadProgress()" max="100">{{ uploadProgress() }}%</progress>
                </div>
              }
              @if (logoError()) {
                <p id="brand-logo-error" class="logo-error" role="alert">{{ logoError() }}</p>
              }
              <mat-form-field appearance="outline">
                <mat-label>Image alt text</mat-label>
                <input
                  matInput
                  maxlength="120"
                  required
                  [value]="draftAltText()"
                  [attr.aria-invalid]="!!draftLogo() && !isAltTextValid()"
                  aria-describedby="brand-alt-help brand-alt-error"
                  (input)="setDraftAltText($any($event.target).value)"
                />
                <mat-hint id="brand-alt-help">Describe the logo for screen readers, usually your organization name. Shown if the image fails to load.</mat-hint>
              </mat-form-field>
              @if (draftLogo() && !isAltTextValid()) {
                <p class="brand-name-error" id="brand-alt-error" role="alert">Image alt text is required.</p>
              }
              <div class="preview-heading">
                <h3 class="card-section-title">Preview</h3>
                <span>Actual size · updates as you edit</span>
              </div>
              <div class="logo-previews" aria-label="Header image preview in light and dark themes">
                <div class="theme-preview">
                  <div class="header-preview header-preview--light" aria-label="Light theme preview">
                    <mat-icon aria-hidden="true">home</mat-icon>
                    @if (draftLogo()) {
                      <img [src]="draftLogo()" [alt]="draftAltText() || draftBrandName()" />
                    } @else {
                      <span>{{ draftBrandName() }}</span>
                    }
                  </div>
                  <span>Light theme</span>
                </div>
                <div class="theme-preview">
                  <div class="header-preview header-preview--dark" aria-label="Dark theme preview">
                    <mat-icon aria-hidden="true">home</mat-icon>
                    @if (draftLogo()) {
                      <img [src]="draftLogo()" [alt]="draftAltText() || draftBrandName()" />
                    } @else {
                      <span>{{ draftBrandName() }}</span>
                    }
                  </div>
                  <span>Dark theme</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>
    <app-sticky-footer [fixed]="true" [customStyles]="stickyFooterStyles">
      <div class="branding-footer-status" [attr.data-state]="saveState()" role="status" aria-live="polite" aria-atomic="true">
        @switch (saveState()) {
          @case ('dirty') {
            <mat-icon aria-hidden="true">edit</mat-icon>
            <span>Unsaved changes. Leaving this page will discard your edits.</span>
          }
          @case ('saving') {
            <span class="save-spinner" aria-hidden="true"></span>
            <span>Saving…</span>
          }
          @case ('saved') {
            <mat-icon aria-hidden="true">check_circle</mat-icon>
            <span>Saved</span>
          }
          @case ('error') {
            <mat-icon aria-hidden="true">error</mat-icon>
            <span>Couldn't save. Try again with Save changes.</span>
          }
        }
      </div>
      @if (canDiscardChanges()) {
        <button matButton type="button" (click)="cancelChanges()">Discard changes</button>
      }
      <button
        class="branding-save-button"
        matButton="filled"
        type="button"
        aria-label="Save branding"
        [disabled]="!canSaveChanges()"
        (click)="saveChanges()"
      >
        <span class="branding-save-button-content">
          @if (saveState() === 'saving') {
            <span class="save-spinner" aria-hidden="true"></span>
            <span>Saving…</span>
          } @else {
            <span>Save changes</span>
          }
        </span>
      </button>
    </app-sticky-footer>
  `,
  styles: `
    :host {
      display: flex;
      min-height: 100%;
      flex-direction: column;
    }

    section {
      flex: 1 0 auto;
    }
    .branding-card {
      box-sizing: border-box;
      width: 100%;
      padding: 1.25rem;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      background: var(--color-surface);
    }
    .card-section-title {
      margin: 0 0 0.75rem;
      font-size: 0.95rem;
      font-weight: 650;
    }
    .branding-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .branding-card-header .card-section-title {
      margin-bottom: 0;
    }
    .label-settings {
      max-width: 32rem;
      margin-top: 1.25rem;
    }
    mat-form-field {
      width: 100%;
      margin-top: 1rem;
      margin-bottom: 0;
    }
    .brand-name-counter {
      color: var(--color-muted-text);
      font-size: 0.875rem;
      margin-top: 0.25rem;
      text-align: right;
    }
    .brand-name-counter--error {
      color: var(--color-error);
    }
    .brand-name-error {
      margin: 0.25rem 0 0;
      color: var(--color-error);
    }
    .logo-settings {
      display: grid;
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .logo-controls { display: grid; gap: 0.75rem; }
    .logo-previews {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
    }
    .theme-preview {
      display: grid;
      gap: 0.4rem;
      color: var(--color-muted-text);
      font-size: 0.8rem;
    }
    .preview-heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .preview-heading > span { color: var(--color-muted-text); font-size: 0.8rem; }
    .header-preview {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      min-height: 3rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      font-weight: 600;
    }
    .header-preview--light {
      background: #fff;
      color: #202124;
    }
    .header-preview--dark {
      background: #202124;
      color: #fff;
    }
    .header-preview mat-icon {
      flex: 0 0 auto;
    }
    .header-preview img {
      width: 2rem;
      height: 2rem;
      object-fit: contain;
    }
    .header-preview span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .logo-controls-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo-file-details { display: grid; min-width: 0; gap: 0.75rem; }
    .logo-file-details .file-details { overflow-wrap: anywhere; }
    .logo-preview-tile {
      display: grid;
      flex: 0 0 6rem;
      width: 6rem;
      height: 6rem;
      place-items: center;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      background-color: #1c2538;
      background-image: conic-gradient(#26324a 25%, transparent 0 50%, #26324a 0 75%, transparent 0);
      background-size: 1rem 1rem;
      cursor: copy;
    }
    .logo-preview-tile--dragging {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    .logo-preview-tile img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .logo-preview-tile span {
      color: var(--color-muted-text);
      font-size: 0.75rem;
    }
    .upload-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .upload-button {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      min-height: 2.5rem;
      padding: 0 1rem;
      border: 1px solid var(--color-border);
      border-radius: 0.35rem;
      color: var(--color-text);
      cursor: pointer;
    }
    .upload-button:focus-within,
    .upload-button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    .remove-image {
      color: var(--color-error) !important;
    }
    .upload-help,
    .file-details {
      margin: 0;
      color: var(--color-muted-text);
    }
    .file-details {
      font-size: 0.875rem;
    }
    .image-quality-warning {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin: 0;
      padding: 0.75rem;
      border: 1px solid #806b32;
      border-radius: 0.5rem;
      background: color-mix(in srgb, #a68018 18%, var(--color-surface));
      color: #f0d27a;
      font-size: 0.875rem;
    }
    .image-quality-warning mat-icon { flex: 0 0 auto; }
    .logo-error {
      margin: 0;
      color: var(--color-error);
    }
    .upload-progress {
      display: grid;
      gap: 0.25rem;
    }
    .upload-progress progress {
      width: 100%;
    }
    .branding-footer-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      margin-inline-end: auto;
      color: var(--color-text);
      font-size: 0.875rem;
    }
    .branding-footer-status[data-state='error'] { color: var(--color-error); }
    .branding-footer-status[data-state='saved'] { color: var(--color-success, #2e7d32); }
    .branding-footer-status mat-icon { flex: 0 0 auto; }
    .save-spinner {
      box-sizing: border-box;
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: branding-spin 0.75s linear infinite;
    }
    .branding-save-button { min-width: 9rem; }
    .branding-save-button-content { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
    @keyframes branding-spin {
      to { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .save-spinner { animation: none; border-right-color: currentColor; }
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    app-sticky-footer {
      margin-top: auto;
    }
    @media (max-width: 600px) {
      .branding-card {
        padding: 1rem;
      }
      .logo-previews {
        grid-template-columns: 1fr;
      }
      .logo-controls-row {
        align-items: flex-start;
        flex-direction: column;
      }
      .branding-card-header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
})
export class Branding {
  readonly maxBrandNameLength = MAX_BRAND_NAME_LENGTH;
  private readonly branding = inject(BrandingService);
  readonly brandName = this.branding.brandName;
  readonly brandMode = this.branding.brandMode;
  readonly brandLogo = this.branding.brandLogo;
  readonly brandLogoName = this.branding.brandLogoName;
  readonly brandLogoSize = this.branding.brandLogoSize;
  readonly brandAltText = this.branding.brandAltText;
  private readonly dialog = inject(MatDialog);
  private readonly unsavedChangesDialog = inject(UnsavedChangesDialogService);
  private savedTimeout: ReturnType<typeof setTimeout> | undefined;
  readonly stickyFooterStyles = { height: 'auto', minHeight: '4.5rem', overflow: 'visible' };
  readonly draftBrandName = signal(this.brandName());
  readonly draftMode = signal(this.brandMode());
  readonly draftLogo = signal(this.brandLogo());
  readonly draftLogoName = signal(this.brandLogoName());
  readonly draftLogoSize = signal(this.brandLogoSize());
  readonly draftAltText = signal(this.brandAltText());
  readonly logoError = signal('');
  readonly saveState = signal<'clean' | 'dirty' | 'saving' | 'saved' | 'error'>('clean');
  readonly isProcessing = signal(false);
  readonly uploadProgress = signal(0);
  readonly logoDimensions = signal('');
  readonly isLogoDragOver = signal(false);
  readonly isAltTextValid = computed(() => this.draftAltText().trim().length > 0);
  readonly hasFineDetailsWarning = computed(() => {
    const dimensions = this.logoDimensions().match(/^(\d+) × (\d+)$/);
    return !!dimensions && (Number(dimensions[1]) < 64 || Number(dimensions[2]) < 64);
  });
  readonly isBrandNameValid = computed(
    () => this.draftBrandName().length <= this.maxBrandNameLength,
  );
  readonly hasUnsavedChanges = computed(
    () =>
      this.draftBrandName() !== this.brandName() ||
      this.draftMode() !== this.brandMode() ||
      this.draftLogo() !== this.brandLogo() ||
      this.draftLogoName() !== this.brandLogoName() ||
      this.draftLogoSize() !== this.brandLogoSize() ||
      this.draftAltText() !== this.brandAltText(),
  );

  readonly canSaveChanges = computed(
    () =>
      (this.hasUnsavedChanges() || this.saveState() === 'error') &&
      this.isBrandNameValid() &&
      !this.isProcessing() && this.saveState() !== 'saving' &&
      (this.draftMode() === 'label' || (!!this.draftLogo() && this.isAltTextValid())),
  );

  readonly canDiscardChanges = computed(
    () => this.saveState() === 'dirty' || this.saveState() === 'error',
  );

  @HostListener('window:beforeunload', ['$event'])
  warnBeforeLeaving(event: BeforeUnloadEvent): void {
    this.unsavedChangesDialog.warnBeforeUnload(
      event,
      this.hasUnsavedChanges() || this.saveState() === 'saving' || this.saveState() === 'error',
    );
  }

  private refreshSaveState(): void {
    if (this.savedTimeout) clearTimeout(this.savedTimeout);
    if (this.saveState() === 'saving') return;
    this.saveState.set(this.hasUnsavedChanges() ? 'dirty' : 'clean');
  }

  setDraftBrandName(name: string): void {
    this.draftBrandName.set(name);
    this.refreshSaveState();
  }

  setDraftMode(mode: BrandDisplayMode): void {
    if (mode === 'label' || mode === 'image') {
      this.draftMode.set(mode);
      this.refreshSaveState();
    }
  }

  setDraftAltText(altText: string): void {
    this.draftAltText.set(altText);
    this.refreshSaveState();
  }

  captureLogoDimensions(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.naturalWidth && image.naturalHeight) {
      this.logoDimensions.set(`${image.naturalWidth} × ${image.naturalHeight}`);
    }
  }

  onLogoDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isLogoDragOver.set(true);
  }

  onLogoDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isLogoDragOver.set(false);
  }

  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isLogoDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processLogoFile(file, null);
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.processLogoFile(file, input);
  }

  private processLogoFile(file: File, input: HTMLInputElement | null): void {
    this.logoError.set('');
    this.refreshSaveState();
    this.logoDimensions.set('');

    const isAllowedType = file.type
      ? ['image/png', 'image/jpeg'].includes(file.type)
      : /\.(png|jpe?g)$/i.test(file.name);
    if (!isAllowedType) {
      this.logoError.set('Choose a PNG or JPEG image.');
      return;
    }
    if (file.size > 500 * 1024) {
      this.logoError.set('The image must be 500 KB or smaller.');
      return;
    }

    this.isProcessing.set(true);
    this.uploadProgress.set(0);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.failImageProcessing(input, 'The image could not be read. Try another file.');
        return;
      }
      const image = new Image();
      image.onload = () => {
        this.draftLogo.set(reader.result as string);
        this.draftLogoName.set(file.name);
        this.draftLogoSize.set(file.size);
        this.logoDimensions.set(`${image.naturalWidth} × ${image.naturalHeight}`);
        if (!this.draftAltText().trim()) this.draftAltText.set(this.draftBrandName().trim());
        this.draftMode.set('image');
        this.isProcessing.set(false);
        this.uploadProgress.set(100);
        this.refreshSaveState();
      };
      image.onerror = () =>
        this.failImageProcessing(
          input,
          'This image file appears to be damaged. Choose another image.',
        );
      image.src = reader.result;
    };
    reader.onerror = () =>
      this.failImageProcessing(input, 'The image could not be read. Try another file.');
    reader.onprogress = (event) => {
      if (event.lengthComputable)
        this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
    };
    reader.readAsDataURL(file);
  }

  requestLogoRemoval(): void {
    this.dialog
      .open(RemoveBrandImageDialog, { ariaLabel: 'Remove brand image' })
      .afterClosed()
      .subscribe((confirmed: boolean | undefined) => {
        if (confirmed) this.removeLogo();
      });
  }

  removeLogo(): void {
    this.draftLogo.set('');
    this.draftLogoName.set('');
    this.draftLogoSize.set(0);
    this.draftAltText.set('');
    this.logoDimensions.set('');
    this.draftMode.set('label');
    this.refreshSaveState();
  }

  cancelChanges(): void {
    this.draftBrandName.set(this.brandName());
    this.draftMode.set(this.brandMode());
    this.draftLogo.set(this.brandLogo());
    this.draftLogoName.set(this.brandLogoName());
    this.draftLogoSize.set(this.brandLogoSize());
    this.draftAltText.set(this.brandAltText());
    this.logoError.set('');
    this.isProcessing.set(false);
    this.uploadProgress.set(0);
    if (this.savedTimeout) clearTimeout(this.savedTimeout);
    this.saveState.set('clean');
  }

  canDeactivate(): boolean | import('rxjs').Observable<boolean> {
    if (this.saveState() === 'saving') return false;
    return this.unsavedChangesDialog.confirmIfNeeded(
      this.hasUnsavedChanges() || this.saveState() === 'error',
    );
  }

  formatFileSize(size: number): string {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  async saveChanges(): Promise<void> {
    if (!this.canSaveChanges()) return;
    this.saveState.set('saving');
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      this.branding.setBrandName(this.draftBrandName());
      this.branding.setBrandLogo(this.draftLogo(), this.draftLogoName(), this.draftLogoSize());
      this.branding.setBrandAltText(this.draftAltText());
      this.branding.setBrandMode(this.draftMode());
      this.saveState.set('saved');
      if (this.savedTimeout) clearTimeout(this.savedTimeout);
      this.savedTimeout = setTimeout(() => {
        this.saveState.set(this.hasUnsavedChanges() ? 'dirty' : 'clean');
      }, 3000);
    } catch {
      this.saveState.set('error');
    }
  }

  private failImageProcessing(input: HTMLInputElement | null, message: string): void {
    this.logoError.set(message);
    this.isProcessing.set(false);
    this.uploadProgress.set(0);
    if (input) input.value = '';
  }
}
