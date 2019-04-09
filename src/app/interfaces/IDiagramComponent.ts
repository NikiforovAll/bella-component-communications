import { IDiagramService } from './IDiagramService';
import { IVirtualNode } from './IVirtualNode';
import { IDiagramLink } from "./IDiagramLink";
export interface IDiagramComponent extends IVirtualNode {
    services: IDiagramService[];
    links: IDiagramLink[];
    implementation?: any;
}
