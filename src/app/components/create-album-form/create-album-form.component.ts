import { Component, signal, DestroyRef, inject, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ConfigService } from '../../services/config.service';
import { Router } from '@angular/router';
import { DialogRef } from '@angular/cdk/dialog';
import { debounceTime, Subscription } from 'rxjs';
import { AlbumPreview } from '../../../types';
import {
    isNumberPositiveValidator,
    isNumberValidator,
} from '../../helpers/validators';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
    selector: 'app-create-album-form',
    imports: [FormsModule, ReactiveFormsModule, CustomInputComponent],
    templateUrl: './create-album-form.component.html',
    styleUrl: './create-album-form.component.scss'
})
export class CreateAlbumFormComponent implements OnInit {
    defaultPadding = 0.5;
    defaultSize = 30;

    form = new FormGroup({
        name: new FormControl<string>('', {
            validators: [
                Validators.required,
                (control) => this.valueExistValidator(control, 'name'),
                this.nameAndIdAllowedCharacterValidator,
            ],
        }),
        id: new FormControl<string>('', {
            validators: [
                Validators.required,
                (control) => this.valueExistValidator(control, 'id'),
                this.nameAndIdAllowedCharacterValidator,
            ],
        }),
        grouped: new FormControl<boolean>(false),
        directoryPath: new FormControl<string>('', {
            validators: [Validators.required],
        }),
        gap: new FormControl<number>(Number(this.defaultPadding), {
            validators: this.numberFieldValidators(),
        }),
        pageWidth: new FormControl<number>(Number(this.defaultSize), {
            validators: this.numberFieldValidators(),
        }),
        pageHeight: new FormControl<number>(Number(this.defaultSize), {
            validators: this.numberFieldValidators(),
        }),
        paddingTop: new FormControl<number>(Number(this.defaultPadding), {
            validators: this.numberFieldValidators(),
        }),
        paddingRight: new FormControl<number>(Number(this.defaultPadding), {
            validators: this.numberFieldValidators(),
        }),
        paddingBottom: new FormControl<number>(Number(this.defaultPadding), {
            validators: this.numberFieldValidators(),
        }),
        paddingLeft: new FormControl<number>(Number(this.defaultPadding), {
            validators: this.numberFieldValidators(),
        }),
    });

    alreadyExistSufix = 'already exist, choose another one';
    allowedCharactersMessage =
        'It can only contain letters, numbers, hyphens (-) and underscores (_)';
    isRequiredMessage = 'Field is required';

    creationError = signal('');

    savingAlbum = signal(false);
    subcriptions: Subscription[] = [];
    private destroyRef = inject(DestroyRef);

    constructor(
        private configService: ConfigService,
        private router: Router,
        private dialogRef: DialogRef<CreateAlbumFormComponent>,
    ) {}

    ngOnInit() {
        this.subcriptions = [
            this.form.controls.name.valueChanges.subscribe((value) => {
                this.form.controls.id.setValue(value);
            }),
            this.form.controls.id.valueChanges.subscribe((value) => {
                if (value) {
                    this.form.controls.id.setValue(
                        value.replace(/\s+|--+/g, '-'),
                        {
                            emitEvent: false,
                        },
                    );
                }
            }),
        ];

        const savedAlbum = window.localStorage.getItem('newAlbum');
        if (savedAlbum) {
            // Wait for next tick to ensure form controls are registered
            setTimeout(() => {
                this.form.setValue(JSON.parse(savedAlbum));
            });
        }
        this.form.valueChanges?.pipe(debounceTime(500)).subscribe((value) => {
            this.creationError.set('');
            if (Object.keys(value).length > 0) {
                localStorage.setItem('newAlbum', JSON.stringify(value));
            }
        });

        this.destroyRef.onDestroy(() => {
            this.subcriptions.forEach((sub) => sub.unsubscribe());
        });
    }

    albumFieldExists(value: string, field: string) {
        return this.configService?.albumsPreview()?.some((album) => {
            return album[field as keyof AlbumPreview] === value;
        });
    }

    valueExistValidator(control: AbstractControl, field: string) {
        if (this.albumFieldExists(control.value, field)) {
            return {
                [`album${field[0].toUpperCase() + field.slice(1)}Exist`]: true,
            };
        }
        return null;
    }

