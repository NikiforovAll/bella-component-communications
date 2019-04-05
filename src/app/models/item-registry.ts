export class ItemRegistry {
    components: any;
    services: any;

    constructor() {
        this.components = {};
        this.services = {};
    }

    public clear()
    {
        this.components = {};
        this.services = {};
    }
}
