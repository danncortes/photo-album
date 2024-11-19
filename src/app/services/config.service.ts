import { effect, Injectable, signal, WritableSignal } from '@angular/core';
import {
    Album,
    AlbumPreview,
    GroupedDicc,
    Pages,
    PhotoConfig,
} from '../../types';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, skip } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    albumsPreview: WritableSignal<AlbumPreview[] | null> = signal(null);
    isAlbumPreviewLoading = signal(false);

    activeAlbum: WritableSignal<Album | undefined> = signal(undefined);

    config = new BehaviorSubject<AlbumPreview | null>(null);
    photosDictionary = new BehaviorSubject<GroupedDicc | null>(null);
    pages = new BehaviorSubject<Pages | null>(null);

    isAlbumLoading = signal(false);

    templates: WritableSignal<string[][][]> = signal([
        [['1']],
        [['2-1-1', '2-1-2']],
        [
            ['3-1-1', '3-1-2', '3-1-3', '3-1-4'],
            ['3-2-1', '3-2-2', '3-2-3', '3-2-4'],
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

    constructor(private http: HttpClient) {
        combineLatest([this.photosDictionary, this.pages])
            .pipe(skip(3))
            .subscribe(([albumDicc, pages]) => {
                if (albumDicc && pages) {
                    this.activeAlbum.set({
                        ...this.config.getValue()!,
                        photosDicc: albumDicc,
                        pages: pages,
                    });
                }
            });

        effect(() => {
            if (this.activeAlbum()) {
                this.saveAlbum();
            }
        });
    }

    getAlbums() {
        this.isAlbumPreviewLoading.set(true);
        this.http.get('http://localhost:3333/albums').subscribe((response) => {
            this.albumsPreview.set(response as AlbumPreview[]);
            this.isAlbumPreviewLoading.set(false);
        });
    }

    getAlbum(id: string) {
        this.isAlbumLoading.set(true);
        this.http
            .get(`http://localhost:3333/albums/${id}`)
            .subscribe((response) => {
                const { name, id, settings, type, baseUrl } = response as Album;

                this.config.next({
                    name,
                    id,
                    settings,
                    type,
                    baseUrl,
                });
                this.photosDictionary.next((response as Album).photosDicc);
                this.pages.next((response as Album).pages);
                this.isAlbumLoading.set(false);
            });
    }

    saveAlbum() {
        console.log('Saving config...', this.activeAlbum());
        this.http
            .post('http://localhost:3333/config/save', {
                config: this.activeAlbum(),
            })
            .subscribe(() => {
                console.log('Config saved');
            });
    }

    addPage(template: string) {
        const [pageNumbers] = template;

        this.pages.next([
            ...this.pages.getValue()!,
            {
                photos: Array.from({ length: Number(pageNumbers) }).map(() => ({
                    fileName: '',
                    folder: '',
                    styles: [],
                })),
                format: 'square',
                template,
            },
        ]);
    }

    addPhoto({
        pageIndex,
        fileName,
        folderName,
    }: {
        pageIndex: number;
        fileName: string;
        folderName: string;
    }) {
        const newPhoto = {
            fileName,
            folder: folderName,
            styles: [],
        };
        const emptyPhotoSlotIndex = this.pages
            .getValue()!
            [pageIndex].photos.findIndex((photo) => photo.fileName === '');
        const photos = this.pages.getValue()![pageIndex].photos;
        let page = this.pages.getValue()![pageIndex];

        if (emptyPhotoSlotIndex >= 0) {
            photos.splice(emptyPhotoSlotIndex, 1, newPhoto);
        } else {
            photos.push(newPhoto);
        }

        page = {
            ...page,
            photos,
        };

        const photosDictionay = { ...this.photosDictionary.getValue()! };
        photosDictionay[folderName][fileName].pages.push(pageIndex);

        this.photosDictionary.next(photosDictionay);

        const pages = [...this.pages.getValue()!];
        pages.splice(pageIndex, 1, page);

        this.pages.next(pages);
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
        const pages = [...this.pages.getValue()!];

        pages[pageIndex].photos[photoIndex] = {
            fileName: '',
            folder: '',
            styles: [],
        };

        const photosDictionary = { ...this.photosDictionary.getValue()! };

        const indexToRemove = photosDictionary[photo.folder][
            photo.fileName
        ].pages.findIndex((page: number) => page === pageIndex);

        photosDictionary[photo.folder][photo.fileName].pages.splice(
            indexToRemove,
            1,
        );

        this.photosDictionary.next(photosDictionary);
        this.pages.next(pages);
    }

    changePageTemplate({
        pageIndex,
        template,
    }: {
        pageIndex: number;
        template: string;
    }) {
        const [newPhotosNumber] = template;
        const [currentPhotosNumber] =
            this.pages.getValue()![pageIndex].template;

        const pages = [...this.pages.getValue()!];

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

        this.pages.next(pages);
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
        const pages = [...this.pages.getValue()!];
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

        this.pages.next(pages);
    }

    shiftPhotoPosition({
        pageIndex,
        photoIndex,
        shift,
    }: {
        pageIndex: number;
        photoIndex: number;
        shift: string;
    }) {
        const pages = [...this.pages.getValue()!];
        const photos = [...pages[pageIndex].photos];

        const fromIndex = photoIndex;
        let toIndex = photoIndex + 1;

        if (shift === '◀️') {
            toIndex = photoIndex - 1;
        }

        [photos[fromIndex], photos[toIndex]] = [
            photos[toIndex],
            photos[fromIndex],
        ];

        pages[pageIndex].photos = photos;

        this.pages.next(pages);
    }
}
