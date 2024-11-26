import { Component, input } from '@angular/core';
import { PhotoConfig } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu';
import { NgFor } from '@angular/common';

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
    baseUrl = input.required();

    alignmentOptions = ['top', 'bottom', 'right', 'left'];
    shiftOptions = ['◀️', '▶️'];

    constructor(private configService: ConfigService) {}

    getPhotoSrc(photo: PhotoConfig) {
        const { folder, fileName } = photo;
        return `${this.baseUrl()}${folder ? `/${folder}` : ''}/${fileName}`;
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
        shift,
    }: {
        photoIndex: number;
        shift: string;
    }) {
        this.configService.shiftPhotoPosition({
            pageIndex: this.pageIndex(),
            photoIndex,
            shift,
        });
    }

    isAlignmentActive({ alignment }: { alignment: string }) {
        const objectPosition = this.photo().styles.find((style) =>
            style.includes('object-position'),
        );
        return !!objectPosition?.includes(alignment);
    }
}
