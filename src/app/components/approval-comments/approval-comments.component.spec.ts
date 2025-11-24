import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApprovalCommentsComponent } from './approval-comments.component';

describe('ApprovalCommentsComponent', () => {
  let component: ApprovalCommentsComponent;
  let fixture: ComponentFixture<ApprovalCommentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ApprovalCommentsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ApprovalCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
