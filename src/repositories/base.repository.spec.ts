import { BaseRepository } from './base.repository';
import { Model } from 'sequelize-typescript';

class TestModel extends Model {}

class TestRepository extends BaseRepository<TestModel> {
    constructor(modelMock: any) {
        super(modelMock);
    }
}

describe('BaseRepository', () => {
    let modelMock: any;
    let repository: TestRepository;

    beforeEach(() => {
        modelMock = {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            bulkCreate: jest.fn(),
            update: jest.fn(),
        };
        repository = new TestRepository(modelMock);
    });

    describe('findAll', () => {
        it('should call model.findAll', async () => {
            modelMock.findAll.mockResolvedValue([{ id: 1 }]);
            const result = await repository.findAll();
            expect(modelMock.findAll).toHaveBeenCalled();
            expect(result).toEqual([{ id: 1 }]);
        });
    });

    describe('findOne', () => {
        it('should call model.findOne with correct where clause', async () => {
            modelMock.findOne.mockResolvedValue({ id: 1 });
            const result = await repository.findOne(1);
            expect(modelMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual({ id: 1 });
        });
    });

    describe('create', () => {
        it('should call model.create with correct data', async () => {
            const data = { name: 'Test' };
            modelMock.create.mockResolvedValue({ id: 1, ...data });
            const result = await repository.create(data);
            expect(modelMock.create).toHaveBeenCalledWith(data);
            expect(result).toEqual({ id: 1, ...data });
        });
    });

    describe('bulkCreate', () => {
        it('should call model.bulkCreate with data and options', async () => {
            const data = [{ name: 'Test 1' }, { name: 'Test 2' }];
            const options = { validate: true };
            modelMock.bulkCreate.mockResolvedValue([{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test 2' }]);
            
            const result = await repository.bulkCreate(data, options);
            
            expect(modelMock.bulkCreate).toHaveBeenCalledWith(data, options);
            expect(result).toEqual([{ id: 1, name: 'Test 1' }, { id: 2, name: 'Test 2' }]);
        });
    });

    describe('update', () => {
        it('should call model.update and return updated instance', async () => {
            const data = { name: 'Updated' };
            modelMock.update.mockResolvedValue([1]);
            modelMock.findOne.mockResolvedValue({ id: 1, name: 'Updated' });

            const result = await repository.update(1, data);

            expect(modelMock.update).toHaveBeenCalledWith(data, { where: { id: 1 } });
            expect(modelMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual({ id: 1, name: 'Updated' });
        });
    });

    describe('remove', () => {
        it('should destroy model instance if found', async () => {
            const destroyMock = jest.fn();
            modelMock.findOne.mockResolvedValue({ id: 1, destroy: destroyMock });

            await repository.remove(1);

            expect(modelMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(destroyMock).toHaveBeenCalled();
        });

        it('should do nothing if model instance is not found', async () => {
            modelMock.findOne.mockResolvedValue(null);

            await repository.remove(1);

            expect(modelMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });
    });

    describe('getModel', () => {
        it('should return the underlying model mock', () => {
            expect(repository.getModel()).toBe(modelMock);
        });
    });
});