    nameAndIdAllowedCharacterValidator(control: AbstractControl) {
        if (/^[a-zA-Z0-9_\s-]+$/.test(control.value)) {
            return null;
        }

        return {
            notAllowedCharacter: true,
        };
    }

    get nameError() {
        const { errors } = this.form.controls.name;
        if (errors) {
            if ('required' in errors) {
                return this.isRequiredMessage;
            } else if ('albumNameExist' in errors) {
                return `Name ${this.alreadyExistSufix}`;
            } else if ('notAllowedCharacter' in errors) {
                return this.allowedCharactersMessage;
            }
        }

        return null;
    }

    get showNameError() {
        const { touched, invalid } = this.form.controls.name;
        return touched && invalid;
    }

    get idError() {
        const { errors } = this.form.controls.id;
        if (errors) {
            if ('required' in errors) {
                return this.isRequiredMessage;
            } else if ('albumIdExist' in errors) {
                return `Id ${this.alreadyExistSufix}`;
            } else if ('notAllowedCharacter' in errors) {
                return this.allowedCharactersMessage;
            }
        }

        return null;
    }

    get showIdError() {
        const { invalid, value } = this.form.controls.id;
        return value && invalid;
    }

    get directoryPathError() {
        const { errors } = this.form.controls.directoryPath;
        if (errors) {
            if ('required' in errors) {
                return this.isRequiredMessage;
            }
        }

        return null;
    }

    get showDirectoryPathError() {
        const { touched, invalid } = this.form.controls.directoryPath;
        return touched && invalid;
    }

    numberFieldError(fieldName: string) {
        const { errors } = this.form.get(fieldName) as AbstractControl;

        if (errors) {
            if ('required' in errors) {
                return this.isRequiredMessage;
            } else if ('notANumber' in errors) {
                return 'Must be a number';
            } else if ('isNegative' in errors) {
                return 'Must be a positive number';
            }
        }

        return null;
    }

    showNumberFieldError(fieldName: string) {
        return (this.form.get(fieldName) as AbstractControl).invalid;
    }

    numberFieldValidators() {
        return [
            Validators.required,
            isNumberValidator,
            isNumberPositiveValidator,
        ];
    }

    get isFormInvalid(): boolean {
        return this.form.invalid;
    }

    resetForm() {
        this.form.reset();
        this.form.setValue({
            name: '',
            id: '',
            directoryPath: '',
            grouped: false,
            gap: Number(this.defaultPadding),
            pageWidth: Number(this.defaultSize),
            pageHeight: Number(this.defaultSize),
            paddingTop: Number(this.defaultPadding),
            paddingRight: Number(this.defaultPadding),
            paddingBottom: Number(this.defaultPadding),
            paddingLeft: Number(this.defaultPadding),
        });
    }

    onFormSubmit() {
        this.savingAlbum.set(true);

        const {
            name,
            id,
            grouped,
            directoryPath,
            gap,
            pageWidth,
            pageHeight,
            paddingTop,
            paddingRight,
            paddingLeft,
            paddingBottom,
        } = this.form.value;

        const newAlbum = {
            name: name!,
            id: id!,
            isGrouped: !!grouped,
            originFolder: directoryPath!,
            activeFolder: null,
            photosDictionary: {},
            pages: [],
            settings: {
                paddingTop: paddingTop || this.defaultPadding,
                paddingRight: paddingRight || this.defaultPadding,
                paddingBottom: paddingBottom || this.defaultPadding,
                paddingLeft: paddingLeft || this.defaultPadding,
                format: {
                    width: pageWidth || this.defaultSize,
                    height: pageHeight || this.defaultSize,
                },
                gap: gap || this.defaultPadding,
            },
        };

        this.subcriptions.push(
            this.configService.createAlbum(newAlbum).subscribe({
                next: () => {
                    this.resetForm();
                    console.log('New Album saved');
                    this.dialogRef.close();
                    this.router.navigateByUrl(`/album/${id}`);
                },
                error: (error) => {
                    this.creationError.set(
                        `There was an error creating the album, Error Code: ${error.error?.code}`,
                    );
                    this.savingAlbum.set(false);
                },
                complete: () => {
                    this.savingAlbum.set(false);
                },
            }),
        );
    }
}
