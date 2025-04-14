import { patchState } from '@ngrx/signals';

import { Album, AlbumPreview, Directory } from '../../types';
import { Store } from './albums.store';
import { ConfigService } from '../services/config.service';
import { forkJoin } from 'rxjs';

export const setIsPreviewAlbumLoading = (isLoading: boolean, store: Store) => {
    patchState(store, (state) => ({
        ...state,
        isAlbumPreviewLoading: isLoading,
    }));
};

export const setIsAlbumLoading = (isLoading: boolean, store: Store) => {
    patchState(store, (state) => ({
        ...state,
        isActiveAlbumLoading: isLoading,
    }));
};

export const getAlbumsPreview = (
    configService: ConfigService,
    store: Store,
) => {
    setIsPreviewAlbumLoading(true, store);

    configService.getAlbums().subscribe({
        next: (previewAlbums) => {
            patchState(store, (state) => ({
                ...state,
                albumsPreview: previewAlbums as AlbumPreview[],
            }));
        },
        error: (error) => {
            console.error(error);
        },
        complete: () => {
            setIsPreviewAlbumLoading(false, store);
        },
    });
};

export const setActiveFolder = (folder: string | null, store: Store) => {
    patchState(store, (state) => ({
        ...state,
        activeAlbum: {
            ...state.activeAlbum!,
            activeFolder: folder,
        },
    }));
};

export const getAlbumAndDirectory = (
    albumId: string,
    configService: ConfigService,
    store: Store,
) => {
    setIsAlbumLoading(true, store);

    forkJoin([
        configService.getAlbumDirectory(albumId),
        configService.getAlbum(albumId),
    ]).subscribe({
        next: ([albumDirectory, album]) => {
            patchState(store, (state) => ({
                ...state,
                albumDirectory: albumDirectory as Directory,
                activeAlbum: album as Album,
            }));
        },
        error: (error) => {
            console.error(error);
        },
        complete: () => {
            setIsAlbumLoading(false, store);
        },
    });
};

export const clearAlbum = (store: Store) => {
    patchState(store, (state) => ({
        ...state,
        activeAlbum: null,
    }));
};
