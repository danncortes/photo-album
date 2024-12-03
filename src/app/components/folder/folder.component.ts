import { Component, input } from '@angular/core';
import { KeyValuePipe, NgFor } from '@angular/common';

import { ConfigService } from '../../services/config.service';
import { GroupedDictionary } from '../../../types';

@Component({
    selector: 'app-folder',
    standalone: true,
    imports: [NgFor, KeyValuePipe],
    templateUrl: './folder.component.html',
    styleUrl: './folder.component.scss',
})
export class FolderComponent {
    photosDictionary = input.required<GroupedDictionary>();

    constructor(public configService: ConfigService) {}

    selectFolder(folderName: string) {
        this.configService.selectFolder(folderName);
    }
}
