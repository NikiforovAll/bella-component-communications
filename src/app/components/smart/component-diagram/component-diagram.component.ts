import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/storage-models/graph-data';
import { SVGConfig } from '../../../models/svg-config';
import { BaseConfig } from '../../../configs/base.config';
import { ComponentDrawingConfigurationItem } from '../../../models/component-drawing-configuration-item';
import { BehaviorSubject } from 'rxjs';
import { ComponentDiagramGraphLayout } from '../../../enums/component-diagram-graph-layout.enum';
import { DiagramUsageService } from 'src/app/services/diagram-usage/diagram-usage.service';
import { MethodCall } from 'src/app/models/storage-models/method-call';

@Component({
    selector: 'app-component-diagram',
    templateUrl: './component-diagram.component.html',
    styleUrls: ['./component-diagram.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentDiagramComponent implements OnInit, AfterViewInit {
    public graphData: GraphData;
    public methodCalls: MethodCall[];
    public svgConfig: SVGConfig;
    public configurationItems$ = new BehaviorSubject<ComponentDrawingConfigurationItem[]>([]);
    public layout$ = new BehaviorSubject<ComponentDiagramGraphLayout>(ComponentDiagramGraphLayout.LargeScaleNetwork);

    constructor(private storageService: StorageService, private diagramUsageService: DiagramUsageService) {}

    public ngOnInit(): void {
        this.svgConfig = BaseConfig.svgConfig;
        this.graphData = this.storageService.getComponentData();
        this.methodCalls = this.storageService.getMethodCallData();
        this.configurationItems$.next(
            this.graphData.nodes.map(node => ({ name: node.name, isChecked: true }))
        );
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.diagramUsageService.show();
        });
    }

    public onConfigurationChanged(item: ComponentDrawingConfigurationItem): void {
        this.onConfigurationChangedBulk([item]);
    }

    public onConfigurationChangedBulk(configurationItems: ComponentDrawingConfigurationItem[]): void {
            this.configurationItems$.next(
            this.configurationItems$.getValue()
                .map(node => configurationItems.map(el => el.name).includes(node.name)
                    ? { ...node, isChecked: configurationItems.find(ci => ci.name === node.name).isChecked }
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
