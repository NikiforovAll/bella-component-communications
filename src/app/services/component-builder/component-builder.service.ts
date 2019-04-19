import * as d3 from 'd3';
import { SVGConfig } from '../../models/svg-config';
import { ItemRegistry } from '../../models/item-registry';
import { GraphData } from '../../models/storage-models/graph-data';
import {
    polygon,
    generateLargeScaleGraph,
    buildTransformTemplate,
    calculateAbsoluteServiceConnector
} from '../../utils/utils';
import { IComponentBuilder } from '../../interfaces/IComponentBuilder';
import { ComponentDiagramGraphLayout } from 'src/app/enums/component-diagram-graph-layout.enum';
import { DiagramService } from '../../models/diagram-service';
import { ElementCoordinate } from '../../models/element-coordinate';
import { VirtualDOM } from '../../models/virtual-dom';
import { DiagramComponent } from '../../models/diagram-component';
import { DiagramLink } from 'src/app/models/diagram-link';
import { Subject, Observable } from 'rxjs';

export class ComponentBuilderService implements IComponentBuilder {

    public domItemRegistry: ItemRegistry;
    componentSelected$: Observable<string>;

    public get componentLineHeight(): number {
        return this.svgConfig.componentConfig.textLineHeight;
    }

    private componentSelectedSource = new Subject<string>();
    private innerContainer: any;

    constructor(private svgConfig: SVGConfig, private svg: any) {
        this.domItemRegistry = new ItemRegistry();
        this.svg = d3.select(svg);
        this.componentSelected$ = this.componentSelectedSource.asObservable();
    }

    public build(data: GraphData): void {
        this.buildFromLayout(data, ComponentDiagramGraphLayout.Circle);
    }

    public buildFromLayout(data: GraphData, layout: ComponentDiagramGraphLayout): void {
        this.innerContainer = this.svg.append('g').attr('class', 'diagram-root');
        this.defineAdditionalElements();
        const dom = this.initializeVirtualDOM(data, layout);
        dom.nodes.forEach(element => {
            const diagramComponent = element as DiagramComponent;
            this.drawComponentElement(diagramComponent);
            diagramComponent.services.forEach(
                virtualService => {
                    const service = virtualService as DiagramService;
                    this.drawServiceElement(diagramComponent, service);
                }
            );

        });
        dom.nodes.forEach(element => {
            const diagramComponent = element as DiagramComponent;
            this.drawServiceLinks(diagramComponent);
        });
        this.applyZoom(dom);
        this.applyDraggable();
        // console.log('domItemRegistry', this.domItemRegistry);
    }

    public clear(): void {
        this.svg.selectAll('*').remove();
        this.domItemRegistry.clear();
    }

    private drawComponentElement(component: DiagramComponent) {
        const container = this.innerContainer
            .append('g')
            .attr('class', 'component-container')
            .attr('id', component.title)
            .attr('transform', buildTransformTemplate(component.coordinates.x, component.coordinates.y));
        container
            .append('rect')
            .attr('height', component.frameHeight)
            .attr('width', component.frameWidth);
        container.append('g')
            .attr('class', 'service-group')
            .attr('y', this.componentLineHeight);
        container
            .append('text')
            .text(component.title)
            .attr('y', this.componentLineHeight - this.svgConfig.textPadding)
            .attr('x', this.svgConfig.textPadding);
        container
            .append('g')
            .append('circle')
            .attr('cx', this.svgConfig.componentConfig.width / 2)
            .attr('cy', 0)
            .attr('r', this.componentLineHeight / 4)
            .attr('class', 'component-connector');
        component.implementation = container;
        const ctx = this;
        container.on('dblclick', function(d) {
            const componentId = d3.select(this).attr('id');
            ctx.componentSelectedSource.next(componentId);
        });
        this.domItemRegistry.registerComponent(component.title, component, container);
    }

    private drawServiceElement(component: DiagramComponent, service: DiagramService) {
        const serviceItemContainer = this.domItemRegistry
            .getComponent(component.title).container.select('.service-group')
            .append('g')
            .attr('id', service.title)
            .attr('class', 'service-container')
            .attr('transform', buildTransformTemplate(0, service.coordinates.y));
        const itemContainer = serviceItemContainer
            .append('g')
            .attr('transform', buildTransformTemplate(0, this.componentLineHeight / 2));
        itemContainer
            .append('rect')
            .attr('height', service.frameHeight)
            .attr('width', service.frameWidth);
        serviceItemContainer
            .append('text')
            .text(service.title)
            .attr('y', this.componentLineHeight - this.svgConfig.textPadding / 4)
            .attr('x', this.svgConfig.textPadding);
        itemContainer
            .append('circle')
            .attr('cx', this.svgConfig.componentConfig.width)
            .attr('cy', service.frameHeight / 2)
            .attr('r', this.componentLineHeight / 4)
            .attr('class', 'service-connector');
        this.domItemRegistry.registerService(service.title, service, serviceItemContainer);
    }

    private drawServiceLinks(component: DiagramComponent) {
        component.links.forEach(link => {
            const linkImpl = this.innerContainer.
                append('line')
                .attr('x1', link.start.x)
                .attr('y1', link.start.y)
                .attr('x2', link.end.x)
                .attr('y2', link.end.y)
                .attr('class', 'service-link')
                .style('marker-end', 'url(#arrow)');
            link.implementation = linkImpl;
        });
    }

    private initializeVirtualDOM(data: GraphData, layout: ComponentDiagramGraphLayout): VirtualDOM {
        const coordinates = this.calculateComponentCoordinates(data, layout);
        const components = data.nodes.map((componentData, componentIndex) => {
            const diagramComponent = new DiagramComponent(
                componentData.name,
                coordinates[componentIndex],
                {
                    frame: {
                        start: {
                            x: 0,
                            y: 0
                        },
                        end: {
                            x: this.svgConfig.componentConfig.width,
                            y: this.componentLineHeight * (componentData.services.length + 1) + this.svgConfig.textPadding * 3
                        }
                    },
                    updateCallback: (ctx, impl) => {
                        impl.attr('transform', buildTransformTemplate(ctx.coordinates.x, ctx.coordinates.y));
                    }
                }
            );
            diagramComponent.services = componentData
                .services
                .map(
                    (serviceData, serviceIndex) => new DiagramService(
                        serviceData.name,
                        {
                            coordinates: { x: 0, y: this.componentLineHeight * (serviceIndex + 1) },
                            hostedOn: serviceData.on,
                            frame: {
                                start: {
                                    x: 0,
                                    y: 0
                                },
                                end: {
                                    x: this.svgConfig.componentConfig.width,
                                    y: this.componentLineHeight
                                }
                            },
                            parentComponent: diagramComponent
                        }
                    )
                );

            return diagramComponent;

        });

        const hostedServices: DiagramService[] = components
            .map(component => component.services as DiagramService[])
            .reduce((a, b) => a.concat(b));

        data.nodes.forEach(componentDataItem => {
            const fromComponent = components.find(el => el.title === componentDataItem.name);
            componentDataItem.consumes.forEach(consumedService => {
                const toComponent = components.find(
                    el => el.services
                        .map(s => s.title)
                        .includes(consumedService.name)
                );
                const toService = hostedServices.find(
                    s => s.title === consumedService.name
                );
                if (!!toService) {
                    const serviceConnector = calculateAbsoluteServiceConnector(toComponent, toService);
                    const currLink = new DiagramLink(
                        {
                            start: fromComponent.getConnector(),
                            end: {
                                x: serviceConnector.x,
                                y: serviceConnector.y
                            },
                            fromComponent: fromComponent.title,
                            toComponent: toComponent.title,
                            toService: toService.title,
                            updateCallback: (ctx, linkImpl) => {
                                linkImpl.attr('x1', ctx.start.x)
                                    .attr('y1', ctx.start.y)
                                    .attr('x2', ctx.end.x)
                                    .attr('y2', ctx.end.y);
                            }
                        }
                    );
                    toComponent.subscribedLinks.push(currLink);
                    fromComponent.links.push(currLink);
                }
            }
            );
        });
        return {
            nodes: components,
            type: layout
        };
    }

    private calculateComponentCoordinates(data: GraphData, layout: ComponentDiagramGraphLayout) {
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
                throw new Error('Layout was not found');
                break;
            }
        }
        return coordinates;
    }

    private defineAdditionalElements() {
        this.svg
            .append('svg:defs')
            .append('svg:marker')
            .attr('id', 'arrow')
            .attr('refX', 8)
            .attr('refY', 2.5)
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
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
            let scale = 0.4;
            scale = Math.max(scale, 0.55 - 0.01 * dom.nodes.length);
            const zoomWidth = (this.svgConfig.width - scale * this.svgConfig.width) / 2;
            const zoomHeight = (this.svgConfig.height - scale * this.svgConfig.height) / 2;
            this.svg.call(zoom.transform, d3.zoomIdentity.translate(zoomWidth, zoomHeight).scale(scale));
        }
        if (dom.type === ComponentDiagramGraphLayout.LargeScaleNetwork) {
            let scale = 0.3;
            scale = Math.max(0.3, 1 - 0.05 * dom.nodes.length);
            const minWidth = Math.min(...dom.nodes.map(el => el.coordinates.x)) - this.svgConfig.margin;
            const minHeight = Math.min(...dom.nodes.map(el => el.coordinates.y)) - this.svgConfig.margin;

            this.svg.call(zoom.transform, d3.zoomIdentity.translate(-minWidth, -minHeight).scale(scale));
        }
        this.svg.call(zoom).on('dblclick.zoom', null);
    }

    private applyDraggable() {
        const context = this;
        const onComponentDragStarted = function (d) {
            d3.select(this).raise().classed('drag-active', true);
        };
        const onComponentDragProgress = function (d) {
            const componentId = d3.select(this).attr('id');
            let { element: component } = context.domItemRegistry.getComponent(componentId);
            component = component as DiagramComponent;
            component.setCoordinates(d3.event.x - component.frameWidth / 2, d3.event.y - component.frameHeight / 2);
            component.links.forEach((link: DiagramLink) => {
                const { x: x1, y: y1 } = component.getConnector();
                link.setCoordinates(x1, y1, link.end.x, link.end.y);
            });
            component.subscribedLinks.forEach((link: DiagramLink) => {
                const toService = component.services.find(s => s.title === link.toService);
                const serviceConnector = calculateAbsoluteServiceConnector(component, toService);
                link.setCoordinates(
                    link.start.x,
                    link.start.y,
                    serviceConnector.x,
                    serviceConnector.y
                );
            });
        };
        const onComponentDragFinished = function (d) {
            d3.select(this).classed('drag-active', false);
        };
        this.innerContainer.selectAll('.component-container')
            .call(
                d3.drag()
                    .on('start', onComponentDragStarted)
                    .on('drag', onComponentDragProgress)
                    .on('end', onComponentDragFinished)
            );
    }
}
