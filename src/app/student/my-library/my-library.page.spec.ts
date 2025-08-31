import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyLibraryPage } from './my-library.page';

describe('MyLibraryPage', () => {
  let component: MyLibraryPage;
  let fixture: ComponentFixture<MyLibraryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyLibraryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
