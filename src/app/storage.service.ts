import { Injectable } from '@angular/core';
import { GraphData } from "graph-builder";

import data from "./data.json";
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  //data input is resolved on compile time
  private _data: GraphData

  constructor() {
    this._data = data;
  }

  /**
   * getComponentData
   */
  public getComponentData() {
    return this._data;
  }
}
