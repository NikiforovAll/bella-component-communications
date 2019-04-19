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

    public static externalDocumentationConfig: Readonly<ExternalDocumentationConfig> = {
        baseUrl: 'https://condescending-bhaskara-2cb98d.netlify.com/'
    };
}

export interface ExternalDocumentationConfig {
    baseUrl: string;
}
