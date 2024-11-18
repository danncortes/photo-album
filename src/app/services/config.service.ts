import { Injectable, signal, WritableSignal } from '@angular/core';
import { AlbumsConfig, Page, PhotoConfig } from '../../types';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    config: WritableSignal<AlbumsConfig | null> = signal(null);
    initialTemplates: string[][] = [
        ['1'],
        ['2-1-1', '2-1-2'],
        ['3-1-1', '3-1-2', '3-1-3', '3-1-4'],
        ['3-2-1', '3-2-2', '3-2-3', '3-2-4'],
        ['4-1'],
        ['4-2-1', '4-2-2', '4-2-3', '4-2-4'],
        ['4-3-1', '4-3-2', '4-3-3', '4-3-4'],
        ['5-1-1', '5-1-2', '5-1-3', '5-1-4'],
        ['5-2-1', '5-2-2', '5-2-3', '5-2-4'],
        ['5-3-1', '5-3-2', '5-3-3', '5-3-4', '5-3-5'],
        ['6-1-1', '6-1-2'],
    ];
    templates: WritableSignal<string[][]> = signal(this.initialTemplates);

    constructor(private http: HttpClient) {}

    getConfig() {
        this.http
            .get('http://localhost:3333/config/get')
            .subscribe((response) => {
                this.config.set(response as AlbumsConfig);
            });
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

        this.config.set({ ...this.config()! });
        this.saveConfig();
    }

    removePhoto({
        albumIndex,
        pageIndex,
        photoIndex,
        photo,
    }: {
        albumIndex: number;
        pageIndex: number;
        photoIndex: number;
        photo: PhotoConfig;
    }) {
        this.config()!.albums[albumIndex].pages[pageIndex].photos[photoIndex] =
            {
                ...this.config()!.albums[albumIndex].pages[pageIndex].photos[
                    photoIndex
                ],
                fileName: '',
                folder: '',
                styles: [],
            };

        this.config()!.albums[albumIndex].photosDicc[photo.folder][
            photo.fileName
        ].pages = this.config()!.albums[albumIndex].photosDicc[photo.folder][
            photo.fileName
        ].pages.filter((page) => page !== pageIndex);

        this.config.set({ ...this.config()! });
        this.saveConfig();
    }

    saveConfig() {
        console.log('Saving config...', this.config());
        this.http
            .post('http://localhost:3333/config/save', {
                config: this.config(),
            })
            .subscribe(() => {
                console.log('Config saved');
            });
    }
}
