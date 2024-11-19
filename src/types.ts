export type AlbumsConfig = {
    [key: string]: Album;
};

export type Album = {
    type: 'grouped' | 'single';
    name: string;
    id: string;
    baseUrl: string;
    settings: AlbumSettings;
    photosDicc: GroupedDicc;
    pages: Pages;
};

export type AlbumPreview = Pick<
    Album,
    'type' | 'name' | 'id' | 'baseUrl' | 'settings'
>;

export type AlbumSettings = {
    page: {
        gap: string;
    };
};

export type GroupedDicc = {
    [key: string]: {
        [key: string]: PhotoInPage;
    };
};

export type SingleDicc = PhotoInPage;

export type Pages = Array<Page>;

export type PhotoInPage = {
    pages: Array<number>;
};

export type PhotoConfig = {
    folder: string;
    fileName: string;
    styles: Array<string>;
};

export type Page = {
    format: string;
    template: string;
    photos: Array<PhotoConfig>;
};
