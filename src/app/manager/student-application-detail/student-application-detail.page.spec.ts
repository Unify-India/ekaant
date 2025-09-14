import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentApplicationDetailPage } from './student-application-detail.page';

describe('StudentApplicationDetailPage', () => {
  let component: StudentApplicationDetailPage;
  let fixture: ComponentFixture<StudentApplicationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentApplicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
