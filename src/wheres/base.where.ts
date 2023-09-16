export abstract class BaseWhere {
    type: string;
    key: any;
    value: any;

    abstract execute(wheres: any): void;

    isSameKey(key: string): boolean {
        return this.key == key;
    }
}