import { Component, ElementRef, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/graph-data';
import { SVGConfig } from '../../../models/svg-config';
import { ComponentDiagramGraphLayout, ComponentBuilder } from 'src/app/utils/component-builder';
import { BaseConfig } from 'src/app/configs/base.config';
import { ComponentDrawingConfigurationItem } from 'src/app/models/component-drawing-configuration-item';
import { ComponentDrawingConfiguration } from 'src/app/models/component-drawing-configuration';

@Component({
    selector: 'app-component-diagram',
    templateUrl: './component-diagram.component.html',
    styleUrls: ['./component-diagram.component.css'],
})
export class ComponentDiagramComponent implements OnInit {
    public data: GraphData;
    public svgConfig: SVGConfig;
    public layoutsKey: string[];
    public layouts: any;
    public componentDrawingConfiguration: ComponentDrawingConfiguration;
    public selectedLayout: any;

    public get isEmptyComponentDiagram(): boolean {
        return !this.componentDrawingConfiguration.configurationItems.some(el => el.isChecked);
    }

    constructor(private storageService: StorageService, private elementRef: ElementRef) {}

    ngOnInit() {
        this.svgConfig = BaseConfig.svgConfig;
        this.layouts = ComponentDiagramGraphLayout;
        this.layoutsKey = Object.keys(this.layouts).filter(f => !isNaN(Number(f)));
        this.selectedLayout = this.layoutsKey[0];
        this.data = this.storageService.getComponentData();
        this.componentDrawingConfiguration = {
            configurationItems: this.data.nodes.map(node => ({ name: node.name, isChecked: true })),
        };
    }

    public drawComponentDiagram($event) {
        if ($event.index === 1) {
            const svgDOM = this.elementRef.nativeElement.querySelector('#main-component-diagram');
            const builder = new ComponentBuilder(this.svgConfig, svgDOM);
            builder.clear();
            const dataToRender = this.filterDataByComponentName(
                this.data,
                this.componentDrawingConfiguration.configurationItems.filter(el => el.isChecked).map(el => el.name),
            );
            // builder.build(dataToRender);
            builder.buildFromLayout(dataToRender, this.selectedLayout);
        }
    }

    public drawingConfigurationChanged(item: ComponentDrawingConfigurationItem, $event) {
        item.isChecked = $event.checked;
    }

    public setDrawingConfigurationSelection(value: boolean) {
        this.componentDrawingConfiguration.configurationItems.forEach(el => (el.isChecked = value));
    }

    private filterDataByComponentName(data: GraphData, names: string[]) {
        const clonedData = JSON.parse(JSON.stringify(data));
        // if (names.length !== 0) {
        clonedData.nodes = data.nodes.filter(el => names.indexOf(el.name) !== -1);
        // }
        return clonedData;
    }
}
