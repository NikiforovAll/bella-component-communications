import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { BaseConfig, ExternalDocumentationConfig } from 'src/app/configs/base.config';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GraphData } from 'src/app/models/storage-models/graph-data';
import { DiagramComponent } from 'src/app/models/storage-models/diagram-component';
import { Service } from 'src/app/models/storage-models/service';
import { findComponentForServiceByName } from 'src/app/utils/storage-data.utils';
@Component({
    selector: 'app-component-information',
    templateUrl: './component-information.component.html',
    styleUrls: ['./component-information.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentInformationComponent implements OnInit {
    @Input() set selectedDiagramComponent(value: DiagramComponent) {
        //copy
        if (!value) {
            return;
        }
        const assignComponent =
          s => {
            const toComponent = findComponentForServiceByName(this.cachedData.nodes, s.name);

            return Object.assign(
              { parentComponent: toComponent && toComponent.name || '',
                ...s
              });
          };
        this.currentDiagramComponent = Object.assign({}, value);
        this.currentDiagramComponent.consumesExtended = this.currentDiagramComponent.consumes.map(assignComponent);
        this.currentDiagramComponent.servicesExtended = this.currentDiagramComponent.services.map(assignComponent);
    }

    get selectedDiagramComponent(): DiagramComponent {
        return this.currentDiagramComponent;
    }

    private currentDiagramComponent: DiagramComponent & ServiceExtension;
    private externalDocsConfig: ExternalDocumentationConfig;
    private cachedData: GraphData;

    constructor(storageService: StorageService) {
        this.externalDocsConfig = BaseConfig.externalDocumentationConfig;
        this.cachedData = storageService.getComponentData();
    }

    ngOnInit() {}
    openComponentDocumentation(baseElement: any) {
        if (this.instanceOfDiagramComponent(baseElement)) {
            window.open(`${this.externalDocsConfig.baseUrl}/components-api/${baseElement.name}.html#service-reference`, '_blank');
        } else {
            const selectedService = baseElement as (Service & ExtendedService);
            const urlTokens = [
                this.externalDocsConfig.baseUrl,
                '/components-api/',
                selectedService.parentComponent,
                '.html#',
                selectedService.name.toLocaleLowerCase(),
            ];
            window.open(urlTokens.join(''), '_blank');
        }
    }

    private instanceOfDiagramComponent(object: any): object is Service {
        return 'services' in object;
    }
}

interface ServiceExtension {
    consumesExtended?: ExtendedService[];
    servicesExtended?: ExtendedService[];
}

interface ExtendedService {
    parentComponent: string;
}
