import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryRequestsPage } from './library-requests.page';

describe('LibraryRequestsPage', () => {
  let component: LibraryRequestsPage;
  let fixture: ComponentFixture<LibraryRequestsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryRequestsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
