import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-section-row',
    imports: [IconComponent, FormsModule],
    templateUrl: './section-row.component.html',
})
export class SectionRowComponent {
    name = input.required<string>();
    from = input.required<number>();
    to = input.required<number>();
    color = input<string>('#000000');
    pageCount = input.required<number>();
    showColorPicker = input(false);
    showAddSubsection = input(false);
    minPage = input(0);
    maxPage = input<number | null>(null);

    nameChange = output<string>();
    fromChange = output<number>();
    toChange = output<number>();
    colorChange = output<string>();
    addSubsection = output<void>();
    remove = output<void>();

    pageOptions = computed(() => {
        const min = this.minPage();
        const max = this.maxPage() ?? this.pageCount() - 1;
        return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    });

    onNameChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.nameChange.emit(value);
    }

    onColorChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.colorChange.emit(value);
    }
}
