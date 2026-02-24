import express from 'express';
import {
    saveAlbum,
    getAlbums,
    getAlbum,
    createAlbum,
    getAlbumDirectory,
    pickFolder,
} from './config-controller';

const router = express();

router.get(`/albums`, getAlbums);
router.get(`/album/:id`, getAlbum);
router.get(`/album/directory/:id`, getAlbumDirectory);
router.get(`/pick-folder`, pickFolder);
router.post(`/album/save`, saveAlbum);
router.post(`/album/create`, createAlbum);

export default [router];
