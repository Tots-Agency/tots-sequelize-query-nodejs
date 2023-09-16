import { BaseWhere } from "./base.where";

export class EqualWhere extends BaseWhere {

    constructor(data: any) {
        super();
        this.key = data.key;
        this.value = data.value;
    }

    execute(wheres) {
        wheres[this.key] = this.value;
    }
}