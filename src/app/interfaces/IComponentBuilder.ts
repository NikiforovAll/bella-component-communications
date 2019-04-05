import { GraphData } from '../models/graph-data';
import { ComponentDiagramGraphLayout } from '../enums/component-diagram-graph-layout.enum';

export interface IComponentBuilder {

    build(data: GraphData): void;
    buildFromLayout(data: GraphData, layout: ComponentDiagramGraphLayout): void;
    clear(): void;
}
