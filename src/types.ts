export type AlbumsConfig = {
    albums: Array<Album>;
}

export type Album = {
    type: "grouped" | "single";
    name: string;
    baseUrl: string;
    defaultFormat: "png" | "jpg" | "jpeg" | "webp" | "svg" ; 
    photosDicc: GroupedDicc;
    pages: Pages
}

export type GroupedDicc = {
    [key: string]: {
        [key: string]: PhotoInPage
    };
}

export type SingleDicc = PhotoInPage

export type Pages = Array<Page>;

export type PhotoInPage = {
    pages: Array<number>
}

export type PhotoConfig = {
    folder: string;
    fileName: string
    styles: Array<string>;
    format?: string;
}

export type Page = {
    format: string;
    template: string;
    photos: Array<PhotoConfig>;
}
