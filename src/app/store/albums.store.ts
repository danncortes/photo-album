import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState,
    WritableStateSource,
} from '@ngrx/signals';
import { computed, effect, ElementRef, inject } from '@angular/core';

import { ConfigService } from '../services/config.service';
import {
    getAlbumAndDirectory,
    clearAlbum,
    getAlbumsPreview,
    setActiveFolder,
    setIsPreviewAlbumLoading,
} from './album-store.methods';
import {
    Album,
    AlbumPreview,
    Directory,
    FileDir,
    Page,
    PageStyles,
    PhotosDictionary,
    Template,
} from '../../types';
import {
    addPage,
    addPageDivElement,
    addPageWithPhotos,
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
    albumDirectory: Directory;
    isAlbumPreviewLoading: boolean;
    isActiveAlbumLoading: boolean;
    templates: Template[][][];
    pageDivElements: ElementRef<HTMLElement>[];
    updatedAlbumStatus: string | null;
    selectedPhotos: Set<FileDir>;
};

const initialState: AlbumState = {
    albumsPreview: [],
    activeAlbum: null,
    albumDirectory: [],
    isAlbumPreviewLoading: false,
    isActiveAlbumLoading: false,
    pageDivElements: [],
    updatedAlbumStatus: null,
    selectedPhotos: new Set(),
    /* template Structure e.g.
        5-1-1-3-0-2
        [nPhotos]-[id]-[variant]-[nHorizontalPhotos]-[nVerticalPhotos]
    */
    templates: [
        [[{ name: '1-1-1-1-1', order: ['s'] }]],
        [
            [
                { name: '2-1-1-2-0', order: ['l', 'l'] },
                { name: '2-1-2-0-2', order: ['p', 'p'] },
            ],
        ],
        [
            [
                { name: '3-1-1-3-0', order: ['l', 'l', 'l'] },
                { name: '3-1-2-0-3', order: ['p', 'p', 'p'] },
                { name: '3-1-3-3-0', order: ['l', 'l', 'l'] },
                { name: '3-1-4-0-3', order: ['p', 'p', 'p'] },
            ],
            [
                { name: '3-2-1-3-0', order: ['l', 'l', 'l'] },
                { name: '3-2-2-0-3', order: ['p', 'p', 'p'] },
                { name: '3-2-3-3-0', order: ['l', 'l', 'l'] },
                { name: '3-2-4-0-3', order: ['p', 'p', 'p'] },
            ],
            [
                { name: '3-3-1-2-1', order: ['p', 'l', 'l'] },
                { name: '3-3-2-2-1', order: ['l', 'p', 'l'] },
                { name: '3-3-3-1-2', order: ['l', 'p', 'p'] },
                { name: '3-3-4-1-2', order: ['p', 'l', 'p'] },
                { name: '3-3-5-1-2', order: ['p', 'l', 'p'] },
                { name: '3-3-6-1-2', order: ['p', 'p', 'l'] },
                { name: '3-3-7-2-1', order: ['l', 'p', 'l'] },
                { name: '3-3-8-2-1', order: ['l', 'l', 'p'] },
            ],
        ],
        [
            [{ name: '4-1-1-4-4', order: ['s', 's', 's', 's'] }],
            [
                { name: '4-2-1-2-2', order: ['p', 'l', 'p', 'l'] },
                { name: '4-2-2-2-2', order: ['l', 'l', 'p', 'p'] },
                { name: '4-2-3-2-2', order: ['l', 'p', 'l', 'p'] },
                { name: '4-2-4-2-2', order: ['p', 'p', 'l', 'l'] },
            ],

            [
                { name: '4-3-1-2-2', order: ['p', 'l', 'l', 'p'] },
                { name: '4-3-2-2-2', order: ['p', 'l', 'l', 'p'] },
                { name: '4-3-3-2-2', order: ['l', 'p', 'p', 'l'] },
                { name: '4-3-4-2-2', order: ['l', 'p', 'p', 'l'] },
            ],
            [
                { name: '4-4-1-3-1', order: ['p', 'l', 'l', 'l'] },
                { name: '4-4-2-4-0', order: ['l', 'l', 'l', 'l'] },
                { name: '4-4-3-3-1', order: ['l', 'l', 'l', 'p'] },
                { name: '4-4-4-4-0', order: ['l', 'l', 'l', 'l'] },
            ],
        ],
        [
            [
                { name: '5-1-1-2-3', order: ['l', 'l', 'p', 'p', 'p'] },
                { name: '5-1-2-3-2', order: ['l', 'l', 'l', 'p', 'p'] },
                { name: '5-1-3-2-3', order: ['p', 'p', 'p', 'l', 'l'] },
                { name: '5-1-4-3-2', order: ['p', 'p', 'l', 'l', 'l'] },
            ],
            [
                { name: '5-2-1-2-3', order: ['p', 'p', 'p', 'l', 'l'] },
                { name: '5-2-2-2-3', order: ['p', 'p', 'p', 'l', 'l'] },
                { name: '5-2-3-2-3', order: ['l', 'l', 'p', 'p', 'p'] },
                { name: '5-2-4-2-3', order: ['l', 'l', 'p', 'p', 'p'] },
                { name: '5-2-5-3-2', order: ['p', 'p', 'l', 'l', 'l'] },
                { name: '5-2-6-3-2', order: ['l', 'l', 'l', 'p', 'p'] },
                { name: '5-2-7-3-2', order: ['p', 'p', 'l', 'l', 'l'] },
                { name: '5-2-8-3-2', order: ['l', 'l', 'l', 'p', 'p'] },
            ],
            [
                // Verify
                // { name: '5-3-1-1-4', order: [] },
                // { name: '5-3-2-4-1', order: [] },
                // { name: '5-3-3', order: [] },
                // { name: '5-3-4', order: [] },
                // { name: '5-3-5-1-4', order: [] },
                // { name: '5-3-6-1-4', order: [] },
                // { name: '5-3-7-1-4', order: [] },
                // { name: '5-3-8-1-4', order: [] },
            ],
        ],
        [
            [
                { name: '6-1-1-0-6', order: ['p', 'p', 'p', 'p', 'p', 'p'] },
                { name: '6-1-2-6-0', order: ['l', 'l', 'l', 'l', 'l', 'l'] },
            ],
        ],
        [
            [
                { name: '7-1-1-2-5', order: [] },
                { name: '7-1-2-4-3', order: [] },
                { name: '7-1-3', order: [] },
                { name: '7-1-4', order: [] },
            ],
            [
                { name: '7-2-1-2-5', order: [] },
                { name: '7-2-2', order: [] },
                { name: '7-2-3', order: [] },
                { name: '7-2-4', order: [] },
            ],
        ],
        [
            [
                { name: '8-1-1', order: [] },
                { name: '8-1-2', order: [] },
            ],
        ],
    ],
};

