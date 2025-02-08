import { Component, forwardRef, input, signal } from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
} from '@angular/forms';

@Component({
    selector: 'app-custom-input',
    standalone: true,
    imports: [ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CustomInputComponent),
            multi: true,
        },
    ],
    templateUrl: './custom-input.component.html',
    styleUrl: './custom-input.component.scss',
})
export class CustomInputComponent implements ControlValueAccessor {
    label = input.required<string>();
    id = input.required<string>();
    type = input.required<string>();
    showError = input<boolean>();
    errorMessage = input<string | null>();
    value = signal('');

    onChange = (value: string) => {};

    writeValue(value: string): void {
        this.value.set(value);
    }

    registerOnChange(fn: () => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onInput(value: string): void {
        this.value.set(value);
        // Call the registered onChange function to notify Angular of the change
        this.onChange(value);
    }

    onTouched(): void {
        // Call the registered onTouched function to notify Angular
        this.onTouched();
    }
}
