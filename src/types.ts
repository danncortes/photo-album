export type AlbumsConfig = {
    [key: string]: Album;
};

type FileDirBase = {
    name: string;
    path: string;
};

export type FolderDir = {
    type: 'folder';
    sub: Array<FolderDir | FileDir>;
} & FileDirBase;

export type FileDir = {
    type: 'img';
} & FileDirBase;

export type Directory = Array<FolderDir | FileDir>;

export type Album = {
    name: string;
    id: string;
    originFolder: string;
    activeFolder: string | null;
    pages: Pages;
    settings: StyleSettings;
};

export type PhotosDictionary = {
    [key: string]: Array<number>;
};

export type AlbumPreview = Pick<
    Album,
    'name' | 'id' | 'originFolder' | 'settings'
> & {
    previewPage: Page;
};

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

export type Pages = Array<Page>;

export type PhotoConfig = {
    path: string;
    fileName: string;
    styles: Array<string>;
};

export type PageStyles = Partial<StyleSettings> & {
    format?: Partial<PageFormat>;
};
export type Template = {
    name: string;
    order: Proportion[];
};

export type Page = {
    template: string;
    photos: Array<PhotoConfig>;
} & PageStyles;

export type ShiftDirection = -1 | 1;

export type Proportion = 'l' | 'p' | 's';
