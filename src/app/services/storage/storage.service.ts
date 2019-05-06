import { Injectable } from '@angular/core';
// import data from '../../data.json';
import { GraphData } from '../../models/storage-models/graph-data';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    public set graphData(v: GraphData) {
        this.data = v;
    }

    data: GraphData;

    constructor() {}

    public getComponentData() {
        return this.data;
    }
}
