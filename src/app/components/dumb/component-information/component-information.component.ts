import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { DiagramComponent } from "src/app/models/storage-models/diagram-component";
import { ComponentInformationSidebarService } from 'src/app/services/component-information-sidebar.service';
import { Service } from 'src/app/models/storage-models/service';
import { BaseConfig, ExternalDocumentationConfig } from "src/app/configs/base.config";
@Component({
  selector: 'app-component-information',
  templateUrl: './component-information.component.html',
  styleUrls: ['./component-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentInformationComponent implements OnInit {

  @Input() selectedDiagramComponent: DiagramComponent;

  private externalDocsConfig: ExternalDocumentationConfig;

  constructor(private sidebarService: ComponentInformationSidebarService) {
    this.externalDocsConfig = BaseConfig.externalDocumentationConfig;
  }

  ngOnInit() {
  }
  openComponentDocumentation(service: Service, type?: string) {
    window.open(this.externalDocsConfig.baseUrl, '_blank');
  }
}
