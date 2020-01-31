import { Injectable } from '@angular/core';
// import data from '../../data.json';
import { GraphData } from '../../models/storage-models/graph-data';
import { MethodCall } from '../../models/storage-models/method-call';
// import { BaseDeclaration, MemberComposite, BellaReference } from 'bella-grammar';
@Injectable({
    providedIn: 'root',
})
export class StorageService {

    private hostedServices: KeyedDeclaration[];
    private serviceReferences: NamespacedDeclarations[];
    private procedureReference: NamespacedDeclarations[];
    private invocationReferences: NamespacedReferences[];

    data: GraphData;
    methodCalls: MethodCall[];

    public set graphData(v: GraphData) {
        this.data = v;
    }

    public set methodCallData(d: MethodCall[]) {
        this.methodCalls = d;
    }

    public setHostedServices(payload: KeyedDeclaration[]) {
        this.hostedServices = payload;
    }

    public getHostedServices() {
        return this.hostedServices;
    }

    public setServiceReferences(payload: NamespacedDeclarations[]) {
        this.serviceReferences = payload;
    }

    public getServiceReferences() {
        return this.serviceReferences;
    }

    public setProcedureReferences(payload: NamespacedDeclarations[]) {
        this.procedureReference = payload;
    }
    public getProcedureReferences() {
        return this.procedureReference;
    }

    public setInvocationReferences(payload: any) {
        this.invocationReferences = payload;
    }

    public getInvocationReferences() {
        return this.invocationReferences;
    }

    constructor() {}

    public getComponentData() {
        return this.data;
    }

    public getMethodCallData() {
        return this.methodCalls;
    }

}

export interface NamespacedDeclarations {
    namespace: string;
    declarations: KeyedDeclaration[];
}

export interface NamespacedReferences {
    namespace: string;
    references: LocatedBellaReference[];
}


export interface KeyedDeclaration extends BaseDeclaration, MemberComposite {
    uri: string;
    parentName?: string;
}

export interface LocatedResource {
    uri: string;
}

export interface LocatedBellaReference extends BellaReference, LocatedResource {}


export interface BaseDeclaration {
    range: Range;
    name: string;
    type: DeclarationType;
}

export interface Range {
    startPosition: Position;
    endPosition: Position;
}

export interface Position {
    row: number;
    col: number;
}

export interface MemberComposite {
    members?: BaseDeclaration [];
}

// WARNING: this approach is dirty and may lead to huge errors,
// please make sure this enum is in sync with bella-grammar core module
// (TODO: import this module as dependency)

export enum DeclarationType {
    ComponentService,
    Service,
    ServiceEntry,
    Procedure,
    // ProcedureInvocation,
    Param,
    Object,
    CompositeObject,
    PersistentObject,
    Setting,
    ObjectField,
    Type,
    Formula,
    Enum,
    EnumEntry
}

export interface ReferenceIdentifier {
    nameTo: string;
    referenceTo: DeclarationType;
}
export interface BellaReference extends ReferenceIdentifier {
    context?: string;
    range: Range;
    isDeclaration: boolean;
    referenceType?: BellaReferenceType;
    container?: ReferenceIdentifier;
}

export enum BellaReferenceType {
    AmbiguousReference,
    NestedReference
}
