import { ElementCoordinate } from '../models/element-coordinate';
export interface IDiagramLink {
    start: ElementCoordinate;
    end: ElementCoordinate;

    fromComponent: string;
    toComponent: string;
    toService: string;

    implementation?: any;
}


