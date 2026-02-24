import { Component, computed, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { ConfigService } from '../../services/config.service';
import { AlbumStore } from '../../store/albums.store';
import { Page } from '../../../types';

const TEMPLATE_HEIGHT_PX = 50;

@Component({
    selector: 'app-templates',
    imports: [NgFor],
    templateUrl: './templates.component.html',
    styleUrl: './templates.component.css',
    host: {
        class: 'h-full overflow-y-auto',
    },
})
export class TemplatesComponent {
    dialogRef = inject<DialogRef<string>>(DialogRef<Page>);
    data = inject(DIALOG_DATA);
    private albumStore = inject(AlbumStore);

    templateWidth = computed(() => {
        const settings = this.albumStore.activeAlbum()?.settings;
        if (!settings?.format?.width || !settings?.format?.height) {
            return TEMPLATE_HEIGHT_PX + 'px';
        }
        const ratio = settings.format.width / settings.format.height;
        return Math.round(TEMPLATE_HEIGHT_PX * ratio) + 'px';
    });

    constructor(public configService: ConfigService) {}

    getPhotosNumber(templateNum: string) {
        return new Array(Number(templateNum.split('-')[0]));
    }

    selectTemplate(template: string) {
        this.dialogRef.close(template);
    }
}
