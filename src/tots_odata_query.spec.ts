import { TotsOdataQuery } from './tots_odata_query';

describe('TotsOdataQuery', () => {
    let modelMock: any;
    let sequelizeMock: any;
    let query: TotsOdataQuery;

    beforeEach(() => {
        modelMock = {
            findAndCountAll: jest.fn(),
        };
        sequelizeMock = {}; // Mock sequelize if needed by parseOData or the class
        query = new TotsOdataQuery(sequelizeMock, modelMock);
    });

    describe('processFilters', () => {
        it('should append $filter= if not present', () => {
            const result = TotsOdataQuery.processFilters('name eq "test"');
            expect(result).toBe('$filter=name eq "test"');
        });

        it('should not append $filter= if already present', () => {
            const result = TotsOdataQuery.processFilters('$filter=name eq "test"');
            expect(result).toBe('$filter=name eq "test"');
        });
    });

    describe('prependFilters', () => {
        it('should prepend filters correctly', () => {
            const prepend = '$filter=status eq 1';
            const filters = 'name eq "test"';
            const result = TotsOdataQuery.prependFilters(prepend, filters);
            expect(result).toBe('$filter=status eq 1 and (name eq "test")');
        });

        it('should handle empty filters in prepend', () => {
            const prepend = '$filter=status eq 1';
            const filters = '';
            const result = TotsOdataQuery.prependFilters(prepend, filters);
            // Based on the code:
            // let result = '$filter=' + (prepend.replace('$filter=', ''));
            // let processedFilters = filters.replace('$filter=', '');
            // if (processedFilters.length > 0) ...
            // So it should just be the prepend part
            expect(result).toBe('$filter=status eq 1');
        });
    });

    describe('paginateWithInclude', () => {
        it('should call findAndCountAll with correct parameters (basic)', async () => {
            const mockResult = { count: 10, rows: [{ id: 1 }] };
            modelMock.findAndCountAll.mockResolvedValue(mockResult);

            const result = await query.paginateWithInclude(null, '', 10, 0);

            expect(modelMock.findAndCountAll).toHaveBeenCalledWith({
                include: null,
                where: null, // query is null if no filters
                order: null,
                offset: 0,
                limit: 10,
            });

            expect(result).toEqual({
                current_page: 1,
                data: mockResult.rows,
                per_page: 10,
                total: 10,
            });
        });

        it('should handle pagination', async () => {
            const mockResult = { count: 50, rows: [] };
            modelMock.findAndCountAll.mockResolvedValue(mockResult);

            // Page 2 (skip 10, top 10)
            await query.paginateWithInclude(null, '', 10, 10);

            expect(modelMock.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                offset: 10,
                limit: 10,
            }));
        });
    });

    describe('execWithOptions', () => {
        it('should execute with options', async () => {
            const mockResult = { count: 5, rows: [{ id: 1, name: 'Test' }] };
            modelMock.findAndCountAll.mockResolvedValue(mockResult);

            const options = {
                filters: '',
                top: 20,
                skip: 0,
                orderBy: '',
            };

            const result = await query.execWithOptions(options);

            expect(modelMock.findAndCountAll).toHaveBeenCalledWith({
                include: undefined,
                where: null,
                order: null,
                offset: 0,
                limit: 20,
            });
            expect(result.per_page).toBe(20);
        });

        it('should transform data if dto is provided', async () => {
            const mockResult = { count: 1, rows: [{ id: 1, name: 'Model' }] };
            modelMock.findAndCountAll.mockResolvedValue(mockResult);

            const dtoMock = {
                fromModel: jest.fn().mockReturnValue({ id: 1, name: 'DTO' })
            };

            const options = {
                filters: '',
                top: 10,
                skip: 0,
                orderBy: '',
                dto: dtoMock
            };

            const result = await query.execWithOptions(options);

            expect(dtoMock.fromModel).toHaveBeenCalledWith(mockResult.rows[0]);
            expect(result.data).toEqual([{ id: 1, name: 'DTO' }]);
        });
    });
});
