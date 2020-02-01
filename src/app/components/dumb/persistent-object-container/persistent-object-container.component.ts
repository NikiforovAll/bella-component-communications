import { Component, OnInit, Input } from '@angular/core';
import { PersistentObjectViewModel } from 'src/app/models/persistent-object-models/persistent-object.view-model';
import { PrettyPrintPipe } from 'src/app/pipes/pretty-print.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-persistent-object-container',
  templateUrl: './persistent-object-container.component.html',
  styleUrls: ['./persistent-object-container.component.scss'],
})
export class PersistentObjectContainerComponent implements OnInit {

  @Input()
  container: PersistentObjectViewModel;

  @Input()
  expanded = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  zoomInToContainer() {
    this.router.navigate(['/persistent-objects'],
    {
      queryParams: {
        object: this.container.name
      }
    });
  }

}
