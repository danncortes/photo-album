import { AbstractControl } from '@angular/forms';

export function isNumberValidator(control: AbstractControl) {
    if (isNaN(Number(control.value))) {
        return {
            notANumber: true,
        };
    }
    return null;
}

export function isNumberPositiveValidator(control: AbstractControl) {
    if (Number(control.value) < 0) {
        return {
            isNegative: true,
        };
    }
    return null;
}
