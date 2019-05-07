import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { BaseConfig, ExternalDocumentationConfig } from 'src/app/configs/base.config';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GraphData } from 'src/app/models/storage-models/graph-data';
import { DiagramComponent } from 'src/app/models/storage-models/diagram-component';
import { Service } from 'src/app/models/storage-models/service';
import { findComponentForServiceByName, findUsedByComponents, getServiceReferences, getServiceReferencesForServices, getServiceReferencesForComponents } from 'src/app/utils/storage-data.utils';
import { MethodCall, MethodReference } from 'src/app/models/storage-models/method-call';
@Component({
    selector: 'app-component-information',
    templateUrl: './component-information.component.html',
    styleUrls: ['./component-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentInformationComponent implements OnInit {
    @Input() set selectedDiagramComponent(value: DiagramComponent) {
        // copy
        if (!value) {
            return;
        }
        const assignComponent = s => {
            const toComponent = findComponentForServiceByName(this.cachedData.nodes, s.name);
            return Object.assign({
                parentComponent: toComponent && toComponent.name,
                reference: getServiceReferences(value.name, s.name, this.methodCallCachedData),
                ...s,
            });
        };
        this.currentDiagramComponent = Object.assign({}, value);
        this.currentDiagramComponent.consumesExtended = this.currentDiagramComponent.consumes.map(assignComponent);
        this.currentDiagramComponent.servicesExtended = this.currentDiagramComponent.services.map(assignComponent);
        const usedBy = findUsedByComponents(this.cachedData.nodes, this.currentDiagramComponent.name);
        usedBy.forEach(c => {
            (c as any).reference = getServiceReferencesForServices(c.name, value.services.map(s => s.name), this.methodCallCachedData);
        });
        this.currentDiagramComponent.consumedBy = usedBy as (DiagramComponent & ComponentExtension)[];
    }

    get selectedDiagramComponent(): DiagramComponent {
        return this.currentDiagramComponent;
    }

    public currentDiagramComponent: DiagramComponent & ServiceExtension;
    private externalDocsConfig: ExternalDocumentationConfig;
    private cachedData: GraphData;
    private methodCallCachedData: MethodCall[];

    constructor(storageService: StorageService) {
        this.externalDocsConfig = BaseConfig.externalDocumentationConfig;
        this.cachedData = storageService.getComponentData();
        this.methodCallCachedData = storageService.getMethodCallData();
    }

    ngOnInit() {}

    openComponentDocumentation(baseElement: any, component: string) {
        if (this.instanceOfDiagramComponent(baseElement)) {
            window.open(`${this.externalDocsConfig.baseUrl}/components-api/${baseElement.name}.html#service-reference`, '_blank');
        } else {
            throw new Error('Not instance of component');
        }
    }

    generateDocumentationUrl(baseElement: any) {
        if (this.instanceOfDiagramComponent(baseElement)) {
            return `${this.externalDocsConfig.baseUrl}/components-api/${baseElement.name}.html#service-reference`;
        } else {
            const selectedService = baseElement as (Service & ExtendedService);
            const urlTokens = [
                this.externalDocsConfig.baseUrl,
                !!selectedService.parentComponent ? `/components-api/${selectedService.parentComponent}.html` : '/component-api-list.html',
                `#${selectedService.name.toLocaleLowerCase()}`,
            ];
            return urlTokens.join('');
        }
    }

    private instanceOfDiagramComponent(object: any): object is Service {
        return 'services' in object;
    }
}

interface ServiceExtension {
    consumesExtended?: ExtendedService[];
    servicesExtended?: ExtendedService[];
    consumedBy?: (DiagramComponent & ComponentExtension)[];
}

interface ExtendedService {
    parentComponent: string;
    reference?: MethodReference[];
}

interface ComponentExtension {
    reference?: MethodReference[];
}
