import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { GraphData } from 'src/app/models/storage-models/graph-data';
import { ComponentInformationSidebarService } from 'src/app/services/component-information-sidebar.service';
import { DiagramComponent } from '../../../models/storage-models/diagram-component';

@Component({
  selector: 'app-components-definition',
  templateUrl: './components-definition.component.html',
  styleUrls: ['./components-definition.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentsDefinitionComponent implements OnInit {

  @Input() data: GraphData;

  constructor(private sidebarService: ComponentInformationSidebarService) { }

  ngOnInit() {
  }

  /**
   * viewComponentDetails
   */
  public viewComponentDetails(component: DiagramComponent, $event: any) {
    this.sidebarService.setSidebarComponent(component);
    this.sidebarService.openSidebar();
    $event.stopPropagation();
  }

}
