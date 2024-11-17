import { Component } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-templates',
    standalone: true,
    imports: [NgFor],
    templateUrl: './templates.component.html',
    styleUrl: './templates.component.scss',
})
export class TemplatesComponent {
    constructor(public configService: ConfigService) {}

    getArray(templateNum: string) {
        return new Array(Number(templateNum.split('-')[0]));
    }
}
