import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { ConfigService } from '../../services/config.service';
import { Page } from '../../../types';

@Component({
    selector: 'app-templates',
    imports: [NgFor],
    templateUrl: './templates.component.html',
    styleUrl: './templates.component.css',
})
export class TemplatesComponent {
    dialogRef = inject<DialogRef<string>>(DialogRef<Page>);
    data = inject(DIALOG_DATA);

    constructor(public configService: ConfigService) {}

    getPhotosNumber(templateNum: string) {
        return new Array(Number(templateNum.split('-')[0]));
    }

    selectTemplate(template: string) {
        this.dialogRef.close(template);
    }
}
