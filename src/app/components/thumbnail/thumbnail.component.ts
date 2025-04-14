import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-thumbnail',
    imports: [CdkMenuTrigger, CdkMenu, CdkMenuItem],
    templateUrl: './thumbnail.component.html',
    styleUrl: './thumbnail.component.css',
})
export class ThumbnailComponent implements OnInit {
    path = input.required<string>();
    name = input.required<string>();
    pages = input.required<number[]>();
    readonly albumStore = inject(AlbumStore);
    src = signal('');
    isThumbnailLoading = signal(false);

    async ngOnInit(): Promise<void> {
        this.loadThumbNail();
    }

    async loadThumbNail() {
        this.isThumbnailLoading.set(true);

        const { id } = this.albumStore.activeAlbum()!;
        const src = await this.getThumbnailSrc(
            `assets/albums/${id}${this.path()}/${this.name()}`,
        );
        this.isThumbnailLoading.set(false);
        this.src.set(src);
    }

    getThumbnailSrc(
        imageUrl: string,
        maxWidth: number = 300,
        maxHeight: number = 200,
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous'; // Avoid CORS issues if loading from another domain
            img.onload = () => {
                // Create a canvas element
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw the image on canvas
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Convert canvas to a smaller base64 image
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Adjust quality (0.7 = 70%)
                } else {
                    reject('Canvas context is not supported');
                }
            };
            img.src = imageUrl;

            img.onerror = (error) => reject(error);
        });
    }

    getPagesPerThumbnail(pages: number[]): string {
        return pages.map((page) => page + 1).join(',');
    }

    getPagesOptions(pagesPerThumbnail: number[]): boolean[] | undefined {
        return this.albumStore
            .activeAlbum()!
            .pages.map((page, index) => pagesPerThumbnail.includes(index));
    }

    addPhotoToPage({
        pageIndex,
        fileName,
    }: {
        pageIndex: number;
        fileName: string;
    }) {
        this.albumStore.addPhoto({
            pageIndex,
            fileName,
            folderName: this.path(),
        });
    }
}
