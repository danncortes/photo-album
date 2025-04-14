import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryGalleryComponent } from './directory-gallery.component';

describe('DirectoryGalleryComponent', () => {
  let component: DirectoryGalleryComponent;
  let fixture: ComponentFixture<DirectoryGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectoryGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectoryGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
