import { ElementRef } from '@angular/core';
import { WritableStateSource, patchState } from '@ngrx/signals';
import JSZip from 'jszip';
import domtoimage from 'dom-to-image-more';
import { Observable, Subject } from 'rxjs';

import { AlbumState, AlbumStore, Store } from './albums.store';
import {
    Album,
    Page,
    Pages,
    PageStyles,
    PhotoConfig,
    ShiftDirection,
} from '../../types';

export type ShiftPagePositionParams = {
    pageIndex: number;
    direction: ShiftDirection;
};

type BasePhotoParam = {
    pageIndex: number;
    photoIndex: number;
};

export type AlignPhotoParams = BasePhotoParam & {
    alignment: string;
};

export type RemovePhotoParams = BasePhotoParam & {
    photo: PhotoConfig;
};

export type ShiftPhotoPositionParams = BasePhotoParam & {
    direction: ShiftDirection;
};

export type AddPhotoParams = {
    pageIndex: number;
    fileName: string;
    folderName: string;
};

export const clearPageDivElements = (
    store: WritableStateSource<AlbumState>,
) => {
    patchState(store, (state) => ({
        ...state,
        pageDivElements: [],
    }));
};

export const addPageDivElement = (
    pageDivELement: ElementRef<HTMLElement>,
    store: WritableStateSource<AlbumState>,
) => {
    patchState(store, (state) => ({
        ...state,
        pageDivElements: [...state.pageDivElements!, pageDivELement],
    }));
};

export const addPage = (
    template: string,
    store: WritableStateSource<AlbumState>,
) => {
    patchState(store, (state) => {
        const [nPhotos] = template;

        const pages: Pages = [
            ...state.activeAlbum!.pages,
            {
                photos: Array.from({ length: Number(nPhotos) }).map(() => ({
                    fileName: '',
                    path: '',
                    styles: [],
                })),
                template,
            },
        ];

        return {
            ...state,
            activeAlbum: {
                ...state.activeAlbum!,
                pages,
            },
            updatedAlbumStatus: 'Add Page',
        };
    });
};

export const addPageWithPhotos = (
    page: Page,
    store: WritableStateSource<AlbumState>,
) => {
    patchState(store, (state) => {
        const pages: Pages = [...state.activeAlbum!.pages, page];

        return {
            ...state,
            activeAlbum: {
                ...state.activeAlbum!,
                pages,
            },
            updatedAlbumStatus: 'Add Page',
        };
    });
};

const capturePage = (divElement: ElementRef<HTMLElement>) => {
    const element = divElement.nativeElement;
    return domtoimage.toBlob(element, {
        width: 3550, // Desired output width in pixels
        height: 3550, // Desired output height in pixels
        style: {
            transform: 'scale(8.87)', // 3550 / 400 = 8.87 (scaling factor)
            transformOrigin: 'top left',
        },
    });
};

const generatePageImages = async (
    pageDivElements: ElementRef<HTMLElement>[],
) => {
    const images: Blob[] = [];

    for (let i = 0; i < pageDivElements.length; i++) {
        try {
            const blob = await capturePage(pageDivElements[i]);
            images.push(blob);
        } catch (error) {
            console.error(`Error capturing element ${i}:`, error);
        }
    }

    return images;
};

