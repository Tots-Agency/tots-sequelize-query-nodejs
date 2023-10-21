import { BaseWhere } from "../wheres/base.where";
import { EqualWhere } from "../wheres/equal.where";
import { InWhere } from "../wheres/in.where";

export class WhereService {
    classMap = {
        'equal': EqualWhere,
        'in': InWhere
    };

    executes(wheres?: Array<BaseWhere>): any {
        let filters = {};

        if(wheres == undefined){
            return filters;
        }

        for (const where of wheres) {
            where.execute(filters);
        }
        
        return filters;
    }

    transforms(wheres: any): Array<BaseWhere> {
        let list = [];
        for (const where of wheres) {
            list.push(new this.classMap[where.type](where));
        }

        return list;
    }
}