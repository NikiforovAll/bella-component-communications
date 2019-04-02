import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ComponentDiagramComponent } from "./component-diagram/component-diagram.component";
import { ComponentDataComponent } from "./component-data/component-data.component";
const routes: Routes = [
  { 
    path: '',
    redirectTo: 'diagram',
    pathMatch: 'full'
  },
  {
    path: 'diagram',
    component: ComponentDiagramComponent
  },
  {
    path: 'data',
    component: ComponentDataComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
