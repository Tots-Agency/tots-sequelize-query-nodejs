import parseOData = require("odata-sequelize");

export class TotsOdataQuery {

    constructor(protected sequelize: any, protected model: any) { }

    /**
     * 
     * @param include 
     * @param filters 
     * @param top Limit the number of items returned.
     * @param skip Skip the number of items returned.
     * @returns 
     */
    async paginateWithInclude(include: any, filters: string, top: number, skip: number, orderBy: string = '') {
        let odataString = '';
        if(filters != '' && filters.length > 0){
            odataString = filters;
        }
        if(orderBy != '' && orderBy.length > 0){
            odataString += '&$orderby=' + orderBy;
        }

        let query: any;
        if(odataString != '' && odataString.length > 0){
            query = parseOData(TotsOdataQuery.processFilters(odataString), this.sequelize);
        }

        const { count, rows } = await this.model.findAndCountAll({
            include: include,
            where: query?.where ?? null,
            order: query?.order ?? null,
            offset: skip,
            limit: top,
        });

        return {
            current_page: (skip / top) + 1,
            data: rows,
            per_page: top,
            total: count
        };
    }

    /**
     * 
     * @param filters 
     * @param top Limit the number of items returned.
     * @param skip Skip the number of items returned.
     * @returns 
     */
    async paginate(filters: string, top: number, skip: number, orderBy: string = '') {
        return this.paginateWithInclude(undefined, filters, top, skip, orderBy);
    }

    static prependFilters(prepend: string, filters: string): string {
        let result = '$filter=' + (prepend.replace('$filter=', ''));
        let processedFilters = filters.replace('$filter=', '');
        if(processedFilters.length > 0) {
          result += ' and (' + processedFilters + ')';
        }
        return result;
    }

    static processFilters(filters: string): string {
        // Verify if start with $filter
        if(filters.startsWith('$filter=')) {
          return filters;
        }
        return '$filter=' + filters;
    }
}