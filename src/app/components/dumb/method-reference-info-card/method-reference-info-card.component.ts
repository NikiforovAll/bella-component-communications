import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MethodCall, MethodReference } from 'src/app/models/storage-models/method-call';
import { BaseConfig, ExternalDocumentationConfig } from 'src/app/configs/base.config';
import { StorageService } from 'src/app/services/storage/storage.service';
import { getServiceReferencesForComponents } from 'src/app/utils/storage-data.utils';

@Component({
    selector: 'app-method-reference-info-card',
    templateUrl: './method-reference-info-card.component.html',
    styleUrls: ['./method-reference-info-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MethodReferenceInfoCardComponent implements OnInit {
    @Input()
    entityName: string;

    @Input()
    entityUrl: string;

    @Input()
    component: string;

    @Input()
    methodReference: MethodReference[];

    @Input()
    isLazyLoaded = false;

    isDataLoaded: boolean;
    private externalDocsConfig: ExternalDocumentationConfig;
    private methodCallCachedData: MethodCall[];

    constructor(private storageService: StorageService) {
      this.methodCallCachedData = storageService.getMethodCallData();
    }

    ngOnInit() {
        this.externalDocsConfig = BaseConfig.externalDocumentationConfig;
        this.isDataLoaded = !this.isLazyLoaded;

    }

    openEntityDocumentation() {
        window.open(this.entityUrl, '_blank');
    }

    loadReferencesByName(serviceName) {
      this.methodReference = getServiceReferencesForComponents(
        this.methodCallCachedData.map(c => c.componentName), serviceName, this.methodCallCachedData);
      this.isDataLoaded = true;
    }

    openMethodDocumentation(ref: MethodReference) {
        const urlTokens = [
            this.externalDocsConfig.baseUrl,
            !!this.component ? `/components-api/${this.component}.html` : '/component-api-list.html',
            `#${ref.methodName.toLocaleLowerCase()}`,
        ];
        window.open(urlTokens.join(''), '_blank');
    }

    getLine(ref: MethodReference, split) {
      const url = `${ref.file}, line: ${ref.line}`;
      if (split) {
        return url.split('/').join(' / ');
      }
      return url;
    }
}
