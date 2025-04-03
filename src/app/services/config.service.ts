import {
    computed,
    ElementRef,
    inject,
    Injectable,
    signal,
    WritableSignal,
} from '@angular/core';
import {
    Album,
    AlbumPreview,
    GroupedDictionary,
    PhotosDictionary,
    ShiftDirection,
} from '../../types';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    http = inject(HttpClient);
    router = inject(Router);

    getAlbums() {
        return firstValueFrom(this.http.get('http://localhost:3333/albums'));
    }

    checkAlbum(albumId: string) {
        return firstValueFrom(
            this.http.get(`http://localhost:3333/album/check/${albumId}`),
        );
    }

    getAlbum(albumId: string) {
        return firstValueFrom(
            this.http.get(`http://localhost:3333/album/${albumId}`),
        );
    }

    createAlbum(album: Album) {
        return this.http.post('http://localhost:3333/album/create', {
            data: album,
        });
    }

    saveAlbum(album: Album) {
        this.http
            .post('http://localhost:3333/album/save', {
                config: album,
            })
            .subscribe(() => {
                console.log('Config saved');
            });
    }

    test(val: any) {
        console.log('🚀 ~ ConfigService ~ test ~ val', val);
    }
}
