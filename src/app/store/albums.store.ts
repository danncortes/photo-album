import {
    signalStore,
    withComputed,
    withMethods,
    withState,
    WritableStateSource,
} from '@ngrx/signals';
import { computed, effect, ElementRef, inject } from '@angular/core';

import { ConfigService } from '../services/config.service';
import {
    checkAndGetAlbum,
    clearAlbum,
    getAlbumsPreview,
    setActiveFolder,
    setIsPreviewAlbumLoading,
} from './album-store.methods';
import { Album, AlbumPreview, GroupedAlbum, PageStyles } from '../../types';
import {
    addPage,
    addPageDivElement,
    addPhoto,
    AddPhotoParams,
    alignPhoto,
    AlignPhotoParams,
    changePageTemplate,
    clearPageDivElements,
    downloadAlbumPage,
    downloadAlbumPages,
    removePage,
    removePhoto,
    RemovePhotoParams,
    shiftPagePosition,
    ShiftPagePositionParams,
    shiftPhotoPosition,
    ShiftPhotoPositionParams,
    updatePageSettings,
} from './page-store.methods';

export type Store = WritableStateSource<AlbumState>;

export type AlbumState = {
    albumsPreview: AlbumPreview[];
    activeAlbum: Album | null;
    isAlbumPreviewLoading: boolean;
    isActiveAlbumLoading: boolean;
    templates: string[][][];
    pageDivElements: ElementRef<HTMLElement>[];
};

const initialState: AlbumState = {
    albumsPreview: [],
    activeAlbum: null,
    isAlbumPreviewLoading: false,
    isActiveAlbumLoading: false,
    pageDivElements: [],
    /* template Structure e.g.
        5-1-1-3-0-2
        [nPhotos]-[id]-[variant]-[nHorizontalPhotos]-[nVerticalPhotos]-[nSquarePhotos]
    */
    templates: [
        [['1-1-1-0-0-1']],
        [['2-1-1-2-0-0', '2-1-2-0-2-0']],
        [
            ['3-1-1-3-0-0', '3-1-2-0-3-0', '3-1-3-3-0-0', '3-1-4-0-3-0'],
            ['3-2-1-3-0-0', '3-2-2-0-3-0', '3-2-3-3-0-0', '3-2-4-0-3-0'],
            [
                '3-3-1-2-1-0',
                '3-3-2-2-1-0',
                '3-3-3-1-2-0',
                '3-3-4-1-2-0',
                '3-3-5-1-2-0',
                '3-3-6-1-2-0',
                '3-3-7-2-1-0',
                '3-3-8-2-1-0',
            ],
        ],
        [
            ['4-1-1-0-0-4'],
            ['4-2-1-2-2-0', '4-2-2-2-2-0', '4-2-3-2-2-0', '4-2-4-2-2-0'],
            ['4-3-1-2-2-0', '4-3-2-2-2-0', '4-3-3-2-2-0', '4-3-4-2-2-0'],
            ['4-4-1-0-1-3', '4-4-2-1-0-3', '4-4-3-0-1-3', '4-4-4-1-0-3'],
        ],
        [
            ['5-1-1-2-3-0', '5-1-2-3-2-0', '5-1-3-2-3-0', '5-1-4-3-2-0'],
            ['5-2-1-3-0-2', '5-2-2-0-3-2', '5-2-3-3-0-2', '5-2-4-0-3-2'],
            ['5-3-1-1-4-0', '5-3-2-4-1-0', '5-3-3', '5-3-4', '5-3-5-1-4-0'],
        ],
        [['6-1-1-0-6-0', '6-1-2-6-0-0']],
        [['7-1-1-2-5-0', '7-1-2']],
        [['8-1-1', '8-1-2']],
    ],
};

export const AlbumStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed((store) => ({
        isAppLoading: computed(
            () => store.isAlbumPreviewLoading() || store.isActiveAlbumLoading(),
        ),
        galleryPhotos: computed(() => {
            const album = store.activeAlbum();

            if (album) {
                if (album.isGrouped && album.activeFolder) {
                    return album.photosDictionary[album.activeFolder];
                } else {
                    return album.photosDictionary;
                }
            } else {
                return null;
            }
        }),
        activeFolder: computed(() => {
            const activeAlbum = store.activeAlbum();
            if (activeAlbum) {
                return (activeAlbum as GroupedAlbum).activeFolder;
            } else {
                return null;
            }
        }),
        thumbnails: computed(() => {
            const activeAlbum = store.activeAlbum();

            if (activeAlbum) {
                if (activeAlbum.isGrouped) {
                    if (activeAlbum.activeFolder) {
                        return activeAlbum.photosDictionary[
                            activeAlbum.activeFolder
                        ];
                    }
                    return {};
                } else {
                    return activeAlbum.photosDictionary;
                }
            }
            return {};
        }),
    })),
    withMethods((store, configService = inject(ConfigService)) => {
        const saveAlbum = (album: Album) => {
            configService.saveAlbum(album);
        };
        effect(() => {
            const activeAlbum = store.activeAlbum();
            if (activeAlbum) {
                saveAlbum(activeAlbum);
            }
        });

        return {
            createAlbum: (album: Album) => configService.createAlbum(album),
            setIsPreviewAlbumLoading: (isLoading: boolean) =>
                setIsPreviewAlbumLoading(isLoading, store),
            getAlbumsPreview: () => getAlbumsPreview(configService, store),
            checkAndGetAlbum: (albumId: string) =>
                checkAndGetAlbum(albumId, configService, store),
            setActiveFolder: (folder: string | null) =>
                setActiveFolder(folder, store),
            clearPageDivElements: () => clearPageDivElements(store),
            clearAlbum: () => clearAlbum(store),
            // Page Methods
            addPageDivElement: (pageDivElement: ElementRef<HTMLElement>) =>
                addPageDivElement(pageDivElement, store),
            addPage: (template: string) => addPage(template, store),
            downloadAlbumPages: async (albumName: string) =>
                await downloadAlbumPages(albumName, store.pageDivElements()),
            downloadAlbumPage: async (
                divElement: ElementRef<HTMLElement>,
                fileName: string,
            ) => downloadAlbumPage(divElement, fileName),
            changePageTemplate: ({
                pageIndex,
                template,
            }: {
                pageIndex: number;
                template: string;
            }) => changePageTemplate({ pageIndex, template, store }),
            removePage: (index: number) => removePage(index, store),
            shiftPagePosition: ({
                pageIndex,
                direction,
            }: ShiftPagePositionParams) =>
                shiftPagePosition(
                    {
                        pageIndex,
                        direction,
                    },
                    store,
                ),
            updatePageSettings: ({
                pageStyles,
                pageIndex,
            }: {
                pageStyles: PageStyles;
                pageIndex: number;
            }) =>
                updatePageSettings(
                    {
                        pageStyles,
                        pageIndex,
                    },
                    store,
                ),
            alignPhoto: (alignPhotoParams: AlignPhotoParams) =>
                alignPhoto(alignPhotoParams, store),
            removePhoto: (removePhotoParams: RemovePhotoParams) =>
                removePhoto(removePhotoParams, store),
            shiftPhotoPosition: (
                shiftPhotoPositionParams: ShiftPhotoPositionParams,
            ) => shiftPhotoPosition(shiftPhotoPositionParams, store),
            addPhoto: (addPhotoParams: AddPhotoParams) =>
                addPhoto(addPhotoParams, store),
        };
    }),
);
