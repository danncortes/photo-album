import {
    computed,
    ElementRef,
    Injectable,
    signal,
    WritableSignal,
} from '@angular/core';
import {
    Album,
    AlbumPreview,
    GroupedDictionary,
    Pages,
    PageStyles,
    PhotoConfig,
    PhotosDictionary,
    ShiftDirection,
} from '../../types';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router';

import domtoimage from 'dom-to-image-more';
import JSZip from 'jszip';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    albumsPreview: WritableSignal<AlbumPreview[] | null> = signal(null);
    isAlbumPreviewLoading = signal(false);
    pageDivElements = signal<ElementRef<HTMLElement>[]>([]);

    album: WritableSignal<Album | null> = signal(null);
    isAlbumLoading = signal(true);

    activeFolder = signal<string | null>(null);

    isAlbumGrouped = computed(() => {
        return this.album()?.isGrouped || false;
    });

    albumChanged = new Subject<string>();

    constructor(
        private http: HttpClient,
        public router: Router,
    ) {}

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

    addPage(template: string) {
        const [nPhotos] = template;

        const pages: Pages = [
            ...this.album()!.pages,
            {
                photos: Array.from({ length: Number(nPhotos) }).map(() => ({
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

    updatePageSettings(
        pageStyles: PageStyles,
        pageIndex: number,
    ): Observable<Album> {
        const updatedAlbum: Album = {
            ...this.album()!,
        };

        delete this.album()!.pages[pageIndex].format;
        delete this.album()!.pages[pageIndex].gap;
        delete this.album()!.pages[pageIndex].paddingTop;
        delete this.album()!.pages[pageIndex].paddingRight;
        delete this.album()!.pages[pageIndex].paddingBottom;
        delete this.album()!.pages[pageIndex].paddingLeft;

        updatedAlbum.pages[pageIndex] = {
            ...this.album()!.pages[pageIndex],
            ...pageStyles,
        };

        this.album.set(updatedAlbum);
        this.albumChanged.next('Page settings changed');
        return of(updatedAlbum);
    }

    addPageDivElement(pageDivELement: ElementRef<HTMLElement>) {
        this.pageDivElements.update((pageDivElements) => [
            ...pageDivElements,
            pageDivELement,
        ]);
    }

    capturePage(divElement: ElementRef<HTMLElement>) {
        const element = divElement.nativeElement;
        return domtoimage.toBlob(element, {
            width: 3550, // Desired output width in pixels
            height: 3550, // Desired output height in pixels
            style: {
                transform: 'scale(8.87)', // 3550 / 400 = 8.87 (scaling factor)
                transformOrigin: 'top left',
            },
        });
    }

    async downloadAlbumPage(
        divElement: ElementRef<HTMLElement>,
        fileName: string,
    ) {
        const blob = await this.capturePage(divElement);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    async generatePageImages() {
        const images: Blob[] = [];

        for (let i = 0; i < this.pageDivElements().length; i++) {
            try {
                const blob = await this.capturePage(this.pageDivElements()[i]);
                images.push(blob);
            } catch (error) {
                console.error(`Error capturing element ${i}:`, error);
            }
        }

        return images;
    }

    async downloadAlbumPages(albumName: string) {
        const images = await this.generatePageImages();

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
    }

    clearAlbum() {
        this.album.set(null);
    }

    test(val: any) {
        console.log('🚀 ~ ConfigService ~ test ~ val', val);
    }
}
