import { ElementCoordinate } from './element-coordinate';
import { IElementFrame } from '../interfaces/IElementFrame';
import { IDiagramService } from '../interfaces/IDiagramService';
import { DiagramComponent } from "../models/diagram-component";
export class DiagramService implements IDiagramService {
    hostedOn: string;
    coordinates: ElementCoordinate;
    frame: IElementFrame;
    nodeClass: string;
    parentComponent?: DiagramComponent;

    constructor(public title: string, init?: Partial<DiagramService>) {
        this.title = title;
        this.nodeClass = 'diagram-service';
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

    public getConnector(): ElementCoordinate {
        return { x: this.coordinates.x + this.frameWidth, y: this.coordinates.y};
    }
}
