import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    Input,
    SimpleChanges,
    ViewChild,
    ElementRef,
    OnChanges,
    AfterViewInit,
    Output,
    EventEmitter
} from '@angular/core';
import { ComponentDrawingConfigurationItem } from '../../../models/component-drawing-configuration-item';
import { SVGConfig } from '../../../models/svg-config';
import { BaseConfig } from '../../../configs/base.config';
import { ComponentBuilderService } from '../../../services/component-builder/component-builder.service';
import { GraphData } from '../../../models/storage-models/graph-data';
import { ComponentDiagramGraphLayout } from '../../../enums/component-diagram-graph-layout.enum';
import { IComponentBuilder } from 'src/app/interfaces/IComponentBuilder';
import { ComponentInformationSidebarService } from 'src/app/services/component-information-sidebar.service';
import { DiagramComponent as StorageDiagramComponent } from 'src/app/models/storage-models/diagram-component';
import { MethodCall } from 'src/app/models/storage-models/method-call';
@Component({
    selector: 'app-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent implements OnChanges, AfterViewInit {
    @Input() configurationItems: ComponentDrawingConfigurationItem[];
    @Input() graphData: GraphData;
    @Input() methodCalls: MethodCall[];
    @Input() layout: ComponentDiagramGraphLayout = ComponentDiagramGraphLayout.Circle;
    @Output() public componentSelected = new EventEmitter<StorageDiagramComponent>();

    @ViewChild('diagramContainer') diagramContainer: ElementRef<SVGElement>;

    @ViewChild('container') container: ElementRef<HTMLDivElement>;
    public svgConfig: SVGConfig = BaseConfig.svgConfig;
    public isEmptyComponentDiagram: boolean;

    private builder: IComponentBuilder;

    constructor(private sidebarService: ComponentInformationSidebarService) {
    }

    public ngOnChanges(_: SimpleChanges): void {
        this.svgConfig.width = this.container.nativeElement.clientWidth;
        // using default height
        // this.svgConfig.height = this.container.nativeElement.clientHeight;
        if (!!this.builder) {
            this.initDrawing();
        }
    }

    public ngAfterViewInit(): void {
        const builderImpl = new ComponentBuilderService(this.svgConfig, this.diagramContainer.nativeElement);
        this.builder = builderImpl;
        builderImpl.componentSelected$.subscribe(cmpId => {
            const selectedComponent: StorageDiagramComponent = this.graphData.nodes.find(component => component.name === cmpId);
            this.sidebarService.setSidebarComponent(selectedComponent);
            this.sidebarService.openSidebar();
        });
        this.initDrawing();
    }

    private initDrawing(): void {
        this.isEmptyComponentDiagram = !this.configurationItems.some(el => el.isChecked);

        if (this.isEmptyComponentDiagram) {
            return;
        }

        this.builder.clear();
        const dataToRender = this.filterDataByComponentName(
            this.graphData,
            this.configurationItems.filter(el => el.isChecked).map(el => el.name),
        );
        // builder.build(dataToRender);
        this.builder.buildFromLayout(dataToRender, this.methodCalls, this.layout);
    }

    private filterDataByComponentName(data: GraphData, names: string[]) {
        const clonedData = JSON.parse(JSON.stringify(data));
        // if (names.length !== 0) {
        clonedData.nodes = data.nodes.filter(el => names.indexOf(el.name) !== -1);
        // }
        return clonedData;
    }
}
