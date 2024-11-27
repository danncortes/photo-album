export type AlbumsConfig = {
    [key: string]: Album;
};

export type Album = GroupedAlbum | UngroupedAlbum;

type BaseAlbum = {
    name: string;
    id: string;
    originFolder: string;
    settings: AlbumSettings;
};

export type GroupedAlbum = {
    isGrouped: true; // `isGrouped` is `true`
    photosDictionary: GroupedDictionary; // `photosDictionary` is `GroupedDictionary`
    pages: Pages;
} & BaseAlbum;

export type UngroupedAlbum = {
    isGrouped: false; // `isGrouped` is `false`
    photosDictionary: PhotosDictionary; // `photosDictionary` is `PhotosDictionary`
    pages: Pages;
} & BaseAlbum;

export type GroupedDictionary = {
    [key: string]: PhotosDictionary;
};

export type PhotosDictionary = {
    [key: string]: PhotoInPage;
};

export type AlbumPreview = Pick<
    Album,
    'isGrouped' | 'name' | 'id' | 'originFolder' | 'settings'
>;

export type AlbumSettings = {
    page: {
        gap: string;
    };
};

export type SingleDicc = PhotoInPage;

export type Pages = Array<Page>;

export type PhotoInPage = {
    pages: Array<number>;
};

export type PhotoConfig = {
    folder: string | null;
    fileName: string;
    styles: Array<string>;
};

export type Page = {
    format: string;
    template: string;
    photos: Array<PhotoConfig>;
};
