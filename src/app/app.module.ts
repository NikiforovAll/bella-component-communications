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
    MatChipsModule,
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
import { MethodReferenceInfoCardComponent } from './components/dumb/method-reference-info-card/method-reference-info-card.component';
import { InvocationChainBuilderComponent } from './components/smart/invocation-chain-builder/invocation-chain-builder.component';
import { ProcedureContainerComponent } from './components/dumb/procedure-container/procedure-container.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        ComponentDiagramComponent,
        ComponentDataComponent,
        DiagramComponent,
        ListComponent,
        ComponentInformationComponent,
        ComponentsDefinitionComponent,
        MethodReferenceInfoCardComponent,
        InvocationChainBuilderComponent,
        ProcedureContainerComponent,
    ],
    imports: [
        HttpClientModule,
        BrowserModule,
        AppRoutingModule,
        FormsModule,
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
        MatChipsModule,
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
