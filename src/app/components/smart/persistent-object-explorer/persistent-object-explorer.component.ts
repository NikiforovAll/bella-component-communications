import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StorageService, NamespacedDeclarations, DeclarationType, KeyedDeclaration } from 'src/app/services/storage/storage.service';
import { PersistentObjectUtils, PersistentObjectViewModel } from 'src/app/models/persistent-object-models/persistent-object.view-model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-persistent-object-explorer',
  templateUrl: './persistent-object-explorer.component.html',
  styleUrls: ['./persistent-object-explorer.component.scss']
})
export class PersistentObjectExplorerComponent implements OnInit {

  selectedComponent: string;
  components: string[];
  allObjectsGrouped: NamespacedDeclarations[];
  allObjects: KeyedDeclaration[];
  objectsToPresent: PersistentObjectViewModel[];
  selectedObject: any;

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    ref: ChangeDetectorRef) {
    this.init();
    this.route.queryParams.subscribe(params => {
      const { component, object } = params;
      this.selectedComponent = component;
      this.selectedObject = object;
      this.buildRoot();
      ref.markForCheck();
    });
  }

  init() {
    this.components = this.storage.getServiceReferences().map((group) => group.namespace);
    this.allObjectsGrouped = this.storage.getObjectDeclarations();
    this.allObjects = this.storage.getObjectDeclarations()
      .map(namespaced => namespaced.declarations)
      .reduce((acc, val) => acc.concat(val), []);
  }
  ngOnInit() {
  }

  buildRoot() {
    if (!this.selectedObject && !this.selectedComponent) {
      return;
    }
    if (this.selectedObject) {
      this.objectsToPresent = this.allObjects.filter(declaration => declaration.name === this.selectedObject)
        .map(declaration => PersistentObjectUtils.toPersistentObjectViewModel(declaration, this.allObjects));
      return;
    }
    this.objectsToPresent = this.allObjectsGrouped
      .find(namespaced => namespaced.namespace === this.selectedComponent).declarations
      .filter(declaration => declaration.type === DeclarationType.PersistentObject)
      .map(declaration => PersistentObjectUtils.toPersistentObjectViewModel(declaration, this.allObjects));
  }

  changeQuery() {
    this.router.navigate(['.'], {
      relativeTo: this.route, queryParams: {
        component: this.selectedComponent,
      }
    });
  }

}
