import { Component, OnInit, Input } from '@angular/core';
import { InvocationContainer } from 'src/app/models/invocation-builder-models/invocation-container.model';
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

  isInternalContainer: boolean;

  constructor(private storage: StorageService, private router: Router) {
  }

  ngOnInit() {
    this.isInternalContainer = this.isInternalProcedure();
  }

  openComponentDocumentation() {
    const externalDocsConfig = BaseConfig.externalDocumentationConfig;
    const procedureName = InvocationUtils
      .getProcedureTruncatedName(this.container.content.name)
      .toLowerCase();
    window.open(`${externalDocsConfig.baseUrl}/components-api/${this.container.component}.html#${procedureName}`, '_blank');
  }

  zoomInToContainer() {
    this.router.navigate(['/present-invocation-chains'],
    {
      queryParams: {
        component: this.container.component,
        service: this.container.service,
        procedure: InvocationUtils.getProcedureTruncatedName(this.container.contentName)
      }
    });
  }

  private isInternalProcedure() {
    return !!InvocationUtils
      .getServiceForProcedure(
        this.storage.getServiceReferences(),
        this.container.component,
        this.container.contentName);
  }
}
