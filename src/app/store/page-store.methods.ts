import { ElementRef } from '@angular/core';
import { WritableStateSource, patchState } from '@ngrx/signals';
import JSZip from 'jszip';
import domtoimage from 'dom-to-image-more';

import { AlbumState, Store } from './albums.store';
import {
    Album,
    GroupedDictionary,
    Pages,
    PhotoConfig,
    PhotosDictionary,
} from '../../types';

type RemovePageFromDictionaries<T> = (params: {
    photosToRemove: string[];
    photoDicc: T;
    pageIndex: number;
}) => T;

type MovePagesInDictionaries<T> = (params: {
    dictionary: T;
    photos: string[];
    difference: number;
}) => T;

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
                    folder: '',
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

const downloadAlbumPage = async (
    divElement: ElementRef<HTMLElement>,
    fileName: string,
) => {
    const blob = await capturePage(divElement);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
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
    console.log('🚀 ~ pageDivElements:', pageDivElements);
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
                        folder: '',
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
                        folder: '',
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
            },
        };
    });
};

const removePageFromDictionary = ({
    photoToRemove,
    photoDicc,
    pageIndex,
}: {
    photoToRemove: string;
    photoDicc: PhotosDictionary;
    pageIndex: number;
}) => {
    if (photoToRemove in photoDicc) {
        const photoPages = photoDicc[photoToRemove].pages;
        const indexToRemove = photoPages.findIndex(
            (page) => page === pageIndex,
        );

        if (indexToRemove >= 0) {
            photoPages.splice(indexToRemove, 1);
            photoDicc[photoToRemove].pages = photoPages;
        }
    }
};

const removePageFromGroupedDictionary: RemovePageFromDictionaries<
    GroupedDictionary
> = ({ photosToRemove, photoDicc, pageIndex }) => {
    for (const folder in photoDicc) {
        for (const photoToRemove of photosToRemove) {
            removePageFromDictionary({
                photoToRemove,
                photoDicc: photoDicc[folder],
                pageIndex,
            });
        }
    }
    return photoDicc;
};

const removePageFromPhotosDictionary: RemovePageFromDictionaries<
    PhotosDictionary
> = ({ photosToRemove, photoDicc, pageIndex }) => {
    for (const photoToRemove of photosToRemove) {
        removePageFromDictionary({
            photoToRemove,
            photoDicc: photoDicc,
            pageIndex,
        });
    }
    return photoDicc;
};

const movePageInDictionary = ({
    dictionary,
    photoFrom,
    difference,
}: {
    dictionary: PhotosDictionary;
    photoFrom: string;
    difference: number;
}) => {
    if (photoFrom in dictionary) {
        const photoPages = dictionary[photoFrom].pages.map(
            (pageNumber) => pageNumber + difference,
        );

        dictionary[photoFrom].pages = photoPages;
    }
};

const movePagesInGroupedDictionary: MovePagesInDictionaries<
    GroupedDictionary
> = ({ dictionary, photos, difference }) => {
    for (const folder in dictionary) {
        for (const photoFrom of photos) {
            movePageInDictionary({
                dictionary: dictionary[folder],
                photoFrom,
                difference,
            });
        }
    }

    return dictionary;
};

const movePagesInPhotosDictionary: MovePagesInDictionaries<
    PhotosDictionary
> = ({ dictionary, photos, difference }) => {
    for (const photoFrom of photos) {
        movePageInDictionary({
            dictionary,
            photoFrom,
            difference,
        });
    }

    return dictionary;
};

const getPhotoNames = (photos: PhotoConfig[]): string[] => {
    return photos.reduce((acc: string[], photo) => {
        if (photo.fileName) {
            acc.push(photo.fileName);
        }
        return acc;
    }, []);
};

export const removePage = (pageIndex: number, store: Store) => {
    patchState(store, (state) => {
        const album = state.activeAlbum!;

        const { pages } = album;
        const photosToRemove = pages[pageIndex].photos.map(
            (photo) => photo.fileName,
        );

        let { photosDictionary } = album;

        // Remove the page from photo's dictionary
        if (album.isGrouped) {
            photosDictionary = removePageFromGroupedDictionary({
                photosToRemove,
                photoDicc: photosDictionary as GroupedDictionary,
                pageIndex,
            });
        } else {
            photosDictionary = removePageFromPhotosDictionary({
                photosToRemove,
                photoDicc: photosDictionary as PhotosDictionary,
                pageIndex,
            });
        }

        const photosToMove = [...pages]
            .splice(pageIndex + 1, pages.length - 1)
            .flatMap((page) => getPhotoNames(page.photos));

        if (album.isGrouped) {
            photosDictionary = movePagesInGroupedDictionary({
                dictionary: photosDictionary as GroupedDictionary,
                photos: photosToMove,
                difference: -1,
            });
        } else {
            photosDictionary = movePagesInPhotosDictionary({
                dictionary: photosDictionary as PhotosDictionary,
                photos: photosToMove,
                difference: -1,
            });
        }

        pages.splice(pageIndex, 1);

        return {
            ...state,
            activeAlbum: {
                ...album,
                photosDictionary,
                pages,
            } as Album,
        };
    });
};
