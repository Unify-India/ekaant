import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFeedbackPage } from './user-feedback.page';

describe('UserFeedbackPage', () => {
  let component: UserFeedbackPage;
  let fixture: ComponentFixture<UserFeedbackPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFeedbackPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
