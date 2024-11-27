import express from 'express';
import {
    saveAlbum,
    getAlbums,
    getAlbum,
    checkAlbum,
} from './config-controller';

const router = express();

router.get(`/albums`, getAlbums);
router.get(`/album/:id`, getAlbum);
router.get(`/album/check/:id`, checkAlbum);
router.post(`/album/save`, saveAlbum);

export default [router];
