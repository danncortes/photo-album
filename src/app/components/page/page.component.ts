import { Component, ElementRef, input, ViewChild } from '@angular/core';
import domtoimage from 'dom-to-image-more';
import { Page, PhotoConfig } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-page',
    standalone: true,
    imports: [MatMenuModule],
    templateUrl: './page.component.html',
    styleUrl: './page.component.scss',
})
export class PageComponent {
    page = input.required<Page>();
    baseUrl = input.required();
    albumIndex = input.required<number>();
    pageIndex = input.required<number>();

    constructor(private configService: ConfigService) {}

    getPhotoSrc(photo: PhotoConfig) {
        const { folder, fileName } = photo;
        return `${this.baseUrl()}/${folder}/${fileName}`;
    }

    getImgStyles(styles: string[]): string {
        if (styles) {
            return styles.join(';');
        }
        return '';
    }

    removePhoto(photoIndex: number, photo: PhotoConfig) {
        this.configService.removePhoto({
            albumIndex: this.albumIndex(),
            pageIndex: this.pageIndex(),
            photoIndex,
            photo,
        });
    }

    @ViewChild('captureDiv', { static: false }) captureDiv!: ElementRef;

    capture() {
        const element = this.captureDiv.nativeElement;

        // Set width and height directly for high-resolution output
        domtoimage
            .toPng(element, {
                width: 3550, // Desired output width in pixels
                height: 3550, // Desired output height in pixels
                style: {
                    transform: 'scale(8.87)', // 3550 / 400 = 8.87 (scaling factor)
                    transformOrigin: 'top left',
                },
            })
            .then((dataUrl: string) => {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'high-resolution-capture.png';
                link.click();
            })
            .catch((error: any) => {
                console.error('Failed to capture image', error);
            });
    }
}
