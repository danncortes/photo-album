import { Component, computed, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { AlbumStore } from '../../store/albums.store';
import { TemplatesComponent } from '../templates/templates.component';
import { PageSelectComponent } from '../page-select/page-select.component';

export type AddPageResult = {
    template: string;
    afterPageIndex: number;
};

@Component({
    selector: 'app-add-page',
    imports: [TemplatesComponent, PageSelectComponent],
    templateUrl: './add-page.component.html',
    host: {
        class: 'block',
    },
})
export class AddPageComponent {
    private dialogRef = inject<DialogRef<AddPageResult>>(DialogRef);
    private albumStore = inject(AlbumStore);
    data = inject(DIALOG_DATA);

    pages = computed(() => this.albumStore.activeAlbum()?.pages ?? []);
    afterPageIndex = signal<number>(this.pages().length - 1);

    constructor() {
        this.afterPageIndex.set(this.pages().length - 1);
        this.interceptTemplateSelection();
    }

    onPagePositionChange(value: number) {
        this.afterPageIndex.set(value);
    }

    private interceptTemplateSelection() {
        const originalClose = this.dialogRef.close.bind(this.dialogRef);
        this.dialogRef.close = ((result?: unknown) => {
            if (typeof result === 'string') {
                originalClose({
                    template: result,
                    afterPageIndex: this.afterPageIndex(),
                });
            } else {
                originalClose(result as AddPageResult);
            }
        }) as typeof this.dialogRef.close;
    }
}
