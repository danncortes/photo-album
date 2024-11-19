import { KeyValuePipe, NgFor } from '@angular/common';
import { Component, input } from '@angular/core';
import { GroupedDicc } from '../../../types';
import { ConfigService } from '../../services/config.service';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

@Component({
    selector: 'app-gallery',
    standalone: true,
    imports: [NgFor, KeyValuePipe, CdkMenuTrigger, CdkMenu, CdkMenuItem],
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
    photos = input.required<GroupedDicc>();
    url = input.required();

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
        return this.configService.pages
            .getValue()!
            .map((page, index) => pagesPerThumbnail.includes(index));
    }

    getPagesPerThumbnail(pages: number[]): string {
        return pages.map((page) => page + 1).join(',');
    }

    addPhotoToPage({
        folderName,
        pageIndex,
        fileName,
    }: {
        folderName: string;
        pageIndex: number;
        fileName: string;
    }) {
        this.configService.addPhoto({
            pageIndex,
            fileName,
            folderName,
        });
    }
}
