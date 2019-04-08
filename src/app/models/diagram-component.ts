import { IDiagramService } from '../interfaces/IDiagramService';
import { IDiagramComponent } from '../interfaces/IDiagramComponent';
import { IDiagramLink } from '../interfaces/IDiagramLink';
import { IElementFrame } from '../interfaces/IElementFrame';
import { ElementCoordinate } from './element-coordinate';
export class DiagramComponent implements IDiagramComponent {

    services: IDiagramService[];
    links: IDiagramLink[];
    subscribedLinks: IDiagramLink[];
    coordinates: ElementCoordinate;
    title: string;
    frame: IElementFrame;
    nodeClass: string;
    implementation?: any;
    updateCallback?: VirtualNodeUpdate;

    constructor(title: string, coordinates: ElementCoordinate, init?: Partial<DiagramComponent>) {
        this.coordinates = coordinates;
        this.title = title;
        this.nodeClass = 'diagram-component';
        this.services = [];
        this.links = [];
        this.subscribedLinks = [];
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

    public setCoordinates(x: number, y: number): void {
        this.coordinates.x = x;
        this.coordinates.y = y;
        this.updateCallback(this, this.implementation);
    }
    public getConnector() {
        return { x: this.coordinates.x + this.frameWidth / 2, y: this.coordinates.y };
    }
}

type VirtualNodeUpdate = (component: DiagramComponent, implementation: any) => void;
