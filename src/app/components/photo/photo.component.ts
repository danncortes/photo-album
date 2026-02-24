import { Component, computed, inject, input } from '@angular/core';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgFor } from '@angular/common';

import { PhotoConfig, ShiftDirection } from '../../../types';
import { AlbumStore } from '../../store/albums.store';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'app-photo',
    imports: [NgFor, CdkMenu, CdkMenuTrigger, IconComponent],
    templateUrl: './photo.component.html',
    styleUrl: './photo.component.css',
    host: {
        class: 'overflow-hidden cursor-pointer bg-gray-200 relative',
        '[style.border-radius.mm]': 'resolvedBorderRadius()',
    },
})
export class PhotoComponent {
    photo = input.required<PhotoConfig>();
    photoIndex = input.required<number>();
    pageIndex = input.required<number>();
    pagesPhotosLength = input.required<number>();
    borderRadius = input<number>(0);
    readonly albumStore = inject(AlbumStore);

    resolvedBorderRadius = computed(() => {
        return this.photo().photoBorderRadius ?? this.borderRadius();
    });

    alignmentOptions = ['top', 'bottom', 'right', 'left'];
    shiftOptions: ShiftDirection[] = [-1, 1];

    getPhotoSrc(photo: PhotoConfig) {
        const { path, fileName } = photo;
        const { id } = this.albumStore.activeAlbum()!;
        return `assets/albums/${id}${path}/${fileName}`;
    }

    getImgStyles(styles: string[]): string {
        if (styles) {
            return styles.join(';');
        }
        return '';
    }

    removePhoto(photoIndex: number, photo: PhotoConfig) {
        this.albumStore.removePhoto({
            pageIndex: this.pageIndex(),
            photoIndex,
            photo,
        });
    }

    togglePhotoAlignment({
        photoIndex,
        alignment,
    }: {
        photoIndex: number;
        alignment: string;
    }) {
        this.albumStore.alignPhoto({
            pageIndex: this.pageIndex(),
            photoIndex,
            alignment,
        });
    }

    shiftPhotoPosition({
        photoIndex,
        direction,
    }: {
        photoIndex: number;
        direction: ShiftDirection;
    }) {
        this.albumStore.shiftPhotoPosition({
            pageIndex: this.pageIndex(),
            photoIndex,
            direction,
        });
    }

    isShiftDisabled(direction: number, photoIndex: number): boolean {
        return (
            (direction === -1 && photoIndex === 0) ||
            (direction === 1 && photoIndex === this.pagesPhotosLength() - 1)
        );
    }

    updateBorderRadius(value: string) {
        const numValue = Number(value);
        this.albumStore.updatePhotoBorderRadius({
            pageIndex: this.pageIndex(),
            photoIndex: this.photoIndex(),
            borderRadius: isNaN(numValue) ? undefined : numValue,
        });
    }

    clearBorderRadius() {
        this.albumStore.updatePhotoBorderRadius({
            pageIndex: this.pageIndex(),
            photoIndex: this.photoIndex(),
            borderRadius: undefined,
        });
    }

    isAlignmentActive({ alignment }: { alignment: string }) {
        const objectPosition = this.photo().styles.find((style) =>
            style.includes('object-position'),
        );
        return !!objectPosition?.includes(alignment);
    }

    trackByFn(i: number) {
        return i;
    }
}
