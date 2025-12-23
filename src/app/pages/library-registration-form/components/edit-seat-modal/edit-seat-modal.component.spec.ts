import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSeatModalComponent } from './edit-seat-modal.component';

describe('EditSeatModalComponent', () => {
  let component: EditSeatModalComponent;
  let fixture: ComponentFixture<EditSeatModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditSeatModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSeatModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
