import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material";
import { ShowUsageStrategy } from "./show-usage-strategy.interface";
import { SimpleDiagramUsageStrategy } from './simple-diagram-usage-strategy';
@Injectable({
  providedIn: 'root'
})
export class DiagramUsageService {


  private strategy: ShowUsageStrategy;

  constructor(private snackBar: MatSnackBar) {
    this.strategy = new SimpleDiagramUsageStrategy();
  }

  /**
   * show
   */
  public show() {
    if (this.strategy.isNotified()) {
      this.snackBar.open('Double click to open component details 👋', '', {
        duration: 3 * 1000
      });
    }
  }
}
