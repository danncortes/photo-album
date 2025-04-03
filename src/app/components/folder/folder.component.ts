import { Component, computed, inject, input, Signal } from '@angular/core';
import { KeyValuePipe, NgFor } from '@angular/common';

import { ConfigService } from '../../services/config.service';
import { GroupedAlbum, GroupedDictionary } from '../../../types';
import { AlbumStore } from '../../store/albums.store';

@Component({
    selector: 'app-folder',
    imports: [NgFor, KeyValuePipe],
    templateUrl: './folder.component.html',
    styleUrl: './folder.component.css',
})
export class FolderComponent {
    readonly albumStore = inject(AlbumStore);
    photosDictionary = input.required<GroupedDictionary>();

    constructor(public configService: ConfigService) {}

    selectFolder(folderName: string) {
        this.albumStore.setActiveFolder(folderName);
    }
}
