export type AlbumsConfig = {
    [key: string]: Album;
};

export type Album = GroupedAlbum | UngroupedAlbum;

type BaseAlbum = {
    name: string;
    id: string;
    originFolder: string;
    settings: StyleSettings;
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

export type StyleSettings = {
    format: PageFormat;
    paddingTop: number;
    paddingBottom: number;
    paddingRight: number;
    paddingLeft: number;
    gap: number;
};

export type PageFormat = {
    width: number;
    height: number;
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

export type PageStyles = Partial<StyleSettings> & {
    format?: Partial<PageFormat>;
};

export type Page = {
    template: string;
    photos: Array<PhotoConfig>;
} & PageStyles;

export type ShiftDirection = '◀️' | '▶️';
