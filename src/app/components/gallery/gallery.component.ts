import { KeyValuePipe, NgFor } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { GroupedDicc, PhotoInPage } from '../../../types';
import { MatMenuModule } from '@angular/material/menu';
import { ConfigService } from '../../services/config.service';

type PhotosArray = [
    string,
    {
        [key: string]: PhotoInPage;
    },
][];

@Component({
    selector: 'app-gallery',
    standalone: true,
    imports: [NgFor, KeyValuePipe, MatMenuModule],
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
    photos = input.required<GroupedDicc>();
    url = input.required();
    albumIndex = input.required<number>();
    photosArray = computed<PhotosArray>(() => Object.entries(this.photos()));

    constructor(private configService: ConfigService) {}

    getImgSrc({
        fileName,
        folder,
    }: {
        fileName: string;
        folder: string;
    }): string {
        return `${this.url()}/${folder}/${fileName}`;
    }

    getPagesOptions(pagesPerThumbnail: number[]): boolean[] | undefined {
        return this.configService
            .config()
            ?.albums[
                this.albumIndex()
            ].pages.map((page, index) => pagesPerThumbnail.includes(index));
    }

    getPagesPerThumbnail(pages: number[]): string {
        return pages.map((page) => page + 1).join(',');
    }

    addPhotoToPage({
        groupName,
        pageIndex,
        fileName,
    }: {
        groupName: string;
        pageIndex: number;
        fileName: string;
    }) {
        this.configService.addPhoto({
            albumIndex: this.albumIndex(),
            pageIndex,
            fileName,
            groupName,
        });
    }
}
