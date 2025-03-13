import { patchState, WritableStateSource } from '@ngrx/signals';
import { ElementRef } from '@angular/core';

import { Album, AlbumPreview, GroupedAlbum } from '../../types';
import { AlbumState, AlbumStore, Store } from './albums.store';
import { ConfigService } from '../services/config.service';

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

export const getAlbumsPreview = async (
    configService: ConfigService,
    store: Store,
) => {
    try {
        setIsPreviewAlbumLoading(true, store);
        const previewAlbums =
            (await configService.getAlbums()) as AlbumPreview[];
        patchState(store, (state) => ({
            ...state,
            albumsPreview: previewAlbums,
        }));
    } catch (e) {
        console.error(e);
    } finally {
        setIsPreviewAlbumLoading(false, store);
    }
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

export const checkAndGetAlbum = async (
    albumId: string,
    configService: ConfigService,
    store: Store,
) => {
    try {
        setIsAlbumLoading(true, store);
        await configService.checkAlbum(albumId);
        const album = (await configService.getAlbum(albumId)) as Album;

        patchState(store, (state) => ({
            ...state,
            activeAlbum: album,
        }));
    } catch (error) {
        console.error(error);
    } finally {
        setIsAlbumLoading(false, store);
    }
};

export const clearAlbum = (store: Store) => {
    patchState(store, (state) => ({
        ...state,
        activeAlbum: null,
    }));
};
