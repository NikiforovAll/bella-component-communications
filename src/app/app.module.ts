import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

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
    MatTooltipModule,
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
import { AppConfiguration } from './services/app-config.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
        HttpClientModule,
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
        MatTooltipModule,
        MatSelectModule,
        MatSnackBarModule,
        ScrollingModule,
    ],
    providers: [
        [
            AppConfiguration,
            {
                provide: APP_INITIALIZER,
                useFactory: AppConfigurationFactory,
                deps: [AppConfiguration, HttpClient],
                multi: true,
            },
        ],
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
export function AppConfigurationFactory(appConfig: AppConfiguration) {
    return () => appConfig.ensureInit();
}
