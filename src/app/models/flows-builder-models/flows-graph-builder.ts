import * as cytoscape from 'cytoscape';
import { ElementRef } from '@angular/core';
import { DeclarationType } from 'src/app/services/storage/storage.service';


export class FlowGraphBuilder {
  cy: cytoscape.Core;
  nodeRegistry: { [key: string]: boolean } = {};

  constructor(private graphContainer: ElementRef) {
  }

  public build() {
    const cytoscapeInit = cytoscape as any;
    const canvasConfig = {
      container: this.graphContainer.nativeElement,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            // 'background-color': '#666',
            label: 'data(id)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle'
          }
        },
        {
          selector: '.internal-procedure-call',
          style: {
            'background-color': 'slateblue'
          }
        },
        {
          selector: '.external-service-call',
          style: {
            'background-color': 'teal'
          }
        },
        {
          selector: '.root',
          style: {
            'background-color': 'green',
            'border-color': 'red',
            'border-width': 2,
            'border-type': 'solid',
          }
        },
      ],
    };
    // this.cy = cytoscape(canvasConfig);
    this.cy = cytoscapeInit(canvasConfig);
    // this.cy.layout({
    //   name: 'random',
    //   fit: true
    // });
  }
  public add(node: GraphFlowNode, parent?: GraphFlowNode) {
    if (this.nodeRegistry[node.name]) {
      return;
    }
    try {
      this.cy.add(this.toCytoscapeElemet(node));
      this.nodeRegistry[node.name] = true;
    } catch (error) {
      console.log('builder.add', error);
    }
    for (const n of node.nodes) {
      if (this.nodeRegistry[n.name]) {
      } else {
        try {
          this.add(n, node);
        } catch (error) {
          console.log('builder.add', error);
        }
      }
      this.cy.add(this.toCytoscapeEdge(node, n));
    }
    let layout = this.cy.elements().layout({
      name: 'breadthfirst',
      directed: true,
      spacingFactor: 3,
      // nodeDimensionsIncludeLabels: true
    });
    layout.run();
    this.cy.center(this.cy.nodes('.root'));
    // this.cy.fit(this.cy.nodes('.root'), 600);
  }

  public flush() {
    // this.cy.remove('node');
    // this.cy.remove('edge');
    this.cy.remove('*');
    this.cy.destroy();
  }

  private toCytoscapeEdge(n1: GraphFlowNode, n2: GraphFlowNode): cytoscape.ElementDefinition {
    return {
      group: 'edges',
      data: {
        source: n1.name, target: n2.name,
        id: `${n1.name}-${n2.name}`
      }
    };
  }

  private toCytoscapeElemet(node: GraphFlowNode): cytoscape.ElementDefinition {
    return {
      group: 'nodes',
      classes: this.getDisplayClass(node),
      data: {
        id: node.name,
        label: node.label
      }
    };
  }

  private getDisplayClass(node: GraphFlowNode) {
    if (node.isRoot) {
      return 'root';
    }
    switch (node.type) {
      case DeclarationType.Procedure:
        return 'internal-procedure-call';
      case DeclarationType.Service:
        return 'external-service-call';
      default:
        return undefined;
    }
  }
}


export class GraphFlowNode {
  name: string;
  label: string;
  base: string;
  procedureName: string;
  nodes: GraphFlowNode[];
  type: DeclarationType;
  isRoot?: boolean;
}
