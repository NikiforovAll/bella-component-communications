import { Component, OnInit, Input } from '@angular/core';
import { InvocationContainer, CommunicationPattern } from 'src/app/models/invocation-builder-models/invocation-container.model';
import { BaseConfig } from 'src/app/configs/base.config';
import { InvocationUtils } from '../../smart/invocation-chain-builder/invocation-chain-builder.component';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-procedure-container',
  templateUrl: './procedure-container.component.html',
  styleUrls: ['./procedure-container.component.scss']
})
export class ProcedureContainerComponent implements OnInit {

  @Input()
  container: InvocationContainer;

  @Input()
  isShowZoomToControl = true;
  isInternalContainer: boolean;
  _containerCommunicationPattern: CommunicationPattern;
  get communicationPattern() { return CommunicationPattern; }

  constructor(private storage: StorageService, private router: Router) {
  }

  ngOnInit() {
    this.isInternalContainer = this.isInternalProcedure();
    this._containerCommunicationPattern = this.containerCommunicationPattern();
  }

  openComponentDocumentation() {
    const externalDocsConfig = BaseConfig.externalDocumentationConfig;
    const procedureName = InvocationUtils
      .getProcedureTruncatedName(this.container.content.name)
      .toLowerCase();
    window.open(`${externalDocsConfig.baseUrl}/components-api/${this.container.component}.html#${procedureName}`, '_blank');
  }

  zoomInToContainer() {
    const componentName = this.container.component;
    const procedureName = InvocationUtils.getProcedureTruncatedName(this.container.contentName);
    const service = InvocationUtils.getServiceForProcedure(
      this.storage.getServiceReferences(), componentName, procedureName);
    this.router.navigate(['/present-invocation-chains'],
    {

      queryParams: {
        component: this.container.component,
        service: service ? service.name : undefined,
        procedure: InvocationUtils.getProcedureTruncatedName(this.container.contentName)
      }
    });
  }

  public containerCommunicationPattern() {
    this.calculateContainerInfoLazy();
    return this._containerCommunicationPattern;
  }

  private calculateContainerInfoLazy() {
    this.isInternalContainer = this.isInternalContainer || !!InvocationUtils
    .getServiceEntryForProcedure(
      this.storage.getServiceReferences(),
      this.container.component,
      this.container.contentName);
    if (!this._containerCommunicationPattern) {
      const serviceName = this.container.channel;
      const hostedService = (this.storage.getHostedServices()
        .find( (hs: any) => hs.serviceType === 'external' && hs.serviceName === serviceName) as any);
      if (hostedService) {
        this._containerCommunicationPattern = hostedService.serviceTransportName.includes('Kompass')
          ? CommunicationPattern.Async
          : CommunicationPattern.Sync;
      }
    }
  }



  private isInternalProcedure() {
    this.calculateContainerInfoLazy();
    return this.isInternalContainer;
  }
}
