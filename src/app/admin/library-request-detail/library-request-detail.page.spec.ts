import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryRequestDetailPage } from './library-request-detail.page';

describe('LibraryRequestDetailPage', () => {
  let component: LibraryRequestDetailPage;
  let fixture: ComponentFixture<LibraryRequestDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryRequestDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
