import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { StorageService, NamespacedReferences, DeclarationType, LocatedBellaReference, NamespacedDeclarations, BellaReference } from 'src/app/services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FlowGraphBuilder, GraphFlowNode } from 'src/app/models/flows-builder-models/flows-graph-builder';
import { InvocationUtils } from '../invocation-chain-builder/invocation-chain-builder.component';


@Component({
  selector: 'app-flows-builder',
  templateUrl: './flows-builder.component.html',
  styleUrls: ['./flows-builder.component.scss']
})


export class FlowsBuilderComponent implements OnInit {

  selectedComponent: string;
  selectedService: string;
  selectedProcedure: string;

  components: string[];
  groupedReferences: NamespacedReferences[];
  graph: GraphFlowNode[];

  @ViewChild('cy') graphContainer: ElementRef;
  builder: FlowGraphBuilder;
  groupedServices: NamespacedDeclarations[];
  globalProcedures: NamespacedDeclarations[];


  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef) {
    this.init();
  }

  init() {
  }

  ngOnInit() {
    this.groupedServices = this.storage.getServiceReferences();
    this.components = this.storage.getServiceReferences().map((group) => group.namespace);
    this.globalProcedures = this.storage.getProcedureReferences();

    this.route.queryParams.subscribe(params => {
      const { component, service, procedure } = params;
      this.selectedComponent = component;
      this.selectedService = service;
      this.selectedProcedure = procedure;
      this.ref.markForCheck();
      this.groupedReferences = this.storage.getInvocationReferences()
        .map(gr => {
          return {
            namespace: gr.namespace,
            references: gr.references
              .filter(r => r.referenceTo === DeclarationType.Service || r.referenceTo === DeclarationType.Procedure)
          };
        });
      this.buildRoot();
    });
  }

  buildRoot() {
    if (this.builder) {
      this.builder.flush();
    }
    this.builder = new FlowGraphBuilder(this.graphContainer);
    this.builder.build();
    const rootNode = this.findRootNode();
    this.graph = [rootNode];
    this.builder.add(rootNode);
    let parentNodes = this.findUsedByNodes(rootNode);
    parentNodes.forEach(pn => this.builder.add(pn));
    let depthCounter = 0;
    while (parentNodes.length > 0) {
      parentNodes = parentNodes.map(pn => this.findUsedByNodes(pn)).reduce((acc, el) => acc.concat(el));
      // TODO: this should be done once (MAJOR)
      // this.builder.center();
      parentNodes.forEach(pn => this.builder.add(pn));
      if (++depthCounter > 2) {
        // throw new Error('buildRoot: Maximum invocation stack exceeded');
        console.warn('buildRoot: Maximum invocation stack exceeded');
        break;
      }
    }
  }



  private findUsedByNodes(node: GraphFlowNode): GraphFlowNode[] {

    const parentNodes = this.groupedReferences
      .map(gr => gr.references)
      .reduce((acc, el) => acc.concat(el))
      .filter(r => this.filterReference(r, node))
      .map(r => {
        const containerInfo = this.inferContainerName(r);
        return {
          label: containerInfo.name,
          name: containerInfo.name,
          nodes: [
            node
          ],
          type: containerInfo.type,
          base: containerInfo.base,
          procedureName: containerInfo.procedureName
        } as GraphFlowNode;
      });
    return parentNodes;
  }

  private filterReference(ref: LocatedBellaReference, node: GraphFlowNode): boolean {
    const normalizeReferenceToServiceName = (r: any): string => `${r.nameTo}.${r.childTo}`;
    const normalizedNodeName = node.name.toLowerCase();
    if (ref.isDeclaration || (!!ref.container && ref.container.nameTo === ref.nameTo)) {
      return false;
    }
    if (normalizeReferenceToServiceName(ref).toLowerCase() === normalizedNodeName) {
      return true;
    } else if (node.procedureName.toLowerCase() === ref.nameTo.toLowerCase()
      && ref.referenceTo === DeclarationType.Procedure && !!ref.container) {
      return true;
    }
    return false;
  }

  private inferContainerName(r: LocatedBellaReference): {
    name: string;
    base: string;
    procedureName: string;
    type: DeclarationType;
  } {
    if (!r.container) {
      throw new Error('findUsedByNodes: Could not resolve container name');
    }
    let type = DeclarationType.Procedure;
    const name = r.container && r.container.nameTo || r.nameTo;
    let componentName = '';
    const serviceEntry = this.groupedServices.find(gs => gs.declarations.some(d => d.name === name));
    const procedureDeclaration = this.globalProcedures
      .find(gs => gs.declarations.some(p => p.name.toLowerCase().startsWith(name.toLowerCase())));
    if (!!serviceEntry) {
      const entry = serviceEntry.declarations.find(d => d.name === name);
      componentName = entry.parentName || entry.name;
      type = DeclarationType.Service;
    } else if (!!procedureDeclaration) {
      componentName = procedureDeclaration.namespace;
    }
    const base = componentName;
    if (!!componentName) {
      componentName = componentName + '.';
    }
    return {
      name: `${componentName}${name}`, type, base, procedureName: name
    };
  }

  changeQuery() {
    this.router.navigate(['.'], {
      relativeTo: this.route, queryParams: {
        component: this.selectedComponent,
        service: this.selectedService,
        procedure: this.selectedProcedure
      }
    });
  }

  private findRootNode() {
    const rootNodeName = `${this.selectedService}.${this.selectedProcedure}`;
    const isValidReference = (r: LocatedBellaReference): boolean => (!!r.container
      && r.container.nameTo.toLowerCase() === this.selectedProcedure.toLowerCase())
      || (r.referenceTo === DeclarationType.Service && r.nameTo.toLowerCase() === this.selectedProcedure.toLowerCase());
    const refsNamespaced = this.groupedReferences
          .find(gr => gr.namespace === this.selectedComponent);
    const refs = refsNamespaced ? refsNamespaced.references || [] : [];
    const rootNode: GraphFlowNode = {
      label: rootNodeName,
      name: rootNodeName.toLowerCase(),
      base: this.selectedService,
      procedureName: this.selectedProcedure,
      type: DeclarationType.Service,
      isRoot: true,
      nodes: refs.filter(isValidReference)
          .map(r => {
            let node: GraphFlowNode;
            if (r.referenceTo === DeclarationType.Service) {
              const serviceNodeLabel = `{${r.nameTo}}.${r.container.nameTo}`;
              node = {
                label: serviceNodeLabel,
                name: serviceNodeLabel,
                base: r.container.nameTo,
                procedureName: r.nameTo,
                type: r.referenceTo,
                nodes: []
              };
            } else if (r.referenceTo === DeclarationType.Procedure) {
              const procedureNodeLabel = `${r.nameTo}`;
              node = {
                label: procedureNodeLabel,
                type: r.referenceTo,
                base: this.selectedComponent,
                procedureName: r.nameTo,
                name: procedureNodeLabel,
                nodes: []
              };
            }
            return node;
          })
    };
    return rootNode;
  }

  getServicesForComponent(cmp: string) {
    return InvocationUtils.getServicesForComponent(this.groupedServices, cmp);
  }

  getServiceEntries(cmp: string, serviceName: string) {
    return InvocationUtils.getServiceEntries(this.groupedServices, cmp, serviceName);
  }
}

