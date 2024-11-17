import {
    Injectable,
    signal,
    WritableSignal,
    AfterContentInit,
} from '@angular/core';
import config from '../../../config-server/albums-config.json';
import { AlbumsConfig, Page } from '../../types';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ConfigService implements AfterContentInit {
    config: WritableSignal<AlbumsConfig | null> = signal(null);
    initialTemplates: string[][] = [
        ['1'],
        ['2-1', '2-2'],
        ['3-1', '3-1-2', '3-1-3', '3-1-4'],
        ['4-1'],
        ['4-2-1', '4-2-2', '4-2-3', '4-2-4'],
        ['5-1-1', '5-1-2', '5-1-3', '5-1-4'],
    ];
    templates: WritableSignal<string[][]> = signal(this.initialTemplates);

    constructor(private http: HttpClient) {}

    ngAfterContentInit(): void {}

    getConfig() {
        this.config.set(config as AlbumsConfig);
    }

    addPage(albumIndex: number, config: Page) {
        this.config()!.albums[albumIndex].pages.push(config);
        this.config.set({ ...this.config()! });
        this.saveConfig();
    }

    addPhoto({
        albumIndex,
        pageIndex,
        fileName,
        groupName,
    }: {
        albumIndex: number;
        pageIndex: number;
        fileName: string;
        groupName: string;
    }) {
        const photoInPage = this.config()!.albums[albumIndex].pages[
            pageIndex
        ].photos.find((photo) => photo.fileName === '');

        if (photoInPage) {
            photoInPage.fileName = fileName;
            photoInPage.folder = groupName;
        } else {
            this.config()!.albums[albumIndex].pages[pageIndex].photos.push({
                fileName,
                folder: groupName,
                styles: [],
            });
        }

        this.config()?.albums[albumIndex].photosDicc[groupName][
            fileName
        ].pages.push(pageIndex);

        this.saveConfig();
    }

    saveConfig() {
        console.log('Saving config...', this.config());
        this.http
            .post('http://localhost:3333/config/save', {
                config: this.config(),
            })
            .subscribe((response) => {
                console.log('Config saved', response);
            });
    }
}
