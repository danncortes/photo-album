import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-page-index',
    imports: [CommonModule],
    templateUrl: './page-index.component.html',
})
export class PageIndexComponent {
    totalPages = input.required<number>();

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
}
