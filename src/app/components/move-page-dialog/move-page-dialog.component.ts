import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { Page } from '../../../types';
import { PageSelectComponent } from '../page-select/page-select.component';

export type MovePageDialogData = {
    pages: Page[];
    currentIndex: number;
};

@Component({
    selector: 'app-move-page-dialog',
    imports: [PageSelectComponent],
    template: `
        <div class="flex flex-col gap-4">
            <h3 class="text-sm font-semibold">
                Move page {{ data.currentIndex + 1 }}
            </h3>
            <app-page-select
                [pages]="data.pages"
                [selectedIndex]="targetIndex()"
                [disabledIndex]="data.currentIndex"
                label="After page"
                (selectionChange)="targetIndex.set($event)"
            />
            <div class="flex justify-end gap-2">
                <button
                    class="btn btn-sm btn-ghost"
                    (click)="dialogRef.close()"
                >
                    Cancel
                </button>
                <button
                    class="btn btn-sm btn-primary"
                    [disabled]="targetIndex() === data.currentIndex"
                    (click)="dialogRef.close(targetIndex())"
                >
                    Move
                </button>
            </div>
        </div>
    `,
})
export class MovePageDialogComponent {
    dialogRef = inject<DialogRef<number>>(DialogRef);
    data = inject<MovePageDialogData>(DIALOG_DATA);

    targetIndex = signal<number>(
        this.data.currentIndex === 0 ? 1 : this.data.currentIndex - 1,
    );
}
