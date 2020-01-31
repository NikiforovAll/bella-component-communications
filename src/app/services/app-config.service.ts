import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseConfig } from 'src/app/configs/base.config';
import { GraphData } from '../models/storage-models/graph-data';
import { MethodCall } from '../models/storage-models/method-call';
import { StorageService } from './storage/storage.service';

@Injectable()
export class AppConfiguration {
    constructor(private httpClient: HttpClient, private storage: StorageService) {}

    apiDocumentationURL: string;

    ensureInit(): Promise<any> {
        const appConfig = `assets/app.config.json`;
        const payloadConfig = `assets/component-services.json`;
        const methodCallConfig = `assets/method-calls.json`;
        const exportedLSPHostedServices = `assets/bella-lsp-export/hosted-services.json`;
        const exportedLSPServiceReferences = `assets/bella-lsp-export/service-reference.json`;
        const exportedLSProcedures = `assets/bella-lsp-export/procedures.json`;
        const referencesLSObjects = `assets/bella-lsp-export/references.json`;
        const exportedLSObjects = `assets/bella-lsp-export/objects.json`;
        const promises: Promise<void>[] = [
            this.retrieveConfiguration(appConfig).then((response) => {
                Object.assign(this, response);
                BaseConfig.externalDocumentationConfig.baseUrl = this.apiDocumentationURL;
            }),
            this.retrieveConfiguration(payloadConfig).then((response) => {
                this.storage.graphData = response as GraphData;
            }),
            this.retrieveConfiguration(methodCallConfig).then((response) => {
                this.storage.methodCalls = (response as any).nodes as (MethodCall[]);
            }),
            this.retrieveConfiguration(exportedLSPHostedServices).then((response) => {
                this.storage.setHostedServices(response);
            }),
            this.retrieveConfiguration(exportedLSPServiceReferences).then((response) => {
                this.storage.setServiceReferences(response);
            }),
            this.retrieveConfiguration(exportedLSProcedures).then((response) => {
                this.storage.setProcedureReferences(response);
            }),
            this.retrieveConfiguration(referencesLSObjects).then((response) => {
                this.storage.setInvocationReferences(response);
            }),
            this.retrieveConfiguration(exportedLSObjects).then((response) => {
                this.storage.setObjectDeclarations(response);
            }),
        ];
        return Promise.all(promises);
    }

    private retrieveConfiguration(configUrl: string): Promise<any> {
        return this.httpClient
            .get(configUrl)
            .toPromise()
            .catch((response: any) => {
                throw new Error(`Could not load the config file`);
            });
    }
}
