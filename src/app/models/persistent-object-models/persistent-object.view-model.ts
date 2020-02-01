import { BaseDeclaration, KeyedDeclaration } from 'src/app/services/storage/storage.service';

export class PersistentObjectViewModel {
    fields?: ObjectField[];
    returnType?: PersistentObjectViewModel | any;
    name: string;
    uri?: string;
    isTerminal?: boolean;
}

export class ObjectField {
    value: PersistentObjectViewModel;
}

// tslint:disable-next-line: no-namespace
export namespace PersistentObjectUtils {

    export function toPersistentObjectViewModel(
        declaration: KeyedDeclaration,
        registry: KeyedDeclaration[],
        searchQuery?: string): PersistentObjectViewModel {
        let extendedDeclaration = (declaration as any) as ExtendedDeclaration;
        let result = {
            name: declaration.name,
            uri: declaration.uri,
            returnType: searchPersistentViewModel(getDeclarationNameFromReturnType(
                extendedDeclaration.returnType.fullQualifier
            ), registry),
            fields: declaration
                .members ? declaration
                    .members
                    .map(declarationMember => ({
                        value: searchPersistentViewModel(declarationMember.name, registry)
                    })) : undefined
        };

        const simplified = simplify(result);
        return isMatchedDeclaration(simplified, searchQuery) ? format(simplified) : undefined;
        // return format(simplified);
    }

    function isMatchedDeclaration(model: PersistentObjectViewModel | undefined, searchQuery: string) {
        if (!searchQuery) {
            return true;
        }
        if (!model || !model.name) {
            return false;
        }
        return model.name.toLowerCase().includes(searchQuery.toLowerCase())
            || isMatchedDeclaration(model.returnType, searchQuery)
            || (model.fields && model.fields.some(f => isMatchedDeclaration(f.value, searchQuery)));

        // if (model.name.includes(searchQuery)) {
        //     return true;
        // }
        // let filteredReturnType = isMatchedDeclaration(model.returnType, searchQuery);
        // let filteredFields = model.fields.map(f => isMatchedDeclaration(f.value, searchQuery));

        // if (!filteredReturnType && filteredFields.length === 0) {
        //     return undefined;
        // }
    }

    function simplify(model: PersistentObjectViewModel): PersistentObjectViewModel | any {
        if (!model) {
            return undefined;
        }
        if (model.returnType && model.returnType.isTerminal) {
            return model.returnType.name;
        }
        return {
            name: model.name,
            uri: model.uri ? model.uri : undefined,
            returnType: simplify(model.returnType),
            fields: model.fields ? model.fields.map(f => ({ value: simplify(f.value) })) : undefined
        };
        // return model;
    }

    function format(model: PersistentObjectViewModel) {
        if (!model) {
            return undefined;
        }
        return {
            name: model.name,
            uri: model.uri ? model.uri : undefined,
            returnType: format(model.returnType),
            fields: model.fields ? model.fields.map(f => formatField(f)) : undefined
        };
    }

    function formatField(field: ObjectField): any {
        if (!field) {
            return undefined;
        }
        if ( typeof field.value.returnType === 'string') {
            const blank = {};
            blank[field.value.name] = { returnType: field.value.returnType };
            return blank;
        }
        return format(field.value);

    }

    export function searchPersistentViewModel(name: string, registry: KeyedDeclaration[]): PersistentObjectViewModel {
        const declaration = registry.find(d => d.name === name);
        if (!declaration) {
            // throw new Error('Object declaration is not found');
            return {
                name,
                isTerminal: true
            };
        }
        const extendedDeclaration = (declaration as any) as ExtendedDeclaration;
        // if (! declaration.members ) {
        //     const emptyMembersDeclaration = searchPersistentViewModel(getDeclarationNameFromReturnType(
        //         extendedDeclaration.returnType.fullQualifier
        //     ), registry);
        //     return {
        //         name,
        //         returnType: emptyMembersDeclaration.isTerminal
        //             ? emptyMembersDeclaration.returnType
        //             : emptyMembersDeclaration.name
        //     };
        // }
        return {
            name: declaration.name,
            returnType: extendedDeclaration.returnType ? searchPersistentViewModel(getDeclarationNameFromReturnType(
                extendedDeclaration.returnType.fullQualifier
            ), registry) : undefined,
            fields: declaration
                .members ? declaration
                    .members
                    .map(declarationMember => ({
                        value: searchPersistentViewModel(declarationMember.name, registry)
                    })) : undefined
        };
    }

    function getDeclarationNameFromReturnType(qualifier: string) {
        let tokens = qualifier.split('[');
        return tokens[0];
    }
}

interface ExtendedDeclaration {
    returnType: {
        name: string;
        fullQualifier: string;
    }
}
