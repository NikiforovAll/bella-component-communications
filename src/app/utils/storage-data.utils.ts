import { DiagramComponent } from '../models/storage-models/diagram-component';

export function findComponentForServiceByName(components: DiagramComponent[], serviceName: string): DiagramComponent {
    const toComponent = components.find(el => el.services.map(s => s.name).includes(serviceName));
    return toComponent;
}
