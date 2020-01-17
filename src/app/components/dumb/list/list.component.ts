import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ComponentDrawingConfigurationItem } from '../../../models/component-drawing-configuration-item';
import { ComponentDiagramGraphLayout } from '../../../enums/component-diagram-graph-layout.enum';
import { findUsedByComponents } from 'src/app/utils/storage-data.utils';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GraphData } from 'src/app/models/storage-models/graph-data';
@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
    @Input() configurationItems: ComponentDrawingConfigurationItem[];
    @Input() layout: ComponentDiagramGraphLayout = ComponentDiagramGraphLayout.LargeScaleNetwork;

    @Output() changeConfigSelection = new EventEmitter<boolean>();
    @Output() componentChecked = new EventEmitter<ComponentDrawingConfigurationItem>();
    @Output() componentsChecked = new EventEmitter<ComponentDrawingConfigurationItem[]>();
    @Output() changeLayout = new EventEmitter<ComponentDiagramGraphLayout>();

    public layoutsKey =  Object.keys(ComponentDiagramGraphLayout).filter(f => !isNaN(Number(f)));
    public layouts = ComponentDiagramGraphLayout;

    private cachedData: GraphData;
    constructor(storageService: StorageService) {
        this.cachedData = storageService.getComponentData();
    }

    public onConfigurationChanged({ name }: ComponentDrawingConfigurationItem, $event): void {
        this.componentChecked.next({ name, isChecked: $event.checked });
    }

    public onBuildDependencies() {

        const selectedComponentNames = [];
        this.configurationItems.filter(ci => ci.isChecked).forEach(ci => selectedComponentNames
            .push(...findUsedByComponents(this.cachedData.nodes, ci.name, true)
                    .map(c => ({name: c.name, isChecked: true})))
        );
        this.componentsChecked.next(selectedComponentNames);
    }

    public onDrawingConfigurationSelection(value: boolean): void {
        this.changeConfigSelection.next(value);
    }

    public onChangeLayout(newLayout: ComponentDiagramGraphLayout): void {
        this.changeLayout.next(+newLayout);
    }
}
