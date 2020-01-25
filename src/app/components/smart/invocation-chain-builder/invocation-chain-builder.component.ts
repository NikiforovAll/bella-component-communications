import { Component, OnInit } from '@angular/core';
import { StorageService, NamespacedDeclarations, KeyedDeclaration, DeclarationType } from 'src/app/services/storage/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-invocation-chain-builder',
  templateUrl: './invocation-chain-builder.component.html',
  styleUrls: ['./invocation-chain-builder.component.scss']
})
export class InvocationChainBuilderComponent implements OnInit {

  components: string[];
  groupedServices: NamespacedDeclarations[];
  // services: KeyedDeclaration[];
  selectedComponent: string;
  selectedService: string;
  selectedProcedure: string;


  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router) {
    this.init();
    this.route.queryParams.subscribe(params => {
      const { component, service, procedure } = params;
      this.selectedComponent = component;
      this.selectedService = service;
      this.selectedProcedure = procedure;
    });
  }

  ngOnInit() {
  }

  private init() {
    this.groupedServices = this.storage.getServiceReferences();
    this.components = this.groupedServices.map((group) => group.namespace);
  }

  getServicesForComponent(cmp: string) {
    if (!cmp) {
      return;
    }
    return this.groupedServices.find((namespacedServices) => namespacedServices.namespace === cmp)
      .procedures.filter((service) => service.type === DeclarationType.Service);
  }

  getProcedureForService(cmp: string, serviceName: string) {
    if (!cmp || !serviceName) {
      // this.selectedService = null;
      return;
    }
    const foundService = this.getServicesForComponent(cmp).find(s => s.name === serviceName);
    return foundService ? foundService.members : [];
  }

  private changeQuery() {
    this.router.navigate(['.'], {
      relativeTo: this.route, queryParams: {
        component: this.selectedComponent,
        service: this.selectedService,
        procedure: this.selectedProcedure
      }
    });
  }

}
