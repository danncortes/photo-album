import {
    AfterViewInit,
    Component,
    inject,
    input,
    output,
    signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
    isNumberValidator,
    isNumberPositiveValidator,
} from '../../helpers/validators';
import { PageFormat, PageStyles, StyleSettings } from './../../../types';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { AlbumStore } from '../../store/albums.store';

export type SettingsMode = 'page' | 'album';

@Component({
    selector: 'app-style-settings',
    imports: [ReactiveFormsModule, CustomInputComponent],
    templateUrl: './style-settings.component.html',
    styleUrl: './style-settings.component.css',
})
export class StyleSettingsComponent implements AfterViewInit {
    readonly albumStore = inject(AlbumStore);
    private dialogData = inject<{ mode: SettingsMode } | null>(DIALOG_DATA, {
        optional: true,
    });
    private dialogRef = inject(DialogRef, { optional: true });

    mode = input<SettingsMode>('page');
    pageIndex = input<number>();
    closeMenu = output<void>();

    defaultHeight = signal<number | ''>('');
    defaultWidth = signal<number | ''>('');
    defaultGap = signal<number | ''>('');
    defaultPaddingTop = signal<number | ''>('');
    defaultPaddingRight = signal<number | ''>('');
    defaultPaddingBottom = signal<number | ''>('');
    defaultPaddingLeft = signal<number | ''>('');
    defaultPhotoBorderRadius = signal<number | ''>('');

    isLoading = signal<boolean>(false);

    form = new FormGroup({
        gap: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        pageWidth: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        pageHeight: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        paddingTop: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        paddingRight: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        paddingBottom: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        paddingLeft: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
        photoBorderRadius: new FormControl<number | ''>('', {
            validators: this.numberFieldValidators(),
        }),
    });

    ngAfterViewInit(): void {
        this.setDefaultValues();
        setTimeout(() => this.setDefaultValuesInForm());
    }

    private resolveMode(): SettingsMode {
        return this.dialogData?.mode ?? this.mode();
    }

    setDefaultValues() {
        const album = this.albumStore.activeAlbum();
        if (!album) return;

        let format: Partial<PageFormat> | undefined;
        let gap: number | undefined;
        let paddingTop: number | undefined;
        let paddingRight: number | undefined;
        let paddingBottom: number | undefined;
        let paddingLeft: number | undefined;
        let photoBorderRadius: number | undefined;

        if (this.resolveMode() === 'album') {
            const settings = album.settings;
            format = settings.format;
            gap = settings.gap;
            paddingTop = settings.paddingTop;
            paddingRight = settings.paddingRight;
            paddingBottom = settings.paddingBottom;
            paddingLeft = settings.paddingLeft;
            photoBorderRadius = settings.photoBorderRadius;
        } else {
            const page = album.pages[this.pageIndex()!];
            format = page.format;
            gap = page.gap;
            paddingTop = page.paddingTop;
            paddingRight = page.paddingRight;
            paddingBottom = page.paddingBottom;
            paddingLeft = page.paddingLeft;
            photoBorderRadius = page.photoBorderRadius;
        }

        if (format?.height !== undefined)
            this.defaultHeight.set(Number(format.height));
        if (format?.width !== undefined)
            this.defaultWidth.set(Number(format.width));
        if (gap !== undefined) this.defaultGap.set(Number(gap));
        if (paddingTop !== undefined)
            this.defaultPaddingTop.set(Number(paddingTop));
        if (paddingRight !== undefined)
            this.defaultPaddingRight.set(Number(paddingRight));
        if (paddingBottom !== undefined)
            this.defaultPaddingBottom.set(Number(paddingBottom));
        if (paddingLeft !== undefined)
            this.defaultPaddingLeft.set(Number(paddingLeft));
        if (photoBorderRadius !== undefined)
            this.defaultPhotoBorderRadius.set(Number(photoBorderRadius));
    }

    setDefaultValuesInForm() {
        this.form.setValue({
            gap: this.defaultGap(),
            pageWidth: this.defaultWidth(),
            pageHeight: this.defaultHeight(),
            paddingTop: this.defaultPaddingTop(),
            paddingRight: this.defaultPaddingRight(),
            paddingBottom: this.defaultPaddingBottom(),
            paddingLeft: this.defaultPaddingLeft(),
            photoBorderRadius: this.defaultPhotoBorderRadius(),
        });
    }

