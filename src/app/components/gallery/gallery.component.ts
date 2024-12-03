import { NgFor } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { Album, GroupedDictionary, PhotoInPage } from '../../../types';
import { ConfigService } from '../../services/config.service';
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

    constructor(public configService: ConfigService) {}

    photosArray = computed<[string, PhotoInPage][]>(() => {
        if (this.album().isGrouped) {
            if (this.activeFolder()) {
                return Object.entries(
                    this.album().photosDictionary[this.activeFolder()!],
                );
            }
            return [];
        } else {
            return Object.entries(this.album().photosDictionary);
        }
    });

    getGroupedDictionary(): GroupedDictionary {
        return this.album().photosDictionary as GroupedDictionary;
    }
}
