import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryRegistrationFormPage } from './library-registration-form.page';

describe('LibraryRegistrationFormPage', () => {
  let component: LibraryRegistrationFormPage;
  let fixture: ComponentFixture<LibraryRegistrationFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryRegistrationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
