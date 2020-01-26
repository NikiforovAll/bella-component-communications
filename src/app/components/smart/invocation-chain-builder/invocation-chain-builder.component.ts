import { Component, OnInit } from '@angular/core';
import { StorageService, NamespacedDeclarations, KeyedDeclaration, DeclarationType, LocatedBellaReference, NamespacedReferences } from 'src/app/services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InvocationContainer, InvocationContainerState } from 'src/app/models/invocation-builder-models/invocation-container.model';
import { namespace } from 'd3';
@Component({
  selector: 'app-invocation-chain-builder',
  templateUrl: './invocation-chain-builder.component.html',
  styleUrls: ['./invocation-chain-builder.component.scss']
})
export class InvocationChainBuilderComponent implements OnInit {

  components: string[];
  groupedServices: NamespacedDeclarations[];
  selectedComponent: string;
  selectedService: string;
  selectedProcedure: string;
  groupedProcedures: NamespacedDeclarations[];
  groupedReferences: NamespacedReferences[];
  rootInvocationContainers: InvocationContainer[];

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router) {
    this.init();
    this.route.queryParams.subscribe(params => {
      const { component, service, procedure } = params;
      this.selectedComponent = component;
      this.selectedService = service;
      this.selectedProcedure = procedure;
      this.buildContainer();
    });
  }

  ngOnInit() {
  }

  private init() {
    this.groupedServices = this.storage.getServiceReferences();
    this.components = this.groupedServices.map((group) => group.namespace);
    this.groupedProcedures = this.storage.getProcedureReferences();
    // leave only references to services and procedures
    this.groupedReferences = this.storage.getInvocationReferences()
      .map(gr => {
        return {
          namespace: gr.namespace,
          references: gr.references
            .filter(r => r.referenceTo === DeclarationType.Service || r.referenceTo === DeclarationType.Procedure)
        };
      });
  }

  getServicesForComponent(cmp: string) {
    return InvocationUtils.getServicesForComponent(this.groupedServices, cmp);
  }

  getServiceEntries(cmp: string, serviceName: string) {
    return InvocationUtils.getServiceEntries(this.groupedServices, cmp, serviceName);
  }

  buildContainer() {
    const maxDepth = 25;

    // TODO: MAJOR - handle recursion and overloads correctly, or at least notify about that
    const rootName = InvocationUtils.getProcedureTruncatedName(this.selectedProcedure);
    const container = InvocationUtils.buildInvocationContainer(
      this.groupedReferences,
      this.groupedProcedures,
      this.selectedComponent,
      rootName,
      maxDepth);
    this.rootInvocationContainers = container;
  }

  public changeQuery() {
    this.router.navigate(['.'], {
      relativeTo: this.route, queryParams: {
        component: this.selectedComponent,
        service: this.selectedService,
        procedure: this.selectedProcedure
      }
    });
  }

}

// tslint:disable-next-line: no-namespace
export namespace InvocationUtils {

  export function buildInvocationContainer(
    referenceContext: NamespacedReferences[],
    declarationContext: NamespacedDeclarations[],
    componentName: string,
    entityToFind: string,
    currentDepth: number): InvocationContainer[] {
    const bases = getProcedure(declarationContext, componentName, entityToFind);
    if (!bases || --currentDepth < 0) {
      return undefined;
    }
    const result = [];
    const isOverloaded = bases.length > 1;
    for (const base of bases) {
      result.push(
        buildContainerInner(declarationContext, componentName, base,
          entityToFind, referenceContext, currentDepth, isOverloaded));
    }
    return result;
  }

  function buildContainerInner(
    declarationContext: NamespacedDeclarations[],
    componentName: string,
    base: KeyedDeclaration,
    entityToFind: string,
    referenceContext: NamespacedReferences[],
    currentDepth: number,
    isOverloaded: boolean) {
    const filterReferencesForProcedure = (ref: LocatedBellaReference) => {
      let match = !ref.isDeclaration;
      const procedures = InvocationUtils.getProcedure(declarationContext, componentName, ref.nameTo);
      match = match && !!procedures;
      match = match && ref.uri === base.uri;
      return match;
    };
    const refs = getReferencesForProcedure(entityToFind, componentName, referenceContext)
      .filter(filterReferencesForProcedure);
    const nestedContainer = refs
      .map(r => {
        // TODO: prepare for recursion
        const isRecursionEncountered = InvocationUtils.getProcedureTruncatedName(base.name) === r.nameTo;
        if (isRecursionEncountered) {
          const innerResult = new InvocationContainer(base, [], componentName);
          innerResult.setInvocationContainerState(InvocationContainerState.RecursionEncounter);
          innerResult.setOverload(isOverloaded);
          return [innerResult];
        }
        const innerContainer = buildInvocationContainer(
          referenceContext, declarationContext, componentName, r.nameTo, currentDepth);
        return innerContainer;
      })
      .reduce((acc, val) => acc.concat(val), [])
      .filter(container => !!container);
    const service = InvocationUtils.getServiceForProcedure(declarationContext, componentName, base.name);
    const result = new InvocationContainer(
      base, nestedContainer, componentName,
      service ? service.name : undefined);
    result.setOverload(isOverloaded);
    return result;
  }

  export function getReferencesForProcedure(
    procedureName: string,
    componentName: string,
    refs: NamespacedReferences[]): LocatedBellaReference[] {
    // ???
    const initialReferences = refs.find(namespaced => namespaced.namespace === componentName).references;
    const filteredReferences = initialReferences
      .filter(r => r.container && r.container.nameTo === procedureName);
    return filteredReferences;
  }

  export function getProcedure(context: NamespacedDeclarations[], componentName: string, procedureName: string) {
    if (!componentName || !componentName) {
      return;
    }
    return context
      .find(namespaced => namespaced.namespace === componentName)
      .procedures
      .filter(procedure => getProcedureTruncatedName(procedure.name) === procedureName &&
        procedure.type === DeclarationType.Procedure);
  }

  export function getProcedureTruncatedName(fullName: string): string {
    const takeNumChars = fullName
      .indexOf('(') === -1 ? fullName.length : fullName.indexOf('(');
    const truncatedName = fullName.substr(0, takeNumChars);
    return truncatedName;
  }

  export function getServicesForComponent(groupedServices: NamespacedDeclarations[], cmp: string) {
    if (!cmp) {
      return;
    }
    return groupedServices.find((namespacedServices) => namespacedServices.namespace === cmp)
      .procedures.filter((service) => service.type === DeclarationType.Service);
  }

  export function getServiceEntries(groupedServices: NamespacedDeclarations[], cmp: string, serviceName: string) {
    if (!cmp || !serviceName) {
      // this.selectedService = null;
      return;
    }
    const foundService = getServicesForComponent(groupedServices, cmp).find(s => s.name === serviceName);
    return foundService ? foundService.members : [];
  }

  export function getServiceForProcedure(groupedServices: NamespacedDeclarations[], cmp: string, procedureName: string) {
    return InvocationUtils.getServicesForComponent(groupedServices, cmp)
      .map(s => s.members)
      .reduce((acc, val) => acc.concat(val), [])
      .find(p => p.name && p.name === InvocationUtils.getProcedureTruncatedName(procedureName));
  }
}
