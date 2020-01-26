import { Component, OnInit, NgZone, ChangeDetectorRef  } from '@angular/core';
import { StorageService, NamespacedDeclarations, KeyedDeclaration, DeclarationType, LocatedBellaReference, NamespacedReferences, BellaReferenceType } from 'src/app/services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InvocationContainer, InvocationContainerState, CommunicationPattern } from 'src/app/models/invocation-builder-models/invocation-container.model';
import { namespace } from 'd3';
import { MatSnackBar } from '@angular/material';
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
    private router: Router,
    private snackBar: MatSnackBar,
    ref: ChangeDetectorRef) {
    this.init();
    this.route.queryParams.subscribe(params => {
      const { component, service, procedure } = params;
      this.selectedComponent = component;
      this.selectedService = service;
      this.selectedProcedure = procedure;
      this.buildContainer();
      ref.markForCheck();
    });
    this.snackBar.open('Use (alt + arrow_keys) to navigate history of diagrams', '', {
      duration: 3 * 1000
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
    const maxDepth = 5;
    if (!this.selectedProcedure) {
      this.rootInvocationContainers = [];
      return;
    }
    // TODO: MAJOR - handle recursion and overloads correctly, or at least notify about that
    const rootName = InvocationUtils.getProcedureTruncatedName(this.selectedProcedure);
    const container = InvocationUtils.buildInvocationContainer(
      this.groupedReferences,
      this.groupedServices,
      this.groupedProcedures,
      this.selectedComponent,
      rootName,
      maxDepth);
    this.rootInvocationContainers = container;
    // this.ref.markForCheck();
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

  public navigateBack() {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
  }
}

// tslint:disable-next-line: no-namespace
export namespace InvocationUtils {

  export function buildInvocationContainer(
    referenceContext: NamespacedReferences[],
    groupedServices: NamespacedDeclarations[],
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
        buildContainerInner(groupedServices, declarationContext, componentName, base,
          entityToFind, referenceContext, currentDepth, isOverloaded));
    }
    return result;
  }

  function buildContainerInner(
    groupedServices: NamespacedDeclarations[],
    groupedProcedures: NamespacedDeclarations[],
    componentName: string,
    base: KeyedDeclaration,
    entityToFind: string,
    referenceContext: NamespacedReferences[],
    currentDepth: number,
    isOverloaded: boolean) {
    const filterReferencesForProcedure = (ref: LocatedBellaReference) => {
      let match = !ref.isDeclaration;
      let match2 = match;
      const procedures = InvocationUtils.getProcedure(groupedProcedures, componentName, ref.nameTo);
      match = match && !!procedures && procedures.length > 0;
      match = match && ref.uri === base.uri;
      match2 = match2 && ref.referenceType === BellaReferenceType.NestedReference;
      const component2 = InvocationUtils
        .getComponentForService(groupedServices, ref.nameTo);
      const ref2 = ref as any;
      if (component2) {
        const procedures2 = InvocationUtils
          .getProcedure(groupedProcedures, component2.namespace, ref2.childTo);
        match2 = match2 && !!procedures2;
      } else {
        match2 = match2 && false;
      }
      return match || match2;
    };
    const refs = getReferencesForProcedure(entityToFind, componentName, referenceContext)
      .filter(filterReferencesForProcedure);
    const nestedContainer = refs
      .map(r => {
        if (r.referenceType && r.referenceType === BellaReferenceType.NestedReference) {
          const component2 = InvocationUtils
            .getComponentForService(groupedServices, r.nameTo);
          const ref2 = r as any;
          const isRecursionEncountered = InvocationUtils.getProcedureTruncatedName(base.name) === ref2.childTo &&
            componentName === InvocationUtils.getComponentForService(groupedServices, ref2.nameTo).namespace;
          if (isRecursionEncountered) {
            const innerResult = new InvocationContainer(base, [], component2.namespace);
            innerResult.setInvocationContainerState(InvocationContainerState.RecursionEncounter);
            innerResult.setCommunication(r.nameTo);
            return [innerResult];
          } else {
            const innerContainers = buildInvocationContainer(
              referenceContext, groupedServices, groupedProcedures,
              component2.namespace, ref2.childTo, currentDepth);
            if (innerContainers) {
              innerContainers.forEach(innerContainer => innerContainer.setCommunication(
                r.nameTo
              ));
            }
            return innerContainers;
          }
        } else {
          // TODO: prepare for recursion
          const isRecursionEncountered = InvocationUtils.getProcedureTruncatedName(base.name) === r.nameTo;
          if (isRecursionEncountered) {
            const innerResult = new InvocationContainer(base, [], componentName);
            innerResult.setInvocationContainerState(InvocationContainerState.RecursionEncounter);
            innerResult.setOverload(isOverloaded);
            return [innerResult];
          }
          const innerContainers = buildInvocationContainer(
            referenceContext, groupedServices, groupedProcedures, componentName, r.nameTo, currentDepth);
          return innerContainers;
        }
      })
      .reduce((acc, val) => acc.concat(val), [])
      .filter(container => !!container);
    const result = new InvocationContainer(base, nestedContainer, componentName);
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

  export function getServiceEntryForProcedure(groupedServices: NamespacedDeclarations[], cmp: string, procedureName: string) {
    return InvocationUtils.getServicesForComponent(groupedServices, cmp)
      .map(s => s.members)
      .reduce((acc, val) => acc.concat(val), [])
      .find(p => p.name && p.name === InvocationUtils.getProcedureTruncatedName(procedureName));
  }

  export function  getServiceForProcedure(groupedServices: NamespacedDeclarations[], cmp: string, procedureName: string) {
    return InvocationUtils.getServicesForComponent(groupedServices, cmp)
      .find(service => service.members
        && service.members.some(serviceEntry => serviceEntry.name === InvocationUtils.getProcedureTruncatedName(procedureName)));
  }

  export function getComponentForService(groupedServices: NamespacedDeclarations[], service: string) {
    return groupedServices.find(namespaced => namespaced.procedures.some(s => s.name === service));
  }
}
