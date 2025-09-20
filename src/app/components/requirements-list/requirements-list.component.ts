import { Component, Input, OnInit } from '@angular/core';
import { IonIcon, IonCardSubtitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-requirements-list',
  templateUrl: './requirements-list.component.html',
  styleUrls: ['./requirements-list.component.scss'],
  imports: [IonIcon],
})
export class RequirementsListComponent implements OnInit {
  @Input() requirements: string[] = [];
  constructor() {}

  ngOnInit() {}
}
