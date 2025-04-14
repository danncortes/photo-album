import express from 'express';
import {
    saveAlbum,
    getAlbums,
    getAlbum,
    createAlbum,
    getAlbumDirectory,
} from './config-controller';

const router = express();

router.get(`/albums`, getAlbums);
router.get(`/album/:id`, getAlbum);
router.get(`/album/directory/:id`, getAlbumDirectory);
router.post(`/album/save`, saveAlbum);
router.post(`/album/create`, createAlbum);

export default [router];
