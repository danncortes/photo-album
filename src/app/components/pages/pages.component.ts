import {
    Component,
    inject,
    signal,
    effect,
    ElementRef,
    viewChild,
    HostListener,
    AfterViewInit,
    viewChildren,
} from '@angular/core';

import { PageComponent } from '../page/page.component';
import { PageIndexComponent } from '../page-index/page-index.component';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-pages',
    imports: [PageComponent, PageIndexComponent],
    templateUrl: './pages.component.html',
    styleUrl: './pages.component.css',
    host: {
        class: ' w-screen flex flex-col',
    },
})
export class PagesComponent implements AfterViewInit {
    readonly albumStore = inject(AlbumStore);
    readonly pagesContainer = viewChild<ElementRef>('pagesContainer');
    readonly pageContainers = viewChildren<ElementRef>('pageContainer');
    showPageIndex = signal(false);

    ngAfterViewInit(): void {
        if (this.albumStore.activeAlbum()) {
            this.checkPagesVisibility();
        }
    }

    private checkPagesVisibility(): void {
        const container = this.pagesContainer()?.nativeElement;
        const hasHiddenPages = this.pageContainers().some(
            (pageEl: ElementRef) => {
                const containerRect = container.getBoundingClientRect();
                const pageRect = pageEl.nativeElement.getBoundingClientRect();

                return (
                    pageRect.left < containerRect.left ||
                    pageRect.right > containerRect.right
                );
            },
        );

        this.showPageIndex.set(hasHiddenPages);
    }

    @HostListener('window:resize')
    onResize() {
        this.checkPagesVisibility();
    }
}
