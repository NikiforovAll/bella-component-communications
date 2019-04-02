import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/graph-data';
import { SVGConfig } from '../../../models/svg-config';
import { BaseConfig } from '../../../configs/base.config';
import { ComponentDrawingConfigurationItem } from '../../../models/component-drawing-configuration-item';
import { BehaviorSubject } from 'rxjs';
import { ComponentDiagramGraphLayout } from '../../../enums/component-diagram-graph-layout.enum';

@Component({
    selector: 'app-component-diagram',
    templateUrl: './component-diagram.component.html',
    styleUrls: ['./component-diagram.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDiagramComponent implements OnInit {
    public graphData: GraphData;
    public svgConfig: SVGConfig;
    public configurationItems$ = new BehaviorSubject<ComponentDrawingConfigurationItem[]>([]);
    public layout$ = new BehaviorSubject<ComponentDiagramGraphLayout>(ComponentDiagramGraphLayout.Circle);

    constructor(private storageService: StorageService) {}

    public ngOnInit(): void {
        this.svgConfig = BaseConfig.svgConfig;
        this.graphData = this.storageService.getComponentData();
        this.configurationItems$.next(
            this.graphData.nodes.map(node => ({ name: node.name, isChecked: true }))
        );
    }

    public onConfigurationChanged({ name, isChecked }: ComponentDrawingConfigurationItem): void {
        this.configurationItems$.next(
            this.configurationItems$.getValue()
                .map(node => node.name === name
                    ? { ...node, isChecked }
                    : node)
        );
    }

    public onDrawingConfigurationSelection(value: boolean): void {
        console.log(this.configurationItems$.getValue().map(node => ({ ...node, isChecked: value })));

        this.configurationItems$.next(
            this.configurationItems$.getValue()
                .map(node => ({ ...node, isChecked: value }))
        );
    }

    public onChangeLayout(newLayout: ComponentDiagramGraphLayout): void {
        this.layout$.next(newLayout);
    }
}
