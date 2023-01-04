import { Injectable } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';

@Injectable()
export class UnitOfWork {
  private manager: EntityManager;
  private queryRunner: QueryRunner;

  constructor(private dataSource: DataSource) {}

  setTransactionManager() {
    this.manager = this.queryRunner.manager;
  }

  async startTransaction() {
    this.queryRunner = this.dataSource.createQueryRunner();
    // can specify isolation level
    // await this.queryRunner.startTransaction("SERIALIZABLE")

    await this.queryRunner.startTransaction();
    this.setTransactionManager();
  }

  getRepository<T>(E: EntityClassOrSchema): Repository<T> {
    if (!this.manager) {
      throw new Error('Unit of work is not started. Call the start() method');
    }

    return this.manager.getRepository(E);
  }

  async complete(work: () => void) {
    try {
      await work();
      await this.queryRunner.commitTransaction();
    } catch (error) {
      await this.queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.queryRunner.release();
    }
  }

  async commitTransaction(): Promise<void> {
    await this.queryRunner.commitTransaction();
  }

  async rollbackTransaction(): Promise<void> {
    await this.queryRunner.rollbackTransaction();
  }
}