export const downloadAlbumPages = async (
    albumName: string,
    pageDivElements: ElementRef<HTMLElement>[],
) => {
    const images = await generatePageImages(pageDivElements);

    const zip = new JSZip();

    images.forEach((blob, index) => {
        zip.file(`${albumName}-${index + 1}.png`, blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = `${albumName}-images`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
};

export const downloadAlbumPage = async (
    divElement: ElementRef<HTMLElement>,
    fileName: string,
) => {
    const blob = await capturePage(divElement);
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
};

export const changePageTemplate = ({
    pageIndex,
    template,
    store,
}: {
    pageIndex: number;
    template: string;
    store: Store;
}) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;

        const { pages } = album;
        const [newPhotosNumber] = template;
        const [currentPhotosNumber] = pages[pageIndex].template;

        pages[pageIndex].template = template;

        const additionalPhotosNumber =
            Number(newPhotosNumber) - Number(currentPhotosNumber);

        let newPhotosArray = [...pages[pageIndex].photos];

        // If the new template has more photo slots than the current one
        if (additionalPhotosNumber > 0) {
            // Only the necessary amount of empty containers are added to fill the new template
            const photoSlotsToAdd =
                Number(newPhotosNumber) - pages[pageIndex].photos.length;

            if (photoSlotsToAdd > 0) {
                newPhotosArray.push(
                    ...Array.from({
                        length: Number(additionalPhotosNumber),
                    }).map(() => ({
                        fileName: '',
                        path: '',
                        styles: [],
                    })),
                );
            }
        } else if (additionalPhotosNumber < 0) {
            // The number of photos in the current template is gotten
            const photosInPage = pages[pageIndex].photos.filter(
                (photos) => photos.fileName !== '',
            );

            if (photosInPage.length >= Number(newPhotosNumber)) {
                // In case the number of photos is equal or greater than the new slot number template
                // The photos are kept
                newPhotosArray = photosInPage;
            } else {
                // the currents photos are added and the rest empty containers are added
                newPhotosArray = [...photosInPage];
                newPhotosArray.push(
                    ...Array.from({
                        length: Number(
                            Number(newPhotosNumber) - photosInPage.length,
                        ),
                    }).map(() => ({
                        fileName: '',
                        path: '',
                        styles: [],
                    })),
                );
            }
        }

        pages[pageIndex].photos = newPhotosArray;

        return {
            ...state,
            activeAlbum: {
                ...state.activeAlbum!,
                pages,
                updatedAlbumStatus: 'Change Page Template',
            },
        };
    });
};

export const removePage = (pageIndex: number, store: Store) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;

        const { pages } = album;

        pages.splice(pageIndex, 1);

        return {
            ...state,
            updatedAlbumStatus: 'Remove Page',
            activeAlbum: {
                ...album,
                pages,
            } as Album,
        };
    });
};

export const shiftPagePosition = (
    params: ShiftPagePositionParams,
    store: Store,
) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;
        const { pages } = album;
        const { direction, pageIndex } = params;

        const toIndex = pageIndex + direction;

        if (pages[toIndex]) {
            [pages[pageIndex], pages[toIndex]] = [
                pages[toIndex],
                pages[pageIndex],
            ];

            return {
                ...state,
                updatedAlbumStatus: 'Shift Page Position',
                activeAlbum: {
                    ...album,
                    pages,
                } as Album,
            };
        }

        return state;
    });
};

export const updatePageSettings = (
    {
        pageStyles,
        pageIndex,
    }: {
        pageStyles: PageStyles;
        pageIndex: number;
    },
    store: Store,
): Observable<Album> => {
    const sub = new Subject<Album>();

    patchState(store, (state) => {
        const updatedAlbum: Album = { ...state.activeAlbum! };
        const activeAlbum = state.activeAlbum!;

        delete activeAlbum!.pages[pageIndex].format;
        delete activeAlbum!.pages[pageIndex].gap;
        delete activeAlbum!.pages[pageIndex].paddingTop;
        delete activeAlbum!.pages[pageIndex].paddingRight;
        delete activeAlbum!.pages[pageIndex].paddingBottom;
        delete activeAlbum!.pages[pageIndex].paddingLeft;

        updatedAlbum.pages[pageIndex] = {
            ...activeAlbum!.pages[pageIndex],
            ...pageStyles,
        };

        sub.next(updatedAlbum);

        return {
            ...state,
            activeAlbum: updatedAlbum,
            updatedAlbumStatus: 'Update Page Settings',
        };
    });

    return sub.asObservable();
};

export const alignPhoto = (
    { pageIndex, photoIndex, alignment }: AlignPhotoParams,
    store: Store,
) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;
        const { pages } = album;
        const { styles } = pages[pageIndex].photos[photoIndex];
        const objectPositionProp = 'object-position';

        const indexObjectPosStyle = styles.findIndex((style) =>
            style.includes(objectPositionProp),
        );
        if (indexObjectPosStyle < 0) {
            styles.push(`${objectPositionProp}: ${alignment};`);
        } else {
            const objectPosition = styles[indexObjectPosStyle];
            const objectPositionValue = objectPosition
                .split(': ')[1]
                .replace(';', '')
                .split(' ');

            if (alignment === 'top' || alignment === 'bottom') {
                if (objectPositionValue.includes(alignment)) {
                    objectPositionValue.shift();
                } else if (
                    (objectPositionValue.includes('bottom') &&
                        alignment === 'top') ||
                    (objectPositionValue.includes('top') &&
                        alignment === 'bottom')
                ) {
                    objectPositionValue[0] = alignment;
                } else {
                    objectPositionValue.unshift(alignment);
                }
            } else {
                if (objectPositionValue.includes(alignment)) {
                    objectPositionValue.pop();
                } else if (
                    (objectPositionValue.includes('right') &&
                        alignment === 'left') ||
                    (objectPositionValue.includes('left') &&
                        alignment === 'right')
                ) {
                    if (objectPositionValue.length === 1) {
                        objectPositionValue[0] = alignment;
                    } else {
                        objectPositionValue[1] = alignment;
                    }
                } else {
                    objectPositionValue.push(alignment);
                }
            }

            if (objectPositionValue.length === 0) {
                styles.splice(indexObjectPosStyle, 1);
            } else {
                styles[indexObjectPosStyle] =
                    `${objectPositionProp}: ${objectPositionValue.join(' ')};`;
            }
        }

        pages[pageIndex].photos[photoIndex].styles = styles;

        return {
            ...state,
            activeAlbum: {
                ...album,
                pages,
            } as Album,
            updatedAlbumStatus: 'Align Photo',
        };
    });
};

export const removePhoto = (
    { pageIndex, photoIndex }: RemovePhotoParams,
    store: Store,
) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;
        const { pages } = album;

        pages[pageIndex].photos[photoIndex] = {
            fileName: '',
            path: '',
            styles: [],
        };

        return {
            ...state,
            activeAlbum: {
                ...album,
                pages,
            } as Album,
            updatedAlbumStatus: 'Remove Photo',
        };
    });
};

export const shiftPhotoPosition = (
    { pageIndex, photoIndex, direction }: ShiftPhotoPositionParams,
    store: Store,
) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;
        const { pages } = album;
        const photos = [...pages[pageIndex].photos];

        const fromIndex = photoIndex;

        if (
            (direction === -1 && photoIndex === 0) ||
            (direction === 1 && photoIndex === photos.length - 1)
        ) {
            return state;
        }

        let toIndex = photoIndex + direction;

        [photos[fromIndex], photos[toIndex]] = [
            photos[toIndex],
            photos[fromIndex],
        ];

        pages[pageIndex].photos = photos;

        return {
            ...state,
            activeAlbum: {
                ...album,
                pages,
            } as Album,
            updatedAlbumStatus: 'Shift Photo Position',
        };
    });
};

export const addPhoto = (
    { pageIndex, fileName, folderName }: AddPhotoParams,
    store: Store,
) => {
    patchState(store, (state) => {
        const newPhoto = {
            fileName,
            path: folderName,
            styles: [],
        };

        const album = state.activeAlbum!;
        const emptyPhotoSlotIndex = album.pages[pageIndex].photos.findIndex(
            (photo) => photo.fileName === '',
        );
        const photos = album.pages[pageIndex].photos;
        let page = album.pages[pageIndex];

        if (emptyPhotoSlotIndex >= 0) {
            photos.splice(emptyPhotoSlotIndex, 1, newPhoto);
        } else {
            photos.push(newPhoto);
        }

        page = {
            ...page,
            photos,
        };

        const { pages } = album;

        pages.splice(pageIndex, 1, page);

        return {
            ...state,
            activeAlbum: {
                ...album,
                pages,
            } as Album,
            updatedAlbumStatus: 'Add Photo',
        };
    });
};
