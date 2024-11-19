import { Routes } from '@angular/router';
import { AlbumComponent } from './components/album/album.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'album/:id', component: AlbumComponent },
    { path: '**', redirectTo: '/' },
];
