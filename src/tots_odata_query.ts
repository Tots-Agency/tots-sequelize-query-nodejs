import parseOData = require("odata-sequelize");

export class TotsOdataQuery {

    constructor(protected sequelize: any, protected model: any) { }

    async paginateWithInclude(include: any, filters: string, page: number, pageSize: number) {
        let query: any;
        if(filters != '' && filters.length > 0){
            query = parseOData(filters, this.sequelize);
        }

        const { count, rows } = await this.model.findAndCountAll({
            include: include,
            where: query.where ?? null,
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

    async paginate(filters: string, page: number, pageSize: number) {
        return this.paginateWithInclude(undefined, filters, page, pageSize);
    }

    static prependFilters(prepend: string, filters: string): string {
        let result = '$filter=' + (prepend.replace('$filter=', ''));
        let processedFilters = filters.replace('$filter=', '');
        if(processedFilters.length > 0) {
          result += ' and (' + processedFilters + ')';
        }
        return result;
      }
}