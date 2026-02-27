import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Section, SectionsConfig } from '../../../types';

@Component({
    selector: 'app-page-index',
    imports: [CommonModule],
    templateUrl: './page-index.component.html',
})
export class PageIndexComponent {
    totalPages = input.required<number>();
    sections = input<SectionsConfig | undefined>(undefined);

    pageColors = computed(() => {
        const config = this.sections();
        if (!config?.sections?.length) return null;
        return Array.from({ length: this.totalPages() }, (_, i) =>
            this.getSectionColors(config.sections, i),
        );
    });

    scrollToPage(pageIndex: number): void {
        const pageElement = document.getElementById(`page-${pageIndex}`);
        if (pageElement) {
            pageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }

    private getSectionColors(
        sections: Section[],
        pageIndex: number,
    ): { backgroundColor: string; color: string } | null {
        const section = sections.find(
            (s) => pageIndex >= s.from && pageIndex <= s.to,
        );
        if (!section) return null;
        return {
            backgroundColor: section.color,
            color: section.fontColor ?? '#000000',
        };
    }
}
