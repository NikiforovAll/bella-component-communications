import { SVGConfig } from '../models/svg-config';

export class BaseConfig {
    public static svgConfig: Readonly<SVGConfig> = {
        width: 1600,
        height: 1200,
        margin: 150,
        componentConfig: {
            width: 250,
            height: 200,
            textLineHeight: 30,
        },
        textPadding: 5,
    };
}
