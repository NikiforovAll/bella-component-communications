import { KeyedDeclaration } from 'src/app/services/storage/storage.service';
import { InvocationUtils } from 'src/app/components/smart/invocation-chain-builder/invocation-chain-builder.component';

export class InvocationContainer {
    state: InvocationContainerState;
    isOverloaded: boolean;

    constructor(
        public content: KeyedDeclaration,
        public refs: InvocationContainer[],
        public component: string,
        public service?: string) {}

    public get contentName() {
        return InvocationUtils.getProcedureTruncatedName(this.content.name);
    }
    public setInvocationContainerState(state: InvocationContainerState) {
        this.state = state;
    }

    public setOverload(isOverloaded: boolean) {
        this.isOverloaded = isOverloaded;
    }

    public getWarningMessage() {
        const tokens = [];

        if (this.state === InvocationContainerState.RecursionEncounter) {
            tokens.push('[Potential recursion issues]');
        }
        if (this.isOverloaded) {
            tokens.push('[Procedure overload]');
        }
        return tokens.join('\t');
    }


}

export enum InvocationContainerState {
    Standard,
    RecursionEncounter
}
