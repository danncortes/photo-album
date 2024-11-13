import { Injectable, signal, WritableSignal, ɵunwrapWritableSignal } from '@angular/core';
import config from '../../config-server/albums-config.json';
import { AlbumsConfig } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  config: WritableSignal<AlbumsConfig | null> = signal(null);
  
  constructor() { }
  
  getConfig() {
    this.config.set(config as AlbumsConfig);
  }
}
