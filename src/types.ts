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
    activeFolder: string | null;
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
    format: PageFormat;
    'padding-top': string;
    'padding-bottom': string;
    'padding-right': string;
    'padding-left': string;
    gap: string;
};

export type PageFormat = {
    width: string;
    height: string;
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
    format?: PageFormat;
    'padding-top'?: string;
    'padding-bottom'?: string;
    'padding-right'?: string;
    'padding-left'?: string;
    gap?: string;
    template: string;
    photos: Array<PhotoConfig>;
};