export const AlbumStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed((store) => ({
        isAppLoading: computed(
            () => store.isAlbumPreviewLoading() || store.isActiveAlbumLoading(),
        ),
        photosInPage: computed(() => {
            const photosDicc: PhotosDictionary = {};

            for (let [pageIndex, page] of Object.entries(
                store.activeAlbum()?.pages || [],
            )) {
                for (let photo of page.photos) {
                    if (photo.fileName in photosDicc) {
                        photosDicc[photo.fileName].push(parseInt(pageIndex));
                    } else {
                        photosDicc[photo.fileName] = [parseInt(pageIndex)];
                    }
                }
            }
            return photosDicc;
        }),
    })),
    withMethods((store, configService = inject(ConfigService)) => {
        effect(() => {
            const activeAlbum = store.activeAlbum();
            const updatedAlbumStatus = store.updatedAlbumStatus();

            if (updatedAlbumStatus && activeAlbum) {
                configService.saveAlbum(activeAlbum).subscribe({
                    next: () => {
                        console.log('Album Saved - ', updatedAlbumStatus);
                    },
                    error: (error) => {
                        console.error(updatedAlbumStatus, '- ' + error.message);
                    },
                    complete: () => {
                        patchState(store, (state) => ({
                            ...state,
                            updatedAlbumStatus: null,
                        }));
                    },
                });
            }
        });

        return {
            createAlbum: (album: Album) => configService.createAlbum(album),
            setIsPreviewAlbumLoading: (isLoading: boolean) =>
                setIsPreviewAlbumLoading(isLoading, store),
            getAlbumsPreview: () => getAlbumsPreview(configService, store),
            getAlbumAndDirectory: (albumId: string) =>
                getAlbumAndDirectory(albumId, configService, store),
            setActiveFolder: (folder: string | null) =>
                setActiveFolder(folder, store),
            clearPageDivElements: () => clearPageDivElements(store),
            clearAlbum: () => clearAlbum(store),
            // Page Methods
            addPageDivElement: (pageDivElement: ElementRef<HTMLElement>) =>
                addPageDivElement(pageDivElement, store),
            addPage: (template: string) => addPage(template, store),
            addPageWithPhotos: (page: Page) => addPageWithPhotos(page, store),
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
            togglePhotoSelection: (photo: FileDir) => {
                const selectedPhotos = store.selectedPhotos();
                if (selectedPhotos.has(photo)) {
                    selectedPhotos.delete(photo);
                } else {
                    selectedPhotos.add(photo);
                }
                patchState(store, {
                    selectedPhotos: new Set(Array.from(selectedPhotos)),
                });
            },
            clearSelectedPhotos: () => {
                patchState(store, { selectedPhotos: new Set() });
            },
        };
    }),
);
