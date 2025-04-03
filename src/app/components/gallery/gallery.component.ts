import { KeyValuePipe, NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GroupedDictionary } from '../../../types';
import { ThumbnailComponent } from '../thumbnail/thumbnail.component';
import { FolderComponent } from '../folder/folder.component';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-gallery',
    imports: [NgFor, ThumbnailComponent, FolderComponent, KeyValuePipe],
    templateUrl: './gallery.component.html',
    styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
    constructor() {}
    readonly albumStore = inject(AlbumStore);

    getGroupedDictionary(): GroupedDictionary {
        return this.albumStore.activeAlbum()!
            .photosDictionary as GroupedDictionary;
    }

    trackByFn(i: number) {
        return i;
    }
}
