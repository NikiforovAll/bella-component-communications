import * as d3 from "d3";
import { SVGConfig } from './Models/svg-config';
import { ItemRegistry } from './item-registry';
import { GraphData } from "./Models/graph-data";
import { getTransformation, polygon } from "./utils";
import { DiagramComponent } from './Models/diagram-component';
import { Service } from './Models/Service';

import dagre from 'dagre';

class ComponentBuilder {

    public domItemRegistry: ItemRegistry;
    private _innerContainer: any;

    constructor(private svgConfig: SVGConfig, private svg: any) {
        this.domItemRegistry = new ItemRegistry();
        this.svg = d3.select(svg);
        //TODO: this code has issue with data and representation separation.
    }

    get componentLineHeight(): number {
        return this.svgConfig.componentConfig.textLineHeight;
    }

    get rootContainer(): any {
        return this._innerContainer;
    }

    public build(data: GraphData) {

        this.buildFromLayout(data, ComponentDiagramGraphLayout.Circle);

    }

    public buildFromLayout(data: GraphData, layout: ComponentDiagramGraphLayout) {
        this._innerContainer = this.svg.append("g");
        this.defineAdditionalElements();
        this.initializeDOM(data, layout);
        data.nodes.forEach(node => this.drawNode(node));
        this.connectComponents(data.nodes);

        this.applyZoom();
        // console.log("data", data);
        // console.log("registry", this.domItemRegistry);

    }

    public generateLayout(data: GraphData) {
        var g = new dagre.graphlib.Graph();
        g.setGraph({});
        // Default to assigning a new object as a label for each new edge.
        g.setDefaultEdgeLabel(function () { return {}; });

        data.nodes.forEach(
            component => g.setNode(
                component.name,
                {
                    label: component.name,
                    width: this.svgConfig.componentConfig.width,
                    height: this.svgConfig.componentConfig.height
                }
            )
        );

        //TODO: set edges, change 
        data.nodes.forEach(component => {
            //DOESN'T WORK, registry is not filled on init
            // for (let service of component.consumes) {
            //     console.log("domItemRegistry ", this.domItemRegistry);
            //     if (this.domItemRegistry.services.hasOwnProperty(service.name)) {
            //         console.log("edge " + component.name + " to " + this.domItemRegistry.services[service.name].componentName);
            //         g.setEdge(component.name, this.domItemRegistry.services[service.name].componentName);
            //     }
            // }
            for (let service of component.consumes) {
                if (data.nodes.some(component2 => component2.services.some(service2 => service2.name == service.name))) {
                    let result = data.nodes.filter(component2 => component2.services.some(service2 => service2.name == service.name));
                    console.log(`Edge: from ${component.name} to -> ${result[0].name}`);
                    g.setEdge(
                        component.name,
                        result[0].name
                    );
                }
            }


        });

        dagre.layout(g);
        // g.nodes().forEach(function (v) {
        //     console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
        // });
        // g.edges().forEach(function (e) {
        //     console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
        // });

        return g.nodes().map(v => [g.node(v).x, g.node(v).y]);
    }

    public clear() {
        this.svg.selectAll("*").remove();
    }

    private initializeDOM(data: GraphData, layout: ComponentDiagramGraphLayout): void {
        let center = { x: this.svgConfig.width / 2, y: this.svgConfig.height / 2 };
        let radius = this.svgConfig.height - this.svgConfig.margin;
        let sidesCount: number = data.nodes.length;
        let coordinates;
        if (layout == ComponentDiagramGraphLayout.Circle) {
            coordinates = polygon(center.x, center.y, radius, sidesCount);
        } else {
            coordinates = this.generateLayout(data);
        }
        data.nodes.forEach((node, i) => {
            if (!node.dom) {
                node.dom = {};
            }
            node.dom.x = coordinates[i][0];
            node.dom.y = coordinates[i][1];
        });
    }

