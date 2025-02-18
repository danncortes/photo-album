import { Component, input } from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

import { ConfigService } from '../../services/config.service';

@Component({
    selector: 'app-thumbnail',
    imports: [CdkMenuTrigger, CdkMenu, CdkMenuItem],
    templateUrl: './thumbnail.component.html',
    styleUrl: './thumbnail.component.scss'
})
export class ThumbnailComponent {
    activeFolder = input<string | null>();
    photo = input.required<[string, { pages: number[] }]>();

    constructor(private configService: ConfigService) {}

    getImgSrc(fileName: string): string {
        const { id } = this.configService.album()!;
        return `assets/albums/${id}${this.activeFolder() ? `/${this.activeFolder()}` : ''}/${fileName}`;
    }

    getPagesPerThumbnail(pages: number[]): string {
        return pages.map((page) => page + 1).join(',');
    }

    getPagesOptions(pagesPerThumbnail: number[]): boolean[] | undefined {
        return this.configService
            .album()!
            .pages.map((page, index) => pagesPerThumbnail.includes(index));
    }

    addPhotoToPage({
        pageIndex,
        fileName,
    }: {
        pageIndex: number;
        fileName: string;
    }) {
        this.configService.addPhoto({
            pageIndex,
            fileName,
            folderName: this.configService.activeFolder(),
        });
    }
}
