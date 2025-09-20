import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListCodeOfConductComponent } from './list-code-of-conduct.component';

describe('ListCodeOfConductComponent', () => {
  let component: ListCodeOfConductComponent;
  let fixture: ComponentFixture<ListCodeOfConductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ListCodeOfConductComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCodeOfConductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
