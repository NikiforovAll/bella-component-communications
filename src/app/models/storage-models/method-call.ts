export interface MethodCall {
    componentName: string;
    references: MethodReference[];
}

export interface MethodReference {
    line: string;
    file: string;
    methodName: string;
    context: string;
    serviceName: string;
}
