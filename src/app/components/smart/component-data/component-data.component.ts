import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/storage-models/graph-data';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-component-data',
    templateUrl: './component-data.component.html',
    styleUrls: ['./component-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDataComponent implements OnInit {

    data$: BehaviorSubject<GraphData>;

    constructor(private storageService: StorageService) {
        this.data$ = new BehaviorSubject<GraphData>(this.storageService.getComponentData());
    }

    ngOnInit() {
    }
}
