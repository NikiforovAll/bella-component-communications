import * as _ from 'lodash';

export class ModelFlattener {
    _model: any;

    constructor(model) {
        this._model = new model();
    }

    flat(source) {
        const self = this;
        const separator = '.';

        return {
            ...function _flatten(child, path = []) {
                return [].concat(...Object.keys(child).map(key => {
                    return (typeof child[key] === 'object' && !self._model.original.includes(key))
                        ? _flatten(child[key] || " ", path.concat([key]))
                        : ({ [path.concat([key]).join(separator)] : child[key] })
                }));
            }(source)
        };
    }
}
