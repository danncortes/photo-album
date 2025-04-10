import { Component, input } from '@angular/core';
import { Page, PhotoConfig } from '../../../types';

@Component({
    selector: 'app-page-preview',
    imports: [],
    templateUrl: './page-preview.component.html',
    styleUrl: './page-preview.component.css',
})
export class PagePreviewComponent {
    page = input.required<Page>();
    albumId = input.required<string>();

    getPhotoSrc(photo: PhotoConfig) {
        const subFolder = photo.folder ? `/${photo.folder}` : '';
        return `assets/albums/${this.albumId()}${subFolder}/${photo.fileName}`;
    }
}
