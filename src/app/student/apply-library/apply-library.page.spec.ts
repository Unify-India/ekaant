import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyLibraryPage } from './apply-library.page';

describe('ApplyLibraryPage', () => {
  let component: ApplyLibraryPage;
  let fixture: ComponentFixture<ApplyLibraryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyLibraryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
