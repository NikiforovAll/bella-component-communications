import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseConfig } from 'src/app/configs/base.config';
import { GraphData } from '../models/storage-models/graph-data';
import { StorageService } from './storage/storage.service';

@Injectable()
export class AppConfiguration {
    constructor(private httpClient: HttpClient, private storage: StorageService) {}

    apiDocumentationURL: string;

    ensureInit(): Promise<any> {
        const appConfig = `assets/app.config.json`;
        const payloadConfig = `assets/component-communication.json`;
        const promises: Promise<void>[] = [
            new Promise<void>((resolve, reject) => {
                this.httpClient
                    .get(payloadConfig)
                    .toPromise()
                    .then(response => {
                        this.storage.graphData = response as GraphData;
                        resolve();
                    })
                    .catch((response: any) => {
                        reject(`Could not load the config file`);
                    });
            }),
            new Promise<void>(
                (resolve, reject) => {
                    this.httpClient
                        .get(appConfig)
                        .toPromise()
                        .then(response => {
                            Object.assign(this, response);
                            BaseConfig.externalDocumentationConfig.baseUrl = this.apiDocumentationURL;
                            resolve();
                        })
                        .catch((response: any) => {
                            reject(`Could not load the config file`);
                        });
                }
            )
        ];
        return Promise.all(promises);
    }
}
