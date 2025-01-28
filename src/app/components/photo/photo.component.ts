import { Component, input } from '@angular/core';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgFor } from '@angular/common';

import { PhotoConfig, ShiftDirection } from '../../../types';
import { ConfigService } from '../../services/config.service';

@Component({
    selector: 'app-photo',
    standalone: true,
    imports: [CdkMenu, CdkMenuTrigger, NgFor],
    templateUrl: './photo.component.html',
    styleUrl: './photo.component.scss',
})
export class PhotoComponent {
    photo = input.required<PhotoConfig>();
    photoIndex = input.required<number>();
    pageIndex = input.required<number>();
    pagesPhotosLength = input.required<number>();

    alignmentOptions = ['top', 'bottom', 'right', 'left'];
    shiftOptions: ShiftDirection[] = ['◀️', '▶️'];

    constructor(private configService: ConfigService) {}

    getPhotoSrc(photo: PhotoConfig) {
        const { folder, fileName } = photo;
        const { id } = this.configService.album()!;
        return `assets/albums/${id}${folder ? `/${folder}` : ''}/${fileName}`;
    }

    getImgStyles(styles: string[]): string {
        if (styles) {
            return styles.join(';');
        }
        return '';
    }

    removePhoto(photoIndex: number, photo: PhotoConfig) {
        this.configService.removePhoto({
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
        this.configService.alignPhoto({
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
        this.configService.shiftPhotoPosition({
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
