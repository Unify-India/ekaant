import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowseLibrariesPage } from './browse-libraries.page';

describe('BrowseLibrariesPage', () => {
  let component: BrowseLibrariesPage;
  let fixture: ComponentFixture<BrowseLibrariesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseLibrariesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
