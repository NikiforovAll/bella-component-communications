import { Component, OnInit } from '@angular/core';
import { StorageService } from "../storage.service";
import { GraphData } from 'projects/graph-builder/src/public-api';
@Component({
  selector: 'app-component-data',
  templateUrl: './component-data.component.html',
  styleUrls: ['./component-data.component.scss']
})
export class ComponentDataComponent implements OnInit {

  data: GraphData;

  constructor(private storageService: StorageService) { }

  ngOnInit() {
    this.data = this.storageService.getComponentData();
  }

}