    private drawNode(component: DiagramComponent): void {
        let textLineHeight = this.componentLineHeight;
        let container = this.rootContainer
            .append("g")
            .attr('transform', this.buildTransformTemplate(component.dom.x, component.dom.y));
        this.domItemRegistry.components[component.name] = {
            component,
            container: container
        };
        // container
        //     .append("rect")
        //     .attr("height", this.svgConfig.componentConfig.height)
        //     .attr("width", this.svgConfig.componentConfig.width)
        //     .attr("id", component.name)
        //     .attr("class", "component-container");
        container
            .append("text")
            .text(component.name)
            .attr("y", textLineHeight - this.svgConfig.textPadding)
            .attr("x", this.svgConfig.textPadding)

        container
            .append("line")
            .attr("x1", 0)
            .attr("y1", textLineHeight)
            .attr("x2", this.svgConfig.componentConfig.width)
            .attr("y2", textLineHeight)
            .attr("class", "component-header-line");
        let serviceContainer = container.append("g")
            .attr('transform', this.buildTransformTemplate(0, textLineHeight));

        container
            .append("g")
            .append("circle")
            .attr("cx", this.svgConfig.componentConfig.width / 2)
            .attr("cy", 0)
            .attr("r", this.componentLineHeight / 4)
            .attr("class", "component-connector")
        component.services.forEach((service, i) => this.drawService(service, component.name, serviceContainer, i));

    }

    private connectComponents(components: DiagramComponent[]) {
        for (let component of components) {
            if (!component.consumes) {
                continue;
            }
            for (let service of component.consumes) {
                if (this.domItemRegistry.services.hasOwnProperty(service.name)) {
                    this.drawLink(component, this.domItemRegistry.services[service.name]);
                }
            }
        }
    }


    private drawLink(from: DiagramComponent, to: any) {
        let serviceItemPositions = getTransformation(to.container.attr("transform"));
        let componentPositions = getTransformation(this.domItemRegistry.components[to.componentName].container.attr("transform"));

        //TBD: use items from registry, it is bad way to create link
        this.rootContainer
            .append("line")
            .attr("x1", from.dom.x + this.svgConfig.componentConfig.width / 2)
            .attr("y1", from.dom.y)
            .attr("x2", componentPositions.translateX + serviceItemPositions.translateX + this.svgConfig.componentConfig.width)
            .attr("y2", componentPositions.translateY + serviceItemPositions.translateY + this.componentLineHeight * 1.75)
            .attr("class", "service-link")
            .style("marker-end", "url(#arrow)");

    }

    private drawService(service: Service, componentName: string, container: any, i: number) {

        let serviceItemContainer = container
            .append("g")
            .attr("id", service.name)
            .attr('transform', this.buildTransformTemplate(0, this.componentLineHeight * i))

        this.domItemRegistry.services[service.name] = {
            componentName,
            service,
            container: serviceItemContainer
        };
        let itemContainer = serviceItemContainer
            .append("g")
            .attr("transform", this.buildTransformTemplate(0, this.componentLineHeight / 2));
        itemContainer
            .append("rect")
            .attr("height", this.componentLineHeight / 2)
            .attr("width", this.svgConfig.componentConfig.width)
            .attr("class", "service-container");
        serviceItemContainer
            .append("text")
            .text(service.name)
            .attr("y", this.componentLineHeight - this.svgConfig.textPadding)
            .attr("x", this.svgConfig.textPadding)
        let circle = itemContainer
            .append("circle")
            .attr("cx", this.svgConfig.componentConfig.width)
            .attr("cy", this.componentLineHeight / 4)
            .attr("r", this.componentLineHeight / 4)
            .attr("class", "service-connector")
    }

    private buildTransformTemplate(x: any, y: any): string {
        return `translate(${x}, ${y})`;
    }

    private applyZoom() {
        var zoom = d3.zoom()
            .on('zoom', zoomed);

        let ctx = this._innerContainer;
        function zoomed() {
            ctx.attr('transform', d3.event.transform);
        }
        let scale = 0.5;
        let zoomWidth = (this.svgConfig.width - scale * this.svgConfig.width) / 2
        let zoomHeight = (this.svgConfig.height - scale * this.svgConfig.height) / 2
        // this.svg.call(zoom)
        this.svg
            .call(zoom.transform, d3.zoomIdentity.translate(zoomWidth, zoomHeight / 2).scale(scale));
        this.svg
            .call(zoom);
    }

    private applyDraggable() {
        //TODO:
    }

    private defineAdditionalElements() {
        this.svg.append('svg:defs').append('svg:marker')
        .attr('id', 'arrow')
        .attr('refX', 11.5)
        .attr('refY', 2.5)
        .attr('markerWidth', 20)
        .attr('markerHeight', 20)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L5,2.5 L0,5 Z')
        .attr("class", "arrow");
    }
}

enum ComponentDiagramGraphLayout {
    Circle,
    LargeScaleNetwork
}

export { ComponentBuilder, SVGConfig, GraphData, ComponentDiagramGraphLayout }