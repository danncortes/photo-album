import { NgFor } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import {
    Album,
    GroupedDictionary,
    PhotoInPage,
    PhotosDictionary,
} from '../../../types';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import { FolderComponent } from '../folder/folder.component';

@Component({
    selector: 'app-gallery',
    standalone: true,
    imports: [NgFor, ThumbnailComponent, FolderComponent],
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
    album = input.required<Album>();
    activeFolder = input.required<string | null>();

    constructor() {}

    thumbnails = computed<[string, PhotoInPage][]>(() => {
        let thumbnails: PhotosDictionary;

        if (this.album().isGrouped) {
            if (this.activeFolder()) {
                thumbnails = this.album().photosDictionary[
                    this.activeFolder()!
                ] as PhotosDictionary;
            } else {
                return [];
            }
        } else {
            thumbnails = this.album().photosDictionary as PhotosDictionary;
        }

        return Object.entries(thumbnails);
    });

    getGroupedDictionary(): GroupedDictionary {
        return this.album().photosDictionary as GroupedDictionary;
    }
}
