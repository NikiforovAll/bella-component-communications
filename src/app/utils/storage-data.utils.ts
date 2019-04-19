import { DiagramComponent } from '../models/storage-models/diagram-component';
import { Service } from '../models/storage-models/service';

export function findComponentForServiceByName(components: DiagramComponent[], serviceName: string): DiagramComponent {
    const toComponent = components.find(el => el.services.map(s => s.name).includes(serviceName));
    return toComponent;
}

export function findUsedByComponents(components: DiagramComponent[], componentName: string): DiagramComponent[] {
    const component = components.find(c => c.name === componentName);
    return components.filter(c => hasSameServiceAccounts(c.consumes, component.services));
}

function hasSameServiceAccounts(array1: Service[], array2: Service[]): boolean {
    return array1.some(s1 => array2.some(s2 => s2.name === s1.name));
}
