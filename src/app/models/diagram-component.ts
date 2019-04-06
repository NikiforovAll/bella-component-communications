import { IDiagramService } from '../interfaces/IDiagramService';
import { IDiagramComponent } from '../interfaces/IDiagramComponent';
import { IDiagramLink } from '../interfaces/IDiagramLink';
import { IElementFrame } from '../interfaces/IElementFrame';
import { ElementCoordinate } from './element-coordinate';
export class DiagramComponent implements IDiagramComponent {
    services: IDiagramService[];
    links: IDiagramLink[];
    coordinates: ElementCoordinate;
    title: string;
    frame: IElementFrame;
    nodeClass: string;
    constructor(title: string, coordinates: ElementCoordinate, init?: Partial<DiagramComponent>) {
        this.coordinates = coordinates;
        this.title = title;
        this.nodeClass = 'diagram-component';
        this.services = [];
        this.links = [];
        this.frame = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
        };
        Object.assign(this, init);
    }

    public get frameWidth(): number {
        return Math.abs(this.frame.start.x - this.frame.end.x);
    }

    public get frameHeight(): number {
        return Math.abs(this.frame.start.y - this.frame.end.y);
    }
}
