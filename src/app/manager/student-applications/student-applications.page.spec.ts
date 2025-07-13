import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentApplicationsPage } from './student-applications.page';

describe('StudentApplicationsPage', () => {
  let component: StudentApplicationsPage;
  let fixture: ComponentFixture<StudentApplicationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentApplicationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
