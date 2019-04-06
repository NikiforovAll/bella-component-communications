import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/storage-models/graph-data';

@Component({
    selector: 'app-component-data',
    templateUrl: './component-data.component.html',
    styleUrls: ['./component-data.component.scss'],
})
export class ComponentDataComponent implements OnInit {
    data: GraphData;

    constructor(private storageService: StorageService) {}

    ngOnInit() {
        this.data = this.storageService.getComponentData();
    }
}
