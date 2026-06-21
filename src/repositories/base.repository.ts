import { Injectable } from '@nestjs/common';
import { Model } from 'sequelize-typescript';

@Injectable()
export abstract class BaseRepository<T extends Model> {
    constructor(protected model: any) { }

    public findAll(): Promise<T[]> {
        return this.model.findAll();
    }

    public findOne(id: any): Promise<T | null> {
        return this.model.findOne({ where: { id: id } });
    }

    public create(data: any): Promise<T> {
        return this.model.create(data);
    }

    public bulkCreate(data: any[], options?: any): Promise<T[]> {
        return this.model.bulkCreate(data, options);
    }

    async update(id: any, data: any): Promise<T | null> {
        await this.model.update(data, { where: { id: id } });
        return this.findOne(id);
    }

    async remove(id: any): Promise<void> {
        const item = await this.findOne(id);
        if (item) {
            await item.destroy();
        }
    }

    public getModel() {
        return this.model;
    }
}
