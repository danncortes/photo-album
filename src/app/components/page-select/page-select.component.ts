import { Component, computed, input, output } from '@angular/core';
import { Page } from '../../../types';

@Component({
    selector: 'app-page-select',
    template: `
        <label class="text-sm font-medium whitespace-nowrap" [for]="selectId()">
            {{ label() }}
        </label>
        <select
            [id]="selectId()"
            class="select select-sm select-bordered ml-2"
            [value]="selectedIndex()"
            (change)="selectionChange.emit(toNumber($any($event.target).value))"
        >
            @for (page of pages(); track $index) {
                <option
                    [value]="$index"
                    [selected]="$index === selectedIndex()"
                    [disabled]="$index === disabledIndex()"
                >
                    {{ $index + 1 }}
                </option>
            }
        </select>
    `,
    host: { class: 'flex items-center' },
})
export class PageSelectComponent {
    pages = input.required<Page[]>();
    selectedIndex = input.required<number>();
    label = input('After page');
    disabledIndex = input<number>(-1);
    selectId = computed(
        () => `page-select-${this.label().toLowerCase().replace(/\s+/g, '-')}`,
    );

    selectionChange = output<number>();

    toNumber(value: string): number {
        return Number(value);
    }
}
