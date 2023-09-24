import { WhereService } from "./services/where.service";
import { BaseWhere } from "./wheres/base.where";

export class TotsSequelizeQuery {

    wheres: Array<BaseWhere> = [];
    whereService: WhereService = new WhereService();

    constructor(protected model: any, protected filters: string) {
        this.processFilters(filters);
    }

    async paginateWithInclude(include: any, page: number, pageSize: number) {
        const { count, rows } = await this.model.findAndCountAll({
            include: include,
            where: this.whereService.executes(this.wheres),
            offset: (page - 1) * pageSize,
            limit: pageSize,
        });

        return {
            current_page: page,
            data: rows,
            per_page: pageSize,
            total: count
        };
    }

    async paginate(page: number, pageSize: number) {
        return this.paginateWithInclude(undefined, page, pageSize);
    }

    addWhere(where: BaseWhere) {
        this.wheres.push(where);
    }

    protected processWheres(wheres: Array<any>) {
        this.wheres = this.whereService.transforms(wheres);
    }

    protected processFilters(filtersInBase64: string) {
        try {
            const data = Buffer.from(filtersInBase64, 'base64').toString('utf-8');
            const jsonObject = JSON.parse(data);
            // verificar si jsonObject es un array
            if(Array.isArray(jsonObject)) this.processWheres(jsonObject);
            // Verify exist wheres property in jsonObject
            if(jsonObject.hasOwnProperty('wheres')) this.processWheres(jsonObject.wheres);
        } catch (error) {}
    }
}