import { ComponentDiagramGraphLayout } from 'src/app/enums/component-diagram-graph-layout.enum';
import { IVirtualNode } from '../interfaces/IVirtualNode';
export class VirtualDOM {
    nodes: IVirtualNode[];
    type: ComponentDiagramGraphLayout;
}
