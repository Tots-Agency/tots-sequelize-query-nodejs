import { BaseWhere } from "./base.where";

export class InWhere extends BaseWhere {

    constructor(data: any) {
        super();
        this.key = data.key;
        this.value = data.value;
    }

    execute(wheres: any) {
        wheres[this.key] = this.value;
    }
}