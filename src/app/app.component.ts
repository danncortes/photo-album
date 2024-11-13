import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigService } from './services/config.service';
import { AlbumComponent } from './components/album/album.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlbumComponent],
  providers: [ConfigService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'photo-album';

  constructor( public configService: ConfigService) {
    this.configService.getConfig();
  }
}
