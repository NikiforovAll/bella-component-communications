import { GraphData } from '../models/storage-models/graph-data';
import { ComponentDiagramGraphLayout } from '../enums/component-diagram-graph-layout.enum';
import { MethodCall } from '../models/storage-models/method-call';

export interface IComponentBuilder {

    build(data: GraphData): void;
    buildFromLayout(data: GraphData, methodCalls: MethodCall[], layout: ComponentDiagramGraphLayout): void;
    clear(): void;
}
