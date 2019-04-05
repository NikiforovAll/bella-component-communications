import * as d3 from 'd3';
import { SVGConfig } from '../../models/svg-config';
import { ItemRegistry } from '../../models/item-registry';
import { GraphData } from '../../models/graph-data';
import {
    getTransformation,
    polygon,
    generateLargeScaleGraph,
    buildTransformTemplate
} from '../../utils/utils';
import { IComponentBuilder } from '../../interfaces/IComponentBuilder';
import { ComponentDiagramGraphLayout } from 'src/app/enums/component-diagram-graph-layout.enum';
import { serializePath } from '@angular/router/src/url_tree';

export class ComponentBuilderService implements IComponentBuilder {

    public domItemRegistry: ItemRegistry;
    private innerContainer: any;

    get componentLineHeight(): number {
        return this.svgConfig.componentConfig.textLineHeight;
    }

    constructor(private svgConfig: SVGConfig, private svg: any) {
        this.domItemRegistry = new ItemRegistry();
        this.svg = d3.select(svg);
        // TODO: this code has issue with data and representation separation.
    }

    build(data: GraphData): void {
        this.buildFromLayout(data, ComponentDiagramGraphLayout.Circle);
    }

    buildFromLayout(data: GraphData, layout: ComponentDiagramGraphLayout): void {
        this.innerContainer = this.svg.append('g').attr('class', 'diagram-root');
        this.defineAdditionalElements();
        const dom = this.initializeVirtualDOM(data, layout);
        dom.nodes.forEach(element => {
            let diagramComponent = element as DiagramComponent;
            this.drawComponentElement(diagramComponent)
            diagramComponent.services.forEach(
                virtualService => {
                    let service = virtualService as DiagramService;
                    this.drawServiceElement(diagramComponent, service);
                }
            );

        });
        this.applyZoom(dom);
        console.log('domItemRegistry', this.domItemRegistry);
    }

    clear(): void {
        this.svg.selectAll('*').remove();
        this.domItemRegistry.clear();
    }

    private drawComponentElement(component: DiagramComponent) {
        const container = this.innerContainer
            .append('g')
            .attr('transform', buildTransformTemplate(component.coordinates.x, component.coordinates.y));
        container
            .append('text')
            .text(component.title)
            .attr('y', this.componentLineHeight - this.svgConfig.textPadding)
            .attr('x', this.svgConfig.textPadding);
        this.domItemRegistry.registerComponent(component.title, component, container);
    }

    private drawServiceElement(component: DiagramComponent, service: DiagramService) {
        const serviceItemContainer = this.domItemRegistry
            .getComponent(component.title)
            .container
            .append('g')
            .attr('id', service.title)
            .attr('transform', buildTransformTemplate(0, service.coordinates.y));
        this.domItemRegistry.registerService(service.title, service, serviceItemContainer);
    }

    private initializeVirtualDOM(data: GraphData, layout: ComponentDiagramGraphLayout): VirtualDOM {
        let coordinates: ElementCoordinate[];
        const mapFromArrayToCoordinate =
            (array: any[]) => array.map(
                kvp => ({ x: kvp[0], y: kvp[1] })
            );
        switch (layout) {
            case ComponentDiagramGraphLayout.Circle: {
                const center = { x: this.svgConfig.width / 2, y: this.svgConfig.height / 2 };
                const radius = this.svgConfig.height - this.svgConfig.margin;
                const sidesCount: number = data.nodes.length;
                coordinates = mapFromArrayToCoordinate(polygon(center.x, center.y, radius, sidesCount));
                break;
            }
            case ComponentDiagramGraphLayout.LargeScaleNetwork: {
                coordinates = mapFromArrayToCoordinate(generateLargeScaleGraph(data, this.svgConfig));
                break;
            }
            default: {
                throw new Error("Layout was not found");
                break;
            }
        }
        const components = data.nodes.map((componentData, i) => {
            const diagramComponent = new DiagramComponent(componentData.name, coordinates[i]);
            diagramComponent.services = componentData.services.map(serviceData => new DiagramService(serviceData.name));
            return diagramComponent;
        });

        return {
            nodes: components,
            type: layout
        };
    }

    private defineAdditionalElements() {
        this.svg
            .append('svg:defs')
            .append('svg:marker')
            .attr('id', 'arrow')
            .attr('refX', 11.5)
            .attr('refY', 2.5)
            .attr('markerWidth', 20)
            .attr('markerHeight', 20)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,0 L5,2.5 L0,5 Z')
            .attr('class', 'arrow');
    }

    private applyZoom(dom: VirtualDOM) {
        const zoom = d3.zoom().on('zoom', zoomed);

        const ctx = this.innerContainer;
        function zoomed() {
            ctx.attr('transform', d3.event.transform);
        }
        if (dom.type === ComponentDiagramGraphLayout.Circle) {
            const scale = 0.4;
            const zoomWidth = (this.svgConfig.width - scale * this.svgConfig.width) / 2;
            const zoomHeight = (this.svgConfig.height - scale * this.svgConfig.height) / 2;
            this.svg.call(zoom.transform, d3.zoomIdentity.translate(zoomWidth, zoomHeight).scale(scale));
        }
        if (dom.type === ComponentDiagramGraphLayout.LargeScaleNetwork) {
            const scale = 0.3;
            let minWidth = Math.min(...dom.nodes.map(el => el.coordinates.x)) - this.svgConfig.margin;
            const minHeight = Math.min(...dom.nodes.map(el => el.coordinates.y)) - this.svgConfig.margin;

            this.svg.call(zoom.transform, d3.zoomIdentity.translate(-minWidth, -minHeight).scale(scale));
        }
        this.svg.call(zoom);
    }
}

class VirtualDOM {
    nodes: IVirtualNode[];
    type: ComponentDiagramGraphLayout;
}
class DiagramComponent implements IDiagramComponent {
    services: IDiagramService[];
    links: IDiagramLink[];
    coordinates: ElementCoordinate;
    title: string;
    frame: IElementFrame;
    nodeClass: string;


    constructor(title: string, coordinates: ElementCoordinate) {
        this.coordinates = coordinates;
        this.title = title;
        this.nodeClass = 'diagram-component';
        this.services = [];
        this.links = [];
        this.frame = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        };
    }
}

class DiagramService implements IDiagramService{
    hostedOn: string;
    coordinates: ElementCoordinate;
    title: string;
    frame: IElementFrame;
    nodeClass: string;
    constructor(title: string) {
        this.title = title;
        this.nodeClass = 'diagram-service';
        this.frame = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        };
    }
}

interface IVirtualNode {
    coordinates: ElementCoordinate;
    title: string;
    frame: IElementFrame;
    nodeClass: string;
    // build(): void;
}


interface IDiagramComponent extends IVirtualNode {
    services: IDiagramService[];
    links: IDiagramLink[];
}

interface IDiagramService extends IVirtualNode {
}

interface IDiagramLink {
    start: ElementCoordinate;
    end: ElementCoordinate;
}

interface IElementFrame {
    start: ElementCoordinate;
    end: ElementCoordinate;
}

interface ElementCoordinate {
    x: number;
    y: number;
}
