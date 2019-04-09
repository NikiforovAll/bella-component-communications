export class ItemRegistry {
    private componentMap: Map<string, RegistryItem>;
    private serviceMap: Map<string, RegistryItem>;

    constructor() {
        this.clear();
    }

    public clear() {
        this.componentMap = new Map();
        this.serviceMap = new Map();
    }

    public registerComponent(componentName: string, component: any, container: any) {
        this.componentMap.set(componentName, {
            element: component,
            container
        });
    }
    public registerService(serviceName: string, service: any, container: any) {
        this.serviceMap.set(serviceName, {
            element: service,
            container
        });
    }

    public getComponent(componentName: string): RegistryItem {
        return this.componentMap.get(componentName);
    }

    public getService(serviceName: string): RegistryItem {
        return this.serviceMap.get(serviceName);
    }
}

// TODO: add types
interface RegistryItem {
    element: any;
    container: any;
}
