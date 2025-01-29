import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import {
    Album,
    AlbumPreview,
    GroupedAlbum,
    GroupedDictionary,
    Pages,
    PhotoConfig,
    PhotosDictionary,
    ShiftDirection,
} from '../../types';
import { HttpClient } from '@angular/common/http';
import { concatMap, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    albumsPreview: WritableSignal<AlbumPreview[] | null> = signal(null);
    isAlbumPreviewLoading = signal(false);

    album: WritableSignal<Album | null> = signal(null);
    isAlbumLoading = signal(true);

    activeFolder = signal<string | null>(null);

    isAlbumGrouped = computed(() => {
        return this.album()?.isGrouped || false;
    });

    galleryPhotos = computed(() => {
        const album = this.album()!;

        if (album) {
            if (album.isGrouped && album.activeFolder) {
                return album.photosDictionary[album.activeFolder];
            } else {
                return album.photosDictionary;
            }
        } else {
            return null;
        }
    });

    templates: WritableSignal<string[][][]> = signal([
        [['1']],
        [['2-1-1', '2-1-2']],
        [
            ['3-1-1', '3-1-2', '3-1-3', '3-1-4'],
            ['3-2-1', '3-2-2', '3-2-3', '3-2-4'],
            [
                '3-3-1',
                '3-3-2',
                '3-3-3',
                '3-3-4',
                '3-3-5',
                '3-3-6',
                '3-3-7',
                '3-3-8',
            ],
        ],
        [
            ['4-1'],
            ['4-2-1', '4-2-2', '4-2-3', '4-2-4'],
            ['4-3-1', '4-3-2', '4-3-3', '4-3-4'],
            ['4-4-1', '4-4-2', '4-4-3', '4-4-4'],
        ],
        [
            ['5-1-1', '5-1-2', '5-1-3', '5-1-4'],
            ['5-2-1', '5-2-2', '5-2-3', '5-2-4'],
            ['5-3-1', '5-3-2', '5-3-3', '5-3-4', '5-3-5'],
        ],
        [['6-1-1', '6-1-2']],
    ]);

    albumChanged = new Subject<string>();

    constructor(
        private http: HttpClient,
        public router: Router,
    ) {
        this.albumChanged.subscribe((value) => {
            console.log('Album changed - ', value);
            this.saveAlbum();
        });
    }

    selectFolder(folderName: string) {
        this.activeFolder.set(folderName);

        if (this.album()) {
            this.album.update(
                (album) =>
                    ({
                        ...album!,
                        activeFolder: folderName,
                    }) as GroupedAlbum,
            );
            this.albumChanged.next('Folder selected');
        }
    }

    requestCheckAlbum(id: string) {
        return this.http.get(`http://localhost:3333/album/check/${id}`);
    }

    getAlbums() {
        const responseSubject = new Subject<void>();
        this.isAlbumPreviewLoading.set(true);
        this.http.get('http://localhost:3333/albums').subscribe({
            next: (response) => {
                this.albumsPreview.set(response as AlbumPreview[]);
                this.isAlbumPreviewLoading.set(false);
                responseSubject.next();
            },
            error: (error) => {
                responseSubject.error(error);
            },
        });

        return responseSubject;
    }

    getAlbum(id: string) {
        const responseSubject = new Subject<void>();
        this.http.get(`http://localhost:3333/album/${id}`).subscribe({
            next: (response) => {
                this.album.set(response as Album);

                if ((response as Album).isGrouped) {
                    this.activeFolder.set(
                        (response as GroupedAlbum).activeFolder,
                    );
                }

                responseSubject.next();
            },
            error: (error) => {
                responseSubject.error(error);
            },
        });

        return responseSubject;
    }

    checkAndGetAlbum(id: string) {
        this.isAlbumLoading.set(true);
        const responseSubject = new Subject<void>();
        this.requestCheckAlbum(id)
            .pipe(concatMap(() => this.getAlbum(id)))
            .subscribe({
                next: () => {
                    responseSubject.next();
                },
                error: (error) => {
                    responseSubject.error(error);
                },
            })
            .add(() => {
                this.isAlbumLoading.set(false);
            });

        return responseSubject;
    }

    saveAlbum() {
        this.http
            .post('http://localhost:3333/album/save', {
                config: this.album(),
            })
            .subscribe(() => {
                console.log('Config saved');
            });
    }

    addPage(template: string) {
        const [pageNumbers] = template;

        const pages: Pages = [
            ...this.album()!.pages,
            {
                photos: Array.from({ length: Number(pageNumbers) }).map(() => ({
                    fileName: '',
                    folder: '',
                    styles: [],
                })),
                template,
            },
        ];

        this.album.update((album) => ({
            ...album!,
            pages,
        }));

        this.albumChanged.next('Page added');
    }

    addPhoto({
        pageIndex,
        fileName,
        folderName,
    }: {
        pageIndex: number;
        fileName: string;
        folderName: string | null;
    }) {
        const newPhoto = {
            fileName,
            folder: folderName,
            styles: [],
        };

        const album = this.album()!;
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

        const { photosDictionary, pages } = album;

        if (album.isGrouped) {
            (photosDictionary as GroupedDictionary)[folderName!][
                fileName
            ].pages.push(pageIndex);
        } else {
            (photosDictionary as PhotosDictionary)[fileName].pages.push(
                pageIndex,
            );
        }

        pages.splice(pageIndex, 1, page);

        this.album.set({
            ...album,
            photosDictionary,
            pages,
        } as Album);

        this.albumChanged.next('Photo added');
    }

    removePhoto({
        pageIndex,
        photoIndex,
        photo,
    }: {
        pageIndex: number;
        photoIndex: number;
        photo: PhotoConfig;
    }) {
        const album = this.album()!;
        const { pages, photosDictionary } = album;

        pages[pageIndex].photos[photoIndex] = {
            fileName: '',
            folder: '',
            styles: [],
        };

        let indexToRemove = null;

        if (album.isGrouped) {
            indexToRemove = (photosDictionary as GroupedDictionary)[
                photo.folder!
            ][photo.fileName].pages.findIndex(
                (page: number) => page === pageIndex,
            );

            (photosDictionary as GroupedDictionary)[photo.folder!][
                photo.fileName
            ].pages.splice(indexToRemove, 1);
        } else {
            indexToRemove = (photosDictionary as PhotosDictionary)[
                photo.fileName
            ].pages.findIndex((page: number) => page === pageIndex);

            (photosDictionary as PhotosDictionary)[photo.fileName].pages.splice(
                indexToRemove,
                1,
            );
        }

        this.album.set({
            ...album,
            pages,
            photosDictionary,
        } as Album);

        this.albumChanged.next('Photo removed');
    }

    changePageTemplate({
        pageIndex,
        template,
    }: {
        pageIndex: number;
        template: string;
    }) {
        const album = this.album()!;
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

        this.album.set({
            ...album,
            pages,
        } as Album);

        this.albumChanged.next('Template changed');
    }

    alignPhoto({
        pageIndex,
        photoIndex,
        alignment,
    }: {
        pageIndex: number;
        photoIndex: number;
        alignment: string;
    }) {
        const album = this.album()!;
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

        this.album.set({
            ...album,
            pages,
        } as Album);

        this.albumChanged.next('Photo alignment changed');
    }

    shiftPhotoPosition({
        pageIndex,
        photoIndex,
        direction,
    }: {
        pageIndex: number;
        photoIndex: number;
        direction: ShiftDirection;
    }) {
        const album = this.album()!;
        const { pages } = album;
        const photos = [...pages[pageIndex].photos];

        const fromIndex = photoIndex;

        if (
            (direction === '◀️' && photoIndex === 0) ||
            (direction === '▶️' && photoIndex === photos.length - 1)
        ) {
            return;
        }

        let toIndex = photoIndex + 1;

        if (direction === '◀️') {
            toIndex = photoIndex - 1;
        }

        [photos[fromIndex], photos[toIndex]] = [
            photos[toIndex],
            photos[fromIndex],
        ];

        pages[pageIndex].photos = photos;

        this.album.set({
            ...album,
            pages,
        } as Album);

        this.albumChanged.next('Photo position changed');
    }

    movePageInDictionary({
        dictionary,
        photoFrom,
        difference,
    }: {
        dictionary: PhotosDictionary;
        photoFrom: string;
        difference: number;
    }) {
        if (photoFrom in dictionary) {
            const photoPages = dictionary[photoFrom].pages.map(
                (pageNumber) => pageNumber + difference,
            );

            dictionary[photoFrom].pages = photoPages;
        }
    }

    movePagesInGroupedDictionary({
        dictionary,
        photos,
        difference,
    }: {
        dictionary: GroupedDictionary;
        photos: string[];
        difference: number;
    }): GroupedDictionary {
        for (const folder in dictionary) {
            for (const photoFrom of photos) {
                this.movePageInDictionary({
                    dictionary: dictionary[folder],
                    photoFrom,
                    difference,
                });
            }
        }

        return dictionary;
    }

    movePagesInPhotosDictionary({
        dictionary,
        photos,
        difference,
    }: {
        dictionary: PhotosDictionary;
        photos: string[];
        difference: number;
    }): PhotosDictionary {
        for (const photoFrom of photos) {
            this.movePageInDictionary({
                dictionary,
                photoFrom,
                difference,
            });
        }

        return dictionary;
    }

    shiftPageInDictionary({
        dictionary,
        photoFrom,
        toIndex,
        fromIndex,
    }: {
        dictionary: PhotosDictionary;
        photoFrom: string;
        toIndex: number;
        fromIndex: number;
    }) {
        if (photoFrom in dictionary) {
            const photoPages = dictionary[photoFrom].pages;
            const indexToChange = photoPages.findIndex(
                (page) => page === fromIndex,
            );

            if (indexToChange >= 0) {
                photoPages[indexToChange] = toIndex;
                dictionary[photoFrom].pages = photoPages;
            }
        }
    }

    shiftPageInGroupedDictionary({
        dictionary,
        photos,
        toIndex,
        fromIndex,
    }: {
        dictionary: GroupedDictionary;
        photos: string[];
        toIndex: number;
        fromIndex: number;
    }): GroupedDictionary {
        for (const folder in dictionary) {
            for (const photoFrom of photos) {
                this.shiftPageInDictionary({
                    dictionary: dictionary[folder],
                    photoFrom,
                    toIndex,
                    fromIndex,
                });
            }
        }

        return dictionary;
    }

    shiftPageInPhotosDictionary({
        dictionary,
        photos,
        toIndex,
        fromIndex,
    }: {
        dictionary: PhotosDictionary;
        photos: string[];
        toIndex: number;
        fromIndex: number;
    }): PhotosDictionary {
        for (const photoFrom of photos) {
            this.shiftPageInDictionary({
                dictionary,
                photoFrom,
                toIndex,
                fromIndex,
            });
        }

        return dictionary;
    }

    removePageFromDictionary({
        photoToRemove,
        photoDicc,
        pageIndex,
    }: {
        photoToRemove: string;
        photoDicc: PhotosDictionary;
        pageIndex: number;
    }) {
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
    }

    removePageFromGroupedDictionary({
        photosToRemove,
        photoDicc,
        pageIndex,
    }: {
        photosToRemove: string[];
        photoDicc: GroupedDictionary;
        pageIndex: number;
    }): GroupedDictionary {
        for (const folder in photoDicc) {
            for (const photoToRemove of photosToRemove) {
                this.removePageFromDictionary({
                    photoToRemove,
                    photoDicc: photoDicc[folder],
                    pageIndex,
                });
            }
        }
        return photoDicc;
    }

    removePageFromPhotosDictionary({
        photosToRemove,
        photoDicc,
        pageIndex,
    }: {
        photosToRemove: string[];
        photoDicc: PhotosDictionary;
        pageIndex: number;
    }): PhotosDictionary {
        for (const photoToRemove of photosToRemove) {
            this.removePageFromDictionary({
                photoToRemove,
                photoDicc: photoDicc,
                pageIndex,
            });
        }
        return photoDicc;
    }

    removePage(pageIndex: number) {
        const album = this.album()!;
        const { pages } = album;
        const photosToRemove = pages[pageIndex].photos.map(
            (photo) => photo.fileName,
        );

        let { photosDictionary } = album;

        if (album.isGrouped) {
            photosDictionary = this.removePageFromGroupedDictionary({
                photosToRemove,
                photoDicc: photosDictionary as GroupedDictionary,
                pageIndex,
            });
        } else {
            photosDictionary = this.removePageFromPhotosDictionary({
                photosToRemove,
                photoDicc: photosDictionary as PhotosDictionary,
                pageIndex,
            });
        }

        const photosToMove = [...pages]
            .splice(pageIndex + 1, pages.length - 1)
            .flatMap((page) => this.getPhotoNames(page.photos));

        if (album.isGrouped) {
            photosDictionary = this.movePagesInGroupedDictionary({
                dictionary: photosDictionary as GroupedDictionary,
                photos: photosToMove,
                difference: -1,
            });
        } else {
            photosDictionary = this.movePagesInPhotosDictionary({
                dictionary: photosDictionary as PhotosDictionary,
                photos: photosToMove,
                difference: -1,
            });
        }

        pages.splice(pageIndex, 1);

        this.album.set({
            ...album,
            photosDictionary,
            pages,
        } as Album);

        this.albumChanged.next('Page removed');
    }

    getPhotoNames(photos: PhotoConfig[]): string[] {
        return photos.reduce((acc: string[], photo) => {
            if (photo.fileName) {
                acc.push(photo.fileName);
            }
            return acc;
        }, []);
    }

    shiftPagePosition({
        pageIndex,
        direction,
    }: {
        pageIndex: number;
        direction: ShiftDirection;
    }) {
        const album = this.album()!;
        const { pages } = album;
        let photosDictionary = album.photosDictionary;
        let shiftValue = 1;

        if (direction === '◀️') {
            shiftValue = -1;
        }

        const toIndex = pageIndex + shiftValue;

        if (pages[toIndex]) {
            const photosFrom = this.getPhotoNames(pages[pageIndex].photos);
            const photosTo = this.getPhotoNames(pages[toIndex].photos);

            if (album.isGrouped) {
                photosDictionary = this.shiftPageInGroupedDictionary({
                    dictionary: photosDictionary as GroupedDictionary,
                    photos: photosFrom,
                    toIndex: toIndex,
                    fromIndex: pageIndex,
                });
                photosDictionary = this.shiftPageInGroupedDictionary({
                    dictionary: photosDictionary as GroupedDictionary,
                    photos: photosTo,
                    toIndex: pageIndex,
                    fromIndex: toIndex,
                });
            } else {
                photosDictionary = this.shiftPageInPhotosDictionary({
                    dictionary: photosDictionary as PhotosDictionary,
                    photos: photosFrom,
                    toIndex: toIndex,
                    fromIndex: pageIndex,
                });
                photosDictionary = this.shiftPageInPhotosDictionary({
                    dictionary: photosDictionary as PhotosDictionary,
                    photos: photosTo,
                    toIndex: pageIndex,
                    fromIndex: toIndex,
                });
            }

            [pages[pageIndex], pages[toIndex]] = [
                pages[toIndex],
                pages[pageIndex],
            ];

            this.album.set({
                ...album,
                photosDictionary,
                pages,
            } as Album);

            this.albumChanged.next('Page position changed');
        }
    }

    clearAlbum() {
        this.album.set(null);
    }

    test(val: any) {
        console.log('🚀 ~ ConfigService ~ test ~ val', val);
    }
}
