import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPagePhotosComponent } from './add-page-photos.component';

describe('AddPagePhotosComponent', () => {
  let component: AddPagePhotosComponent;
  let fixture: ComponentFixture<AddPagePhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPagePhotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPagePhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
