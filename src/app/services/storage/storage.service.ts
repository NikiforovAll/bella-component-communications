import { Injectable } from '@angular/core';
import data from '../../data.json';
import { GraphData } from '../../models/storage-models/graph-data';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    private data: GraphData;

    constructor() {
        this.data = data;
    }

    public getComponentData() {
        return this.data;
    }
}
