import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import {
    Section,
    SectionPosition,
    SectionsConfig,
    Subsection,
} from '../../../types';
import { SectionRowComponent } from '../section-row/section-row.component';

export type SectionsDialogData = {
    sections?: SectionsConfig;
    pageCount: number;
};

@Component({
    selector: 'app-sections-dialog',
    imports: [FormsModule, SectionRowComponent],
    templateUrl: './sections-dialog.component.html',
    styleUrl: './sections-dialog.component.css',
})
export class SectionsDialogComponent {
    private dialogRef = inject<DialogRef<SectionsConfig>>(DialogRef);
    private data = inject<SectionsDialogData>(DIALOG_DATA);

    sections = signal<Section[]>(this.cloneSections());
    position = signal<SectionPosition>(
        this.data.sections?.position ?? 'top',
    );
    padding = signal<number>(this.data.sections?.padding ?? 0);
    margin = signal<number>(this.data.sections?.margin ?? 0);
    borderRadius = signal<number>(this.data.sections?.borderRadius ?? 0);
    fontSize = signal<number>(this.data.sections?.fontSize ?? 0.3);
    pageCount = signal<number>(this.data.pageCount);

    addSection() {
        const lastPage = Math.max(this.pageCount() - 1, 0);
        this.sections.update((sections) => [
            ...sections,
            {
                name: '',
                from: 0,
                to: lastPage,
                color: '#3b82f6',
                subsections: [],
            },
        ]);
    }

    updateSection(index: number, changes: Partial<Section>) {
        this.sections.update((sections) =>
            sections.map((section, i) =>
                i === index ? { ...section, ...changes } : section,
            ),
        );
    }

    removeSection(index: number) {
        this.sections.update((sections) =>
            sections.filter((_, i) => i !== index),
        );
    }

    addSubsection(sectionIndex: number) {
        this.sections.update((sections) =>
            sections.map((section, i) => {
                if (i !== sectionIndex) return section;
                const newSubsection: Subsection = {
                    name: '',
                    from: section.from,
                    to: section.to,
                };
                return {
                    ...section,
                    subsections: [...section.subsections, newSubsection],
                };
            }),
        );
    }

    updateSubsection(
        sectionIndex: number,
        subIndex: number,
        changes: Partial<Subsection>,
    ) {
        this.sections.update((sections) =>
            sections.map((section, i) => {
                if (i !== sectionIndex) return section;
                const subsections = section.subsections.map((sub, j) =>
                    j === subIndex ? { ...sub, ...changes } : sub,
                );
                return { ...section, subsections };
            }),
        );
    }

    removeSubsection(sectionIndex: number, subIndex: number) {
        this.sections.update((sections) =>
            sections.map((section, i) => {
                if (i !== sectionIndex) return section;
                return {
                    ...section,
                    subsections: section.subsections.filter(
                        (_, j) => j !== subIndex,
                    ),
                };
            }),
        );
    }

    save() {
        const config: SectionsConfig = {
            sections: this.sections(),
            position: this.position(),
            padding: this.padding(),
            margin: this.margin(),
            borderRadius: this.borderRadius(),
            fontSize: this.fontSize(),
        };
        this.dialogRef.close(config);
    }

    cancel() {
        this.dialogRef.close();
    }

    private cloneSections(): Section[] {
        const existing = this.data.sections?.sections;
        if (!existing) return [];
        return existing.map((s) => ({
            ...s,
            subsections: s.subsections.map((sub) => ({ ...sub })),
        }));
    }
}
