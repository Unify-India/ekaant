import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationFormPage } from './application-form.page';

describe('ApplicationFormPage', () => {
  let component: ApplicationFormPage;
  let fixture: ComponentFixture<ApplicationFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
