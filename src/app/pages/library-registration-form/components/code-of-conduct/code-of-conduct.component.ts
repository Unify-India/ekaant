import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, createOutline } from 'ionicons/icons';
import { QuillModule } from 'ngx-quill'; // Import QuillModule

import { LibraryRegistrationFormService } from '../../service/library-registration-form.service';

@Component({
  selector: 'app-code-of-conduct',
  templateUrl: './code-of-conduct.component.html',
  styleUrls: ['./code-of-conduct.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    QuillModule, // Add QuillModule here for the standalone component
  ],
})
export class CodeOfConductComponent implements OnInit {
  private lrfService = inject(LibraryRegistrationFormService);
  public conductControl!: FormControl;

  public readonly pageTitle = 'Code of Conduct';
  public readonly subTitle = 'Library rules and policies';
  public readonly sectionDescription =
    'Define the rules and guidelines for your library. This helps maintain a productive study environment for all students.';
  public readonly editorLabel = 'Library Rules & Code of Conduct';
  public readonly helperText =
    'Use the toolbar to format your text. You can add headings, make text bold or italic, and create lists.';
  public readonly importantNote =
    'Important Note: Please ensure your code of conduct is fair, clear, and compliant with local laws. Include rules about noise levels, food/drinks, internet usage, and respect for others.';

  public isEditing = signal(true);

  // Minimal toolbar configuration to match your screenshot
  public quillConfig = {
    toolbar: [
      [{ header: [1, 2, 3, false] }], // Corresponds to "Text Style"
      ['bold', 'italic'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
  };

  constructor() {
    addIcons({ eyeOutline, createOutline });
  }

  ngOnInit() {
    this.conductControl = this.lrfService.mainForm.get('codeOfConduct') as FormControl;
  }

  togglePreview(state: boolean): void {
    this.isEditing.set(state);
  }
}
