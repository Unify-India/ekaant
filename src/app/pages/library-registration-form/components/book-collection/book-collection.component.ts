import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { warningOutline, bookOutline } from 'ionicons/icons';

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-book-collection',
  templateUrl: './book-collection.component.html',
  styleUrls: ['./book-collection.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class BookCollectionComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  public bookCollectionForm!: FormGroup;

  public readonly pageTitle = 'Book Collection';
  public readonly sectionDescription =
    'Select the categories of books and study materials available in your library. This helps students find libraries with relevant resources for their studies.';
  public readonly completionWarning = 'This section is optional';
  public readonly selectPrompt = 'Select the book categories available in your library';

  public readonly bookCategories = [
    { formControlName: 'engineeringTechnology', label: 'Engineering & Technology' },
    { formControlName: 'medicalSciences', label: 'Medical Sciences' },
    { formControlName: 'managementBusiness', label: 'Management & Business' },
    { formControlName: 'artsLiterature', label: 'Arts & Literature' },
    { formControlName: 'scienceMathematics', label: 'Science & Mathematics' },
    { formControlName: 'competitiveExams', label: 'Competitive Exams (JEE, NEET, etc.)' },
    { formControlName: 'governmentJobExams', label: 'Government Job Exams' },
    { formControlName: 'languageCommunication', label: 'Language & Communication' },
    { formControlName: 'computerScienceIT', label: 'Computer Science & IT' },
    { formControlName: 'generalKnowledge', label: 'General Knowledge' },
    { formControlName: 'fictionNovels', label: 'Fiction & Novels' },
    { formControlName: 'referenceBooks', label: 'Reference Books' },
  ];

  constructor() {
    addIcons({ warningOutline, bookOutline });
  }

  ngOnInit() {
    this.bookCollectionForm = this.lrfService.getFormGroup('bookCollection');
  }
}
