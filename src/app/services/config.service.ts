import { inject, Injectable } from '@angular/core';
import { Album } from '../../types';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    http = inject(HttpClient);
    router = inject(Router);

    getAlbums() {
        return this.http.get('http://localhost:3333/albums');
    }

    getAlbumDirectory(albumId: string) {
        return this.http.get(
            `http://localhost:3333/album/directory/${albumId}`,
        );
    }

    getAlbum(albumId: string) {
        return this.http.get(`http://localhost:3333/album/${albumId}`);
    }

    createAlbum(album: Album) {
        return this.http.post('http://localhost:3333/album/create', {
            data: album,
        });
    }

    saveAlbum(album: Album) {
        return this.http.post('http://localhost:3333/album/save', {
            config: album,
        });
    }

    test(val: any) {
        console.log('🚀 ~ ConfigService ~ test ~ val', val);
    }
}