    get formHasNoChanges() {
        const defaultValues = JSON.stringify([
            this.defaultGap(),
            this.defaultWidth(),
            this.defaultHeight(),
            this.defaultPaddingTop(),
            this.defaultPaddingRight(),
            this.defaultPaddingBottom(),
            this.defaultPaddingLeft(),
            this.defaultPhotoBorderRadius(),
        ]);
        const formValues = JSON.stringify(
            Object.values(this.form.value).map((val) =>
                val ? Number(val) : val,
            ),
        );
        return formValues !== defaultValues;
    }

    isSaveButtonDisabled() {
        return this.form.invalid || !this.formHasNoChanges;
    }

    saveSettings() {
        const {
            gap,
            pageWidth,
            pageHeight,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            photoBorderRadius,
        } = this.form.value;

        if (this.resolveMode() === 'album') {
            this.saveAlbumSettings({
                gap,
                pageWidth,
                pageHeight,
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                photoBorderRadius,
            });
        } else {
            this.savePageSettings({
                gap,
                pageWidth,
                pageHeight,
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                photoBorderRadius,
            });
        }
    }

    private saveAlbumSettings(
        values: Record<string, number | '' | null | undefined>,
    ) {
        const {
            gap,
            pageWidth,
            pageHeight,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            photoBorderRadius,
        } = values;

        const settings: StyleSettings = {
            format: {
                width: this.valueIsNumber(pageWidth) ? Number(pageWidth) : 0,
                height: this.valueIsNumber(pageHeight) ? Number(pageHeight) : 0,
            },
            gap: this.valueIsNumber(gap) ? Number(gap) : 0,
            paddingTop: this.valueIsNumber(paddingTop) ? Number(paddingTop) : 0,
            paddingRight: this.valueIsNumber(paddingRight)
                ? Number(paddingRight)
                : 0,
            paddingBottom: this.valueIsNumber(paddingBottom)
                ? Number(paddingBottom)
                : 0,
            paddingLeft: this.valueIsNumber(paddingLeft)
                ? Number(paddingLeft)
                : 0,
        };

        if (this.valueIsNumber(photoBorderRadius)) {
            settings.photoBorderRadius = Number(photoBorderRadius);
        }

        this.albumStore.updateAlbumSettings(settings);
        this.setDefaultValues();
        this.setDefaultValuesInForm();
    }

    private savePageSettings(
        values: Record<string, number | '' | null | undefined>,
    ) {
        const {
            gap,
            pageWidth,
            pageHeight,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            photoBorderRadius,
        } = values;

        let pageStyles: PageStyles = {};

        if (pageWidth || pageHeight) {
            pageStyles = {
                format: {} as PageFormat,
            };
            if (this.valueIsNumber(pageHeight))
                pageStyles!.format!.height = Number(pageHeight);
            if (this.valueIsNumber(pageWidth))
                pageStyles!.format!.width = Number(pageWidth);
        }
        if (this.valueIsNumber(gap)) pageStyles.gap = Number(gap);
        if (this.valueIsNumber(paddingTop))
            pageStyles.paddingTop = Number(paddingTop);
        if (this.valueIsNumber(paddingRight))
            pageStyles.paddingRight = Number(paddingRight);
        if (this.valueIsNumber(paddingBottom))
            pageStyles.paddingBottom = Number(paddingBottom);
        if (this.valueIsNumber(paddingLeft))
            pageStyles.paddingLeft = Number(paddingLeft);
        if (this.valueIsNumber(photoBorderRadius))
            pageStyles.photoBorderRadius = Number(photoBorderRadius);

        this.albumStore
            .updatePageSettings({
                pageStyles,
                pageIndex: this.pageIndex()!,
            })
            .subscribe(() => {
                this.setDefaultValues();
                this.setDefaultValuesInForm();
            });
    }

    valueIsNumber(val: number | '' | null | undefined): boolean {
        return val !== '' && val !== null && !isNaN(Number(val));
    }

    resetForm() {
        this.setDefaultValuesInForm();
    }

    cancelForm() {
        this.resetForm();
        if (this.resolveMode() === 'album') {
            this.dialogRef?.close();
        } else {
            this.closeMenu.emit();
        }
    }

    clearForm() {
        this.form.reset();
    }

    numberFieldValidators() {
        return [isNumberValidator, isNumberPositiveValidator];
    }

    onFormSubmit() {
        this.saveSettings();
    }
}
