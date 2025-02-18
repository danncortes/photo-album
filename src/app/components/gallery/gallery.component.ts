import { NgFor } from '@angular/common';
import { Component, computed } from '@angular/core';

import {
    GroupedDictionary,
    PhotoInPage,
    PhotosDictionary,
} from '../../../types';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import { FolderComponent } from '../folder/folder.component';
import { ConfigService } from '../../services/config.service';

@Component({
    selector: 'app-gallery',
    imports: [NgFor, ThumbnailComponent, FolderComponent],
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
    constructor(public configService: ConfigService) {}

    thumbnails = computed<[string, PhotoInPage][]>(() => {
        let thumbnails: PhotosDictionary;

        if (this.configService.album()!.isGrouped) {
            if (this.configService.activeFolder()) {
                thumbnails = this.configService.album()!.photosDictionary[
                    this.configService.activeFolder()!
                ] as PhotosDictionary;
            } else {
                return [];
            }
        } else {
            thumbnails = this.configService.album()!
                .photosDictionary as PhotosDictionary;
        }
        return Object.entries(thumbnails);
    });

    getGroupedDictionary(): GroupedDictionary {
        return this.configService.album()!
            .photosDictionary as GroupedDictionary;
    }

    trackByFn(i: number) {
        return i;
    }
}
