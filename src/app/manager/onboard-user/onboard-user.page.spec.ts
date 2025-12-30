import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardUserPage } from './onboard-user.page';

describe('OnboardUserPage', () => {
  let component: OnboardUserPage;
  let fixture: ComponentFixture<OnboardUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
