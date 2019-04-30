import { SVGConfig } from '../models/svg-config';

export class BaseConfig {
    public static svgConfig: Readonly<SVGConfig> = {
        width: 1200,
        height: 900,
        margin: 150,
        componentConfig: {
            width: 250,
            height: 200,
            textLineHeight: 30,
        },
        textPadding: 5,
    };

    // TODO: not read-only config anymore, consider to provide it as service with getter.
    public static externalDocumentationConfig: ExternalDocumentationConfig = {
        baseUrl: ''
    };
}

export interface ExternalDocumentationConfig {
    baseUrl: string;
}
