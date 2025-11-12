import {
    Component,
    forwardRef,
    input,
    viewChild,
    ElementRef,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
} from '@angular/forms';

@Component({
    selector: 'app-custom-input',
    imports: [ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomInputComponent),
            multi: true,
        },
    ],
    templateUrl: './custom-input.component.html',
    styleUrl: './custom-input.component.css',
})
export class CustomInputComponent implements ControlValueAccessor {
    label = input.required<string>();
    id = input.required<string>();
    type = input.required<string>();
    class = input<string>('');
    showError = input<boolean>();
    errorMessage = input<string | null>();

    inputElement = viewChild<ElementRef>('inputElement');

    onChange = (value: string) => {};
    onTouched = () => {};

    writeValue(value: string): void {
        const input = this.inputElement()?.nativeElement;
        if (input && input.value !== value) {
            input.value = value || '';
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onInput(value: string): void {
        this.onChange(value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
