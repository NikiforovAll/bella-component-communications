import { Component, ElementRef, OnInit } from '@angular/core';
import { StorageService } from '../../../services/storage/storage.service';
import { GraphData } from '../../../models/graph-data';
import { SVGConfig } from '../../../models/svg-config';
import { ComponentDiagramGraphLayout, ComponentBuilder } from 'src/app/utils/component-builder';

@Component({
    selector: 'app-component-diagram',
    templateUrl: './component-diagram.component.html',
    styleUrls: ['./component-diagram.component.css'],
})
export class ComponentDiagramComponent implements OnInit {
    label: string;
    data: GraphData;
    svgConfig: SVGConfig;
    layoutsKey: string[];
    layouts: any;
    public componentDrawingConfiguration: ComponentDrawingConfiguration;
    public selectedLayout: any;

    public get isEmptyComponentDiagram(): boolean {
        return !this.componentDrawingConfiguration.configurationItems.some(el => el.isChecked);
    }

    constructor(private storageService: StorageService, private elementRef: ElementRef) {
        this.label = 'component-diagram.component';
        this.svgConfig = {
            width: 1600,
            height: 1200,
            margin: 150,
            componentConfig: {
                width: 250,
                height: 200,
                textLineHeight: 30,
            },
            textPadding: 5,
        };
        this.layouts = ComponentDiagramGraphLayout;
        this.layoutsKey = Object.keys(this.layouts).filter(f => !isNaN(Number(f)));
        this.selectedLayout = this.layoutsKey[0];
    }

    ngOnInit() {
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
interface ComponentDrawingConfiguration {
    configurationItems: ComponentDrawingConfigurationItem[];
}

interface ComponentDrawingConfigurationItem {
    name: string;
    isChecked: boolean;
}
