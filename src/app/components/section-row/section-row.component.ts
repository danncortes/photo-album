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
    fontColor = input<string>('#000000');
    pageCount = input.required<number>();
    showColorPicker = input(false);
    minPage = input(0);
    maxPage = input<number | null>(null);

    nameChange = output<string>();
    fromChange = output<number>();
    toChange = output<number>();
    colorChange = output<string>();
    fontColorChange = output<string>();
    addSubsection = output<void>();
    remove = output<void>();

    pageOptions = computed(() => {
        const min = this.minPage();
        const max = this.maxPage() ?? this.pageCount() - 1;
        return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    });

    colorHex = computed(() => this.extractHex(this.color()));
    colorAlpha = computed(() => this.extractAlpha(this.color()));

    onNameChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.nameChange.emit(value);
    }

    onColorHexChange(event: Event) {
        const hex = (event.target as HTMLInputElement).value;
        this.colorChange.emit(this.buildRgba(hex, this.colorAlpha()));
    }

    onColorAlphaChange(event: Event) {
        const alpha = parseFloat((event.target as HTMLInputElement).value);
        this.colorChange.emit(this.buildRgba(this.colorHex(), alpha));
    }

    onFontColorChange(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.fontColorChange.emit(value);
    }

    private extractHex(color: string): string {
        if (color.startsWith('#')) return color;
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return '#000000';
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    private extractAlpha(color: string): number {
        const match = color.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
        return match ? parseFloat(match[1]) : 1;
    }

    private buildRgba(hex: string, alpha: number): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
