import { Injectable } from '@angular/core';
// import data from '../../data.json';
import { GraphData } from '../../models/storage-models/graph-data';
import { MethodCall } from '../../models/storage-models/method-call';
import { BaseDeclaration, MemberComposite, BellaReference } from 'bella-grammar';
@Injectable({
    providedIn: 'root',
})
export class StorageService {

    hostedServices: NamespacedDeclarations;
    data: GraphData;
    methodCalls: MethodCall[];

    public set graphData(v: GraphData) {
        this.data = v;
    }

    public set methodCallData(d: MethodCall[]) {
        this.methodCalls = d;
    }

    public setHostedServices(payload: NamespacedDeclarations) {
        this.hostedServices = payload;
    }

    public getHostedServices() {
        return this.hostedServices;
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
    procedures: KeyedDeclaration[];
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


// export interface BaseDeclaration {
//     range: Range;
//     name: string;
//     type: DeclarationType;
// }

// export interface Range {
//     startPosition: Position,
//     endPosition: Position
// }

// export interface Position {
//     row: number;
//     col: number
// }

// export interface MemberComposite {
//     members?: BaseDeclaration [];
// }

