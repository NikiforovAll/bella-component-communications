import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ComponentDataComponent } from './components/smart/component-data/component-data.component';
import { ComponentDiagramComponent } from './components/smart/component-diagram/component-diagram.component';
import {
    InvocationChainBuilderComponent,
} from './components/smart/invocation-chain-builder/invocation-chain-builder.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'diagram',
        pathMatch: 'full',
    },
    {
        path: 'diagram',
        component: ComponentDiagramComponent,
    },
    {
        path: 'data',
        component: ComponentDataComponent,
    },
    {
        path: 'present-invocation-chains',
        component: InvocationChainBuilderComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
