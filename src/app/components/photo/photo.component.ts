import { Component, inject, input } from '@angular/core';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgFor } from '@angular/common';

import { PhotoConfig, ShiftDirection } from '../../../types';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-photo',
    imports: [NgFor, CdkMenu, CdkMenuTrigger],
    templateUrl: './photo.component.html',
    styleUrl: './photo.component.scss',
})
export class PhotoComponent {
    photo = input.required<PhotoConfig>();
    photoIndex = input.required<number>();
    pageIndex = input.required<number>();
    pagesPhotosLength = input.required<number>();
    readonly albumStore = inject(AlbumStore);

    alignmentOptions = ['top', 'bottom', 'right', 'left'];
    shiftOptions: ShiftDirection[] = ['◀️', '▶️'];

    getPhotoSrc(photo: PhotoConfig) {
        const { folder, fileName } = photo;
        const { id } = this.albumStore.activeAlbum()!;
        return `assets/albums/${id}${folder ? `/${folder}` : ''}/${fileName}`;
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

    isShiftDisabled(direction: string, photoIndex: number): boolean {
        return (
            (direction === '◀️' && photoIndex === 0) ||
            (direction === '▶️' && photoIndex === this.pagesPhotosLength() - 1)
        );
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
