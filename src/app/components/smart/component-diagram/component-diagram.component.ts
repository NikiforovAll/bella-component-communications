import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/storage-models/graph-data';
import { SVGConfig } from '../../../models/svg-config';
import { BaseConfig } from '../../../configs/base.config';
import { ComponentDrawingConfigurationItem } from '../../../models/component-drawing-configuration-item';
import { BehaviorSubject } from 'rxjs';
import { ComponentDiagramGraphLayout } from '../../../enums/component-diagram-graph-layout.enum';
import { DiagramUsageService } from 'src/app/services/diagram-usage/diagram-usage.service';

@Component({
    selector: 'app-component-diagram',
    templateUrl: './component-diagram.component.html',
    styleUrls: ['./component-diagram.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDiagramComponent implements OnInit, AfterViewInit {
    public graphData: GraphData;
    public svgConfig: SVGConfig;
    public configurationItems$ = new BehaviorSubject<ComponentDrawingConfigurationItem[]>([]);
    public layout$ = new BehaviorSubject<ComponentDiagramGraphLayout>(ComponentDiagramGraphLayout.Circle);

    constructor(private storageService: StorageService, private diagramUsageService: DiagramUsageService) {}

    public ngOnInit(): void {
        this.svgConfig = BaseConfig.svgConfig;
        this.graphData = this.storageService.getComponentData();
        this.configurationItems$.next(
            this.graphData.nodes.map(node => ({ name: node.name, isChecked: true }))
        );
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.diagramUsageService.show();
          });
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
        this.configurationItems$.next(
            this.configurationItems$.getValue()
                .map(node => ({ ...node, isChecked: value }))
        );
    }

    public onChangeLayout(newLayout: ComponentDiagramGraphLayout): void {
        this.layout$.next(newLayout);
    }
}
