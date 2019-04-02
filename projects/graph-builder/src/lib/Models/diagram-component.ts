import { Service } from "./service";
export interface DiagramComponent {
    name: string
    services: Service[]
    consumes?: Service[]
    dom?: any
}
