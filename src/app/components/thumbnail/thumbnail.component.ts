import { Component, input } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

@Component({
    selector: 'app-thumbnail',
    standalone: true,
    imports: [CdkMenuTrigger, CdkMenu, CdkMenuItem],
    templateUrl: './thumbnail.component.html',
    styleUrl: './thumbnail.component.scss',
})
export class ThumbnailComponent {
    activeFolder = input<string | null>();
    url = input.required<string>();
    photo = input.required<[string, { pages: number[] }]>();

    constructor(private configService: ConfigService) {}

    getImgSrc({ fileName }: { fileName: string }): string {
        return `${this.url()}${this.activeFolder() ? `/${this.activeFolder()}` : ''}/${fileName}`;
    }

    getPagesPerThumbnail(pages: number[]): string {
        return pages.map((page) => page + 1).join(',');
    }

    getPagesOptions(pagesPerThumbnail: number[]): boolean[] | undefined {
        return this.configService.album
            .getValue()!
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
            folderName: this.configService.activeFolder()!,
        });
    }
}
