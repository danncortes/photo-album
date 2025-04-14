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
        const { path, fileName } = photo;
        return `assets/albums/${this.albumId()}${path}/${fileName}`;
    }
}
