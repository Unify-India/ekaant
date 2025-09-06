import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterLibraryPage } from './register-library.page';

describe('RegisterLibraryPage', () => {
  let component: RegisterLibraryPage;
  let fixture: ComponentFixture<RegisterLibraryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterLibraryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
