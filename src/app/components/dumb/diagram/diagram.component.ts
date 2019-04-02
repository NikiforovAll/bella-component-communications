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
} from '@angular/core';
import { ComponentDrawingConfigurationItem } from 'src/app/models/component-drawing-configuration-item';
import { SVGConfig } from '../../../models/svg-config';
import { BaseConfig } from '../../../configs/base.config';
import { ComponentBuilderService } from '../../../services/component-builder/component-builder.service';
import { GraphData } from '../../../models/graph-data';
import { ComponentDiagramGraphLayout } from 'src/app/enums/component-diagram-graph-layout.enum';

@Component({
    selector: 'app-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent implements OnChanges, AfterViewInit {
    @Input() configurationItems: ComponentDrawingConfigurationItem[];
    @Input() graphData: GraphData;
    @Input() layout: ComponentDiagramGraphLayout = ComponentDiagramGraphLayout.Circle;

    @ViewChild('diagramContainer') diagramContainer: ElementRef<SVGElement>;

    public svgConfig: SVGConfig = BaseConfig.svgConfig;
    public isEmptyComponentDiagram: boolean;

    private builder: ComponentBuilderService;

    public ngOnChanges(_: SimpleChanges): void {
        if (!!this.builder) {
            this.initDrawing();
        }
    }

    public ngAfterViewInit(): void {
        this.builder = new ComponentBuilderService(this.svgConfig, this.diagramContainer.nativeElement);
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
        this.builder.buildFromLayout(dataToRender, this.layout);
    }

    private filterDataByComponentName(data: GraphData, names: string[]) {
        const clonedData = JSON.parse(JSON.stringify(data));
        // if (names.length !== 0) {
        clonedData.nodes = data.nodes.filter(el => names.indexOf(el.name) !== -1);
        // }
        return clonedData;
    }
}
