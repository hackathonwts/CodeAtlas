import { Model } from "mongoose";

export class BaseRepository<T> {
    private readonly model: Model<T>;
    constructor(model: Model<T>) {
        this.model = model;
    }
}