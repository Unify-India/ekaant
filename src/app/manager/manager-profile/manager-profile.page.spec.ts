import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerProfilePage } from './manager-profile.page';

describe('ManagerProfilePage', () => {
  let component: ManagerProfilePage;
  let fixture: ComponentFixture<ManagerProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
