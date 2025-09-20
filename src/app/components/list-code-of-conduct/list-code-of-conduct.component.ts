import { Component, Input, OnInit } from '@angular/core';
import { IonAccordionGroup, IonAccordion, IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-list-code-of-conduct',
  templateUrl: './list-code-of-conduct.component.html',
  styleUrls: ['./list-code-of-conduct.component.scss'],
  imports: [IonItem, IonAccordion, IonAccordionGroup],
})
export class ListCodeOfConductComponent implements OnInit {
  @Input() codeOfConduct!: string[];

  constructor() {}

  ngOnInit() {}
}
