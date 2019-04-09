import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import {
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatGridListModule,
    MatTabsModule,
    MatCheckboxModule,
    MatLabel,
    MatSelectModule,
    MatSnackBarModule,
} from '@angular/material';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentDiagramComponent } from './components/smart/component-diagram/component-diagram.component';
import { ComponentDataComponent } from './components/smart/component-data/component-data.component';
import { DiagramComponent } from './components/dumb/diagram/diagram.component';
import { ListComponent } from './components/dumb/list/list.component';
import { ComponentInformationComponent } from './components/dumb/component-information/component-information.component';
import { ComponentsDefinitionComponent } from './components/dumb/components-definition/components-definition.component';

@NgModule({
    declarations: [
        AppComponent,
        ComponentDiagramComponent,
        ComponentDataComponent,
        DiagramComponent,
        ListComponent,
        ComponentInformationComponent,
        ComponentsDefinitionComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatExpansionModule,
        MatCardModule,
        MatGridListModule,
        MatListModule,
        MatTabsModule,
        MatCheckboxModule,
        MatSelectModule,
        MatSnackBarModule,
        ScrollingModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
