import { GraphData } from '../models/storage-models/graph-data';
import dagre from 'dagre';
import { IDiagramComponent } from '../interfaces/IDiagramComponent';
import { IDiagramService } from '../interfaces/IDiagramService';
import { DiagramService } from '../models/diagram-service';
import { ElementCoordinate } from '../models/element-coordinate';

export function getTransformation(transform: string) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function
    // returns.
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, 'transform', transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix.
    const matrix = g.transform.baseVal.consolidate().matrix;

    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    // tslint:disable-next-line:prefer-const
    let { a, b, c, d, e, f } = matrix; // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    let scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);
    let skewX = a * c + b * d;

    if (scaleX) {
        a /= scaleX;
        b /= scaleX;
    }

    if (scaleY) {
        c -= a * skewX;
        d -= b * skewX;
    }

    if (skewX) {
        c /= scaleY;
        d /= scaleY;
        skewX /= scaleY;
    }

    if (a * d < b * c) {
        a = -a;
        b = -b;
        skewX = -skewX;
        scaleX = -scaleX;
    }

    return {
        translateX: e,
        translateY: f,
        rotate: (Math.atan2(b, a) * 180) / Math.PI,
        skewX: (Math.atan(skewX) * 180) / Math.PI,
        scaleX,
        scaleY,
    };
}
/* GIVEN x and y (the center coordinates), the radius and the number of polygon sides RETURNS AN ARRAY OF VERTICE COORDINATES */
export function polygon(x: number, y: number, radius: number, sides: number) {
    const crd = [];

    /* 1 SIDE CASE */
    if (sides === 1) {
        return [[radius, y]];
    }

    /* > 1 SIDE CASEs */
    for (let i = 0; i < sides; i++) {
        crd.push([x + Math.sin((2 * Math.PI * i) / sides) * radius, y - Math.cos((2 * Math.PI * i) / sides) * radius]);
    }
    return crd;
}

export function generateLargeScaleGraph(data: GraphData, svgConfig: any): any {
    const g = new dagre.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(() => ({}));

    data.nodes.forEach(component =>
        g.setNode(component.name, {
            label: component.name,
            width: svgConfig.componentConfig.width * 1.5,
            height: svgConfig.componentConfig.height * 1.5,
        }),
    );
    data.nodes.forEach(component => {
        for (const service of component.consumes) {
            if (data.nodes.some(component2 => component2.services.some(service2 => service2.name === service.name))) {
                const result = data.nodes.filter(component2 => component2.services.some(service2 => service2.name === service.name));
                g.setEdge(component.name, result[0].name);
            }
        }
    });
    dagre.layout(g);
    return g.nodes().map(v => [g.node(v).x, g.node(v).y]);
}

export function buildTransformTemplate(x: any, y: any): string {
    return `translate(${x}, ${y})`;
}

export function calculateAbsoluteServiceConnector(component: IDiagramComponent, service: DiagramService): ElementCoordinate {
    const { x: x1, y: y1 } = component.coordinates;
    return { x: x1 + service.getConnector().x, y: y1 + service.getConnector().y + service.frameHeight };
}
