// import * as d3 from 'd3';
// import { SVGConfig } from '../../models/svg-config';
// import { ItemRegistry } from '../../models/item-registry';
// import { GraphData } from '../../models/graph-data';
// import { getTransformation, polygon } from '../../utils/utils';
// import { DiagramComponent } from '../../models/diagram-component';
// import { Service } from '../../models/service';
// import { IComponentBuilder } from '../../interfaces/IComponentBuilder';
// import dagre from 'dagre';
// import { ComponentDiagramGraphLayout } from 'src/app/enums/component-diagram-graph-layout.enum';

// export class ComponentBuilderService implements IComponentBuilder {
//     public domItemRegistry: ItemRegistry;
//     private innerContainer: any;

//     constructor(private svgConfig: SVGConfig, private svg: any) {
//         this.domItemRegistry = new ItemRegistry();
//         this.svg = d3.select(svg);
//         // TODO: this code has issue with data and representation separation.
//     }

//     get componentLineHeight(): number {
//         return this.svgConfig.componentConfig.textLineHeight;
//     }

//     get rootContainer(): any {
//         return this.innerContainer;
//     }

//     public build(data: GraphData) {
//         this.buildFromLayout(data, ComponentDiagramGraphLayout.Circle);
//     }

//     public buildFromLayout(data: GraphData, layout: ComponentDiagramGraphLayout) {
//         this.innerContainer = this.svg.append('g');
//         this.defineAdditionalElements();
//         data.nodes.forEach(node => this.drawNode(node));
//         this.initializeDOM(data, layout);
//         this.connectComponents(data.nodes);

//         this.applyZoom();
//     }

//     public generateLayout(data: GraphData) {
//         const g = new dagre.graphlib.Graph();
//         g.setGraph({});
//         // Default to assigning a new object as a label for each new edge.
//         g.setDefaultEdgeLabel(() => ({}));

//         data.nodes.forEach(component =>
//             g.setNode(component.name, {
//                 label: component.name,
//                 width: this.svgConfig.componentConfig.width,
//                 height: this.svgConfig.componentConfig.height,
//             }),
//         );

//         // TODO: set edges, change
//         data.nodes.forEach(component => {
//             // DOESN'T WORK, registry is not filled on init
//             // for (let service of component.consumes) {
//             //     console.log("domItemRegistry ", this.domItemRegistry);
//             //     if (this.domItemRegistry.services.hasOwnProperty(service.name)) {
//             //         console.log("edge " + component.name + " to " + this.domItemRegistry.services[service.name].componentName);
//             //         g.setEdge(component.name, this.domItemRegistry.services[service.name].componentName);
//             //     }
//             // }
//             for (const service of component.consumes) {
//                 if (data.nodes.some(component2 => component2.services.some(service2 => service2.name === service.name))) {
//                     const result = data.nodes.filter(component2 => component2.services.some(service2 => service2.name === service.name));
//                     // console.log(`Edge: from ${component.name} to -> ${result[0].name}`);
//                     g.setEdge(component.name, result[0].name);
//                 }
//             }
//         });

//         dagre.layout(g);
//         // g.nodes().forEach(function (v) {
//         //     console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
//         // });
//         // g.edges().forEach(function (e) {
//         //     console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
//         // });

//         return g.nodes().map(v => [g.node(v).x, g.node(v).y]);
//     }

//     public clear() {
//         this.svg.selectAll('*').remove();
//         this.domItemRegistry.clear();
//     }

//     private initializeDOM(data: GraphData, layout: ComponentDiagramGraphLayout): void {
//         const center = { x: this.svgConfig.width / 2, y: this.svgConfig.height / 2 };
//         const radius = this.svgConfig.height - this.svgConfig.margin;
//         const sidesCount: number = data.nodes.length;
//         const coordinates = (layout === ComponentDiagramGraphLayout.Circle)
//             ? polygon(center.x, center.y, radius, sidesCount)
//             : this.generateLayout(data);

//         data.nodes.forEach((node, i) => {
//             if (!node.dom) {
//                 node.dom = {};
//             }
//             node.dom.x = coordinates[i][0];
//             node.dom.y = coordinates[i][1];
//         });
//     }

//     private drawNode(component: DiagramComponent): void {
//         const textLineHeight = this.componentLineHeight;
//         const container = this.rootContainer.append('g').attr('transform', this.buildTransformTemplate(component.dom.x, component.dom.y));
//         this.domItemRegistry.components[component.name] = {
//             component,
//             container,
//         };
//         // container
//         //     .append("rect")
//         //     .attr("height", this.svgConfig.componentConfig.height)
//         //     .attr("width", this.svgConfig.componentConfig.width)
//         //     .attr("id", component.name)
//         //     .attr("class", "component-container");
//         container
//             .append('text')
//             .text(component.name)
//             .attr('y', textLineHeight - this.svgConfig.textPadding)
//             .attr('x', this.svgConfig.textPadding);

//         container
//             .append('line')
//             .attr('x1', 0)
//             .attr('y1', textLineHeight)
//             .attr('x2', this.svgConfig.componentConfig.width)
//             .attr('y2', textLineHeight)
//             .attr('class', 'component-header-line');
//         const serviceContainer = container.append('g').attr('transform', this.buildTransformTemplate(0, textLineHeight));

//         container
//             .append('g')
//             .append('circle')
//             .attr('cx', this.svgConfig.componentConfig.width / 2)
//             .attr('cy', 0)
//             .attr('r', this.componentLineHeight / 4)
//             .attr('class', 'component-connector');
//         component.services.forEach((service, i) => this.drawService(service, component.name, serviceContainer, i));
//     }

//     private connectComponents(components: DiagramComponent[]) {
//         components
//             .filter(component => component.consumes)
//             .forEach(component =>
//                 component.consumes
//                     .filter(service =>
//                         this.domItemRegistry.services.hasOwnProperty(service.name)
//                     )
//                     .forEach(service =>
//                         this.drawLink(component, this.domItemRegistry.services[service.name])
//                     )
//             );
//     }

//     private drawLink(from: DiagramComponent, to: any) {
//         const serviceItemPositions = getTransformation(to.container.attr('transform'));
//         const componentPositions = getTransformation(this.domItemRegistry.components[to.componentName].container.attr('transform'));

//         // TBD: use items from registry, it is bad way to create link
//         this.rootContainer
//             .append('line')
//             .attr('x1', from.dom.x + this.svgConfig.componentConfig.width / 2)
//             .attr('y1', from.dom.y)
//             .attr('x2', componentPositions.translateX + serviceItemPositions.translateX + this.svgConfig.componentConfig.width)
//             .attr('y2', componentPositions.translateY + serviceItemPositions.translateY + this.componentLineHeight * 1.75)
//             .attr('class', 'service-link')
//             .style('marker-end', 'url(#arrow)');
//     }

//     private drawService(service: Service, componentName: string, container: any, i: number) {
//         const serviceItemContainer = container
//             .append('g')
//             .attr('id', service.name)
//             .attr('transform', this.buildTransformTemplate(0, this.componentLineHeight * i));

//         this.domItemRegistry.services[service.name] = {
//             componentName,
//             service,
//             container: serviceItemContainer,
//         };

//         const itemContainer = serviceItemContainer
//             .append('g')
//             .attr('transform', this.buildTransformTemplate(0, this.componentLineHeight / 2));
//         itemContainer
//             .append('rect')
//             .attr('height', this.componentLineHeight / 2)
//             .attr('width', this.svgConfig.componentConfig.width)
//             .attr('class', 'service-container');
//         serviceItemContainer
//             .append('text')
//             .text(service.name)
//             .attr('y', this.componentLineHeight - this.svgConfig.textPadding)
//             .attr('x', this.svgConfig.textPadding);
//         const circle = itemContainer
//             .append('circle')
//             .attr('cx', this.svgConfig.componentConfig.width)
//             .attr('cy', this.componentLineHeight / 4)
//             .attr('r', this.componentLineHeight / 4)
//             .attr('class', 'service-connector');
//     }

//     private buildTransformTemplate(x: any, y: any): string {
//         return `translate(${x}, ${y})`;
//     }

//     private applyZoom() {
//         const zoom = d3.zoom().on('zoom', zoomed);

//         const ctx = this.innerContainer;
//         function zoomed() {
//             ctx.attr('transform', d3.event.transform);
//         }
//         const scale = 0.4;
//         const zoomWidth = (this.svgConfig.width - scale * this.svgConfig.width) / 2;
//         const zoomHeight = (this.svgConfig.height - scale * this.svgConfig.height) / 2;
//         // this.svg.call(zoom)
//         this.svg.call(zoom.transform, d3.zoomIdentity.translate(zoomWidth, zoomHeight / 2).scale(scale));
//         this.svg.call(zoom);
//     }

//     private applyDraggable() {
//         // TODO:
//     }

//     private defineAdditionalElements() {
//         this.svg
//             .append('svg:defs')
//             .append('svg:marker')
//             .attr('id', 'arrow')
//             .attr('refX', 11.5)
//             .attr('refY', 2.5)
//             .attr('markerWidth', 20)
//             .attr('markerHeight', 20)
//             .attr('orient', 'auto')
//             .append('svg:path')
//             .attr('d', 'M0,0 L5,2.5 L0,5 Z')
//             .attr('class', 'arrow');
//     }
// }
