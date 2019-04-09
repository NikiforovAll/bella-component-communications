import { IDiagramService } from '../interfaces/IDiagramService';
import { IDiagramComponent } from '../interfaces/IDiagramComponent';
import { IDiagramLink } from '../interfaces/IDiagramLink';
import { ElementCoordinate } from './element-coordinate';
export class DiagramLink implements IDiagramLink {
    start: ElementCoordinate;
    end: ElementCoordinate;
    fromComponent: string;
    toComponent: string;
    toService: string;
    implementation?: any;

    updateCallback?: VirtualNodeUpdate;

    constructor(init?: Partial<DiagramLink>) {
        Object.assign(this, init);
    }

    public setCoordinates(x1: number, y1: number, x2: number, y2: number): void {
        this.start.x = x1;
        this.start.y = y1;
        this.end.x = x2;
        this.end.y = y2;
        this.updateCallback(this, this.implementation);
    }
}

type VirtualNodeUpdate = (ctx: IDiagramLink, implementation: any) => void;
