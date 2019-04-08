import { ElementCoordinate } from '../models/element-coordinate';
import { IElementFrame } from './IElementFrame';
export interface IVirtualNode {
    coordinates: ElementCoordinate;
    title: string;
    frame: IElementFrame;
    nodeClass: string;
    implementation?: any;
}
