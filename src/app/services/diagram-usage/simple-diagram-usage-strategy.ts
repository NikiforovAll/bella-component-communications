import { ShowUsageStrategy } from './show-usage-strategy.interface';

export class SimpleDiagramUsageStrategy implements ShowUsageStrategy {

    private counter = 0;

    isNotified(): boolean {
        return this.counter++ % 3 === 0;
    }
}
