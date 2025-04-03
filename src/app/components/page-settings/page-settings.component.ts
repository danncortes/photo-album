import { AfterViewInit, Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
    isNumberValidator,
    isNumberPositiveValidator,
} from '../../helpers/validators';
import { PageFormat, PageStyles } from './../../../types';
import { CustomInputComponent } from '../custom-input/custom-input.component';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-page-settings',
    imports: [ReactiveFormsModule, CustomInputComponent],
    templateUrl: './page-settings.component.html',
    styleUrl: './page-settings.component.scss',
})
export class PageSettingsComponent implements AfterViewInit {
    readonly albumStore = inject(AlbumStore);
    pageIndex = input.required<number>();
    defaultHeight = signal<number | ''>('');
    defaultWidth = signal<number | ''>('');
    defaultGap = signal<number | ''>('');
    defaultPaddingTop = signal<number | ''>('');
    defaultPaddingRight = signal<number | ''>('');
    defaultPaddingBottom = signal<number | ''>('');
    defaultPaddingLeft = signal<number | ''>('');

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
    });

    constructor() {}

    ngAfterViewInit(): void {
        this.setDefaultValues();
        this.setDefaultValuesInForm();
    }

    setDefaultValues() {
        const album = this.albumStore.activeAlbum();
        const page = album!.pages[this.pageIndex()];
        const {
            format,
            gap,
            paddingTop: paddingTop,
            paddingRight: paddingRight,
            paddingBottom: paddingBottom,
            paddingLeft: paddingLeft,
        } = page;

        if (format) {
            if (format.height !== undefined)
                this.defaultHeight.set(Number(format.height));
            if (format.width !== undefined)
                this.defaultWidth.set(Number(format.width));
        }
        if (gap !== undefined) this.defaultGap.set(Number(gap));
        if (paddingTop !== undefined)
            this.defaultPaddingTop.set(Number(paddingTop));
        if (paddingRight !== undefined)
            this.defaultPaddingRight.set(Number(paddingRight));
        if (paddingBottom !== undefined)
            this.defaultPaddingBottom.set(Number(paddingBottom));
        if (paddingLeft !== undefined)
            this.defaultPaddingLeft.set(Number(paddingLeft));
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
        });
    }

    get formHasNoChanges() {
        // Keep the same order as the form fields
        const defaultValues = JSON.stringify([
            this.defaultGap(),
            this.defaultWidth(),
            this.defaultHeight(),
            this.defaultPaddingTop(),
            this.defaultPaddingRight(),
            this.defaultPaddingBottom(),
            this.defaultPaddingLeft(),
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
        } = this.form.value;

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

        this.albumStore
            .updatePageSettings({ pageStyles, pageIndex: this.pageIndex() })
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

    numberFieldValidators() {
        return [isNumberValidator, isNumberPositiveValidator];
    }

    onFormSubmit() {
        // change states in the future e.g. saving...
        this.saveSettings();
    }
}
