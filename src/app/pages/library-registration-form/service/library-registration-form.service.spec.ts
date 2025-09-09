import { TestBed } from '@angular/core/testing';
import { LibraryRegistrationFormService } from './library-registration-form.service';

describe('LibraryRegistrationFormService', () => {
  let service: LibraryRegistrationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryRegistrationFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
