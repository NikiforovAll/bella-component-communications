import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ComponentDrawingConfigurationItem } from '../../../models/component-drawing-configuration-item';
import { ComponentDiagramGraphLayout } from '../../../enums/component-diagram-graph-layout.enum';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
    @Input() configurationItems: ComponentDrawingConfigurationItem[];
    @Input() layout: ComponentDiagramGraphLayout = ComponentDiagramGraphLayout.Circle;

    @Output() changeConfigSelection = new EventEmitter<boolean>();
    @Output() componentChecked = new EventEmitter<ComponentDrawingConfigurationItem>();
    @Output() changeLayout = new EventEmitter<ComponentDiagramGraphLayout>();

    public layoutsKey =  Object.keys(ComponentDiagramGraphLayout).filter(f => !isNaN(Number(f)));
    public layouts = ComponentDiagramGraphLayout;

    public onConfigurationChanged({ name }: ComponentDrawingConfigurationItem, $event): void {
        this.componentChecked.next({ name, isChecked: $event.checked });
    }

    public onDrawingConfigurationSelection(value: boolean): void {
        this.changeConfigSelection.next(value);
    }

    public onChangeLayout(newLayout: ComponentDiagramGraphLayout): void {
        this.changeLayout.next(+newLayout);
    }
}
