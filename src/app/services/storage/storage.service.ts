import { Injectable } from '@angular/core';
// import data from '../../data.json';
import { GraphData } from '../../models/storage-models/graph-data';
import { MethodCall } from '../../models/storage-models/method-call';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    public set graphData(v: GraphData) {
        this.data = v;
    }

    public set methodCallData(d: MethodCall[]) {
        this.methodCalls = d;
    }

    data: GraphData;

    methodCalls: MethodCall[];

    constructor() {}

    public getComponentData() {
        return this.data;
    }

    public getMethodCallData() {
        return this.methodCalls;
    }

}
