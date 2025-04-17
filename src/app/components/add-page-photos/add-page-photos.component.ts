import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AlbumStore } from './../../store/albums.store';
import { Page, Pages, PhotoConfig } from './../../../types';
import { FileDir, Proportion } from '../../../types';
import { PagePreviewComponent } from '../page-preview/page-preview.component';

@Component({
    selector: 'app-add-page-photos',
    imports: [PagePreviewComponent],
    templateUrl: './add-page-photos.component.html',
    styleUrl: './add-page-photos.component.css',
})
export class AddPagePhotosComponent implements OnInit {
    readonly albumStore = inject(AlbumStore);
    dialogRef = inject<DialogRef<Page>>(DialogRef<any>);
    data: { photos: Set<FileDir>; albumId: string } = inject(DIALOG_DATA);
    landscapePhotos = signal(0);
    portraitPhotos = signal(0);
    imageOrder = signal<Array<Proportion>>([]);
    suggestedPages = signal<Pages>([]);

    async ngOnInit() {
        await this.getSuggestedPages();
    }

    async getSuggestedPages() {
        await this.getProportions();

        const photos = Array.from(this.data.photos);
        const pages = [];
        const templates = this.albumStore.templates().flat().flat();

        for (let template of templates) {
            const { name, order } = template;
            const [nPhotos, , , nLandscapePhotos, nPortraitPhotos] =
                name.split('-');
            let isTemplateValid =
                Number(nPhotos) === photos.length &&
                (Number(nLandscapePhotos) === this.landscapePhotos() ||
                    Number(nPortraitPhotos) === this.portraitPhotos() ||
                    order.every((prop) => prop === 's'));

            if (isTemplateValid) {
                let page = {
                    template: name,
                    photos: this.getSortedPhotosInTemplate(
                        order,
                        this.imageOrder(),
                        photos,
                    ),
                };

                pages.push(page);
            }
        }

        this.suggestedPages.set(pages);
    }

    async getProportions() {
        for await (const file of this.data.photos) {
            const proportion = await this.getImageProportion(
                `assets/albums/${this.data.albumId}${file.path}/${file.name}`,
            );

            if (proportion === 'l') {
                this.landscapePhotos.update((count) => count + 1);
            } else {
                this.portraitPhotos.update((count) => count + 1);
            }

            this.imageOrder.update((order) => {
                return [...order, proportion];
            });
        }
    }

    getImageProportion(url: string): Promise<Proportion> {
        return new Promise((resolve) => {
            const img = new Image(); // Creates an image in memory
            img.src = url;
            let proportion: Proportion = 's';

            img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;

                if (width > height) {
                    proportion = 'l';
                } else if (height > width) {
                    proportion = 'p';
                }

                resolve(proportion);
            };
        });
    }

    getSortedPhotosInTemplate(
        templateOrder: Proportion[],
        photosOrder: Proportion[],
        photos: FileDir[],
    ): PhotoConfig[] {
        const sortedPhotos: PhotoConfig[] = [];
        const photoOrderCopy: Array<Proportion | null> = [...photosOrder];

        if (templateOrder.every((prop) => prop === 's')) {
            return photos.map((photo) => {
                return {
                    path: photo.path,
                    fileName: photo.name,
                    styles: [],
                };
            });
        }

        for (let prop of templateOrder) {
            const index = photoOrderCopy.indexOf(prop);
            const photo = {
                path: photos[index].path,
                fileName: photos[index].name,
                styles: [],
            };
            sortedPhotos.push(photo);
            photoOrderCopy[index] = null;
        }

        return sortedPhotos;
    }

    selectTemplate(page: Page) {
        this.dialogRef.close(page);
    }
}
