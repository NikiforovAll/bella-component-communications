import * as d3 from "d3";
import { DiagramComponent } from "./Models/diagram-component";
import { Service } from "./Models/service";
import { SVGConfig } from "./Models/svg-config";
import { ItemRegistry } from "./item-registry";
import { GraphData } from "./Models/graph-data";
import { getTransformation, polygon } from "./utils";
class GraphBuilder {

    private root: HTMLDivElement;
    private svgConfig: SVGConfig
    svg: d3.Selection<SVGSVGElement, {}, null, undefined>;

    private domItemRegistry: ItemRegistry;

    constructor(root: HTMLDivElement) {
        this.root = root;
        this.svgConfig = {
            width: 1200,
            height: 1200,
            margin: 50,
            componentConfig: {
                width: 100,
                height: 200,
                textLineHeight: 30
            },
            textPadding: 5
        };
        this.domItemRegistry = {
            components: {},
            services: {}
        };
    }

    get componentLineHeight(): number {
        return this.svgConfig.componentConfig.textLineHeight;
    }

    /**
     * build
     */
    public build(data: GraphData) {
        this.svg = d3.select(this.root)
            .append('svg')
            .attr('width', this.svgConfig.width + this.svgConfig.margin)
            .attr('height', this.svgConfig.height + this.svgConfig.margin);

        this.initializeDOM(data);
        data.nodes.forEach(node => this.drawNode(node));
        this.connectComponents(data.nodes);

        // this.applyZoom();

        console.log("data", data);
        console.log("registry", this.domItemRegistry);

    }


    private initializeDOM(data: GraphData): void {
        let center = { x: this.svgConfig.width / 2, y: this.svgConfig.height / 2 };
        let radius = this.svgConfig.height / 2 - this.svgConfig.margin;
        let sidesCount: number = data.nodes.length;
        let coordinates = polygon(center.x, center.y, radius, sidesCount);
        data.nodes.forEach((node, i) => {
            if(!node.dom)
            {
                node.dom = {};
            }
            node.dom.x = coordinates[i][0];
            node.dom.y = coordinates[i][1];
        });
    }

    private drawNode(component: DiagramComponent): void {
        let textLineHeight = this.componentLineHeight;
        let container = this.svg
            .append("g")
            .attr('transform', this.buildTransformTemplate(component.dom.x, component.dom.y));
        this.domItemRegistry.components[component.name] = {
            component,
            container: container
        };
        container
            .append("rect")
            .attr("height", this.svgConfig.componentConfig.height)
            .attr("width", this.svgConfig.componentConfig.width)
            .attr("id", component.name)
            .attr("class", "component-container");
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
        this.svg
            .append("line")
            .attr("x1", from.dom.x + this.svgConfig.componentConfig.width / 2)
            .attr("y1", from.dom.y)
            .attr("x2", componentPositions.translateX + serviceItemPositions.translateX + this.svgConfig.componentConfig.width)
            .attr("y2", componentPositions.translateY + serviceItemPositions.translateY + this.componentLineHeight*1.75)
            .attr("class", "service-link");
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
            .on('zoom', zoomed)
        this.svg.call(zoom);
        let ctx = this.svg;
        function zoomed() {
            ctx.attr('transform', d3.event.transform);
        }
    }
}

export { GraphBuilder, GraphData }