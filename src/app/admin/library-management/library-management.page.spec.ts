import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryManagementPage } from './library-management.page';

describe('LibraryManagementPage', () => {
  let component: LibraryManagementPage;
  let fixture: ComponentFixture<LibraryManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
