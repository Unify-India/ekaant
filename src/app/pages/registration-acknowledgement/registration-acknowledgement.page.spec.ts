import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationAcknowledgementPage } from './registration-acknowledgement.page';

describe('RegistrationAcknowledgementPage', () => {
  let component: RegistrationAcknowledgementPage;
  let fixture: ComponentFixture<RegistrationAcknowledgementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationAcknowledgementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
