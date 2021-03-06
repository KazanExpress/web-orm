import { Connection } from '../connection/connection';
import { Debugable } from '../debug';
import { Driver, FallbackDriver, IDriverConstructor } from '../drivers';
import { QueryResult } from '../queryResult';
import { IStorableConstructor, Record } from '../storable';
import { FromSecArg, IRepoData, IRepoFactoryOptions, RepoFactory, Repository, selectDriver } from './base';

export interface IRecordRepoMethods<
  C extends IStorableConstructor<E>,
  E extends Record = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0],
  ReturnType = any
> {
  create(
    options: A,
    apiOptions?: any
  ): Promise<ReturnType>;

  read(
    apiOptions?: any
  ): Promise<ReturnType>;

  update(
    options: Partial<A>,
    apiOptions?: any
  ): Promise<ReturnType>;

  delete(
    deleteApiOptions?: any
  ): Promise<ReturnType>;

  //...
  // TODO - other methods?
}
export interface IRecordRepository<
  C extends IStorableConstructor<E>,
  E extends Record = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0]
> extends IRepoData, IRecordRepoMethods<C, E, A, QueryResult<E> | QueryResult<undefined>>, Debugable {}

export type RecordDataMap<
  C extends IStorableConstructor<E>,
  E extends Record = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0]
> = Partial<IRecordRepoMethods<C, E, A, A | undefined>>;

/**
 * A single-entity repository.
 *
 * @template `DM` API data map for the repo
 * @template `C` entity constructor type
 * @template `E` entity instance type
 * @template `A` entity constructor parameter options
 */
export class RecordRepositoryClass<
  DM extends RecordDataMap<C, E, A>,
  C extends IStorableConstructor<E>,
  E extends Record = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0],
> extends Repository<DM, C, E, A> implements IRepoData, IRecordRepository<C, E ,A> {
  constructor(
    name: string,
    connectionName: string,
    public readonly currentDriver: Driver,
    record: C,
    api?: DM,
  ) { super(name, connectionName, record, api); }

  public async create(
    options: A,
    apiOptions?: FromSecArg<DM['create']> | false
  ) {
    throw new Error('Not implemented');

    return new QueryResult<E>(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }

  public async update(
    options: Partial<A>,
    apiOptions?: FromSecArg<DM['update']> | false
  ) {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }

  public async read(apiOptions?: FromSecArg<DM['read']> | false) {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }

  public async delete(apiOptions?: FromSecArg<DM['delete']> | false) {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }
}


export function RecordRepository<
  D extends RecordDataMap<C>,
  C extends IStorableConstructor<any>,
  E extends Record = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0],
>(options: IRepoFactoryOptions<C, D> & {
  dirvers?: IDriverConstructor | IDriverConstructor[];
}): RepoFactory<RecordRepositoryClass<D, C, E, A>> {
  return (name: string, connection: Connection) => new RecordRepositoryClass<D, C, E, A>(
    name,
    connection.connectionName,
    new (selectDriver(options.dirvers || FallbackDriver, name))(connection),
    options.model,
    options.api
  );
}
