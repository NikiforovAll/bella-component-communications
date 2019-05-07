import { DiagramComponent } from '../models/storage-models/diagram-component';
import { Service } from '../models/storage-models/service';
import { MethodCall, MethodReference } from '../models/storage-models/method-call';

export function findComponentForServiceByName(components: DiagramComponent[], serviceName: string): DiagramComponent {
    const toComponent = components.find(el => el.services.map(s => s.name).includes(serviceName));
    return toComponent;
}

export function findUsedByComponents(components: DiagramComponent[], componentName: string): DiagramComponent[] {
    const component = components.find(c => c.name === componentName);
    return components
        .filter(c => hasSameServiceAccounts(c.consumes, component.services) ||
            hasSameServiceAccounts(c.services, component.consumes));
}

export function getServiceReferences(hostComponentName: string, serviceName: string, source: MethodCall[]): MethodReference[] {
    return getServiceReferencesForServices(hostComponentName, [serviceName], source);
}
export function getServiceReferencesForComponents(
    hostComponentNames: string[],
    serviceName: string,
    source: MethodCall[]): MethodReference[] {
    const components = source.filter(c => hostComponentNames.includes(c.componentName));
    const result = components.map(c => c.references.filter(s => s.serviceName === serviceName))
        .reduce((res, refs) => res.concat(refs));
    return result;
}
export function getServiceReferencesForServices(
    hostComponentName: string,
    serviceNames: string[],
    source: MethodCall[]): MethodReference[] {
    const mc = source.find(c => c.componentName === hostComponentName).references;
    const result = mc.filter(r => serviceNames.includes(r.serviceName));
    return result;
}
function hasSameServiceAccounts(array1: Service[], array2: Service[]): boolean {
    return array1.some(s1 => array2.some(s2 => s2.name === s1.name));
}
