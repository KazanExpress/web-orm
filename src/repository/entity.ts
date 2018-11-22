import { EntityDataMap } from '../apiMap';
import { QueryResult } from '../queryResult';
import { Entity, IStorableConstructor } from '../storable';
import { IRepoConnection, IRepoData, Repository } from './base';

type PartialWithId<T, ID, IDKey extends PropertyKey> = Partial<T> & {
  [key in IDKey]: ID;
};

type FromSecArg<
  T extends undefined | ((arg: any, ...args: any[]) => any)
> = T extends ((arg: any, other: infer U) => any) ? U : undefined;


export interface IEntityRepoData<IDKey extends PropertyKey> extends IRepoData {
  readonly columns: Array<string>;
  readonly primaryKey: IDKey;
}

/**
 * A typical multi-entity repository.
 *
 * @template `DM` API data map for the repo
 * @template `C` entity constructor type
 * @template `E` entity instance type
 * @template `A` entity constructor parameter options
 * @template `ID` entity primary key type
 * @template `IDKey` entity primary key name
 */
export class EntityRepository<
  DM extends EntityDataMap<C, A>,
  C extends IStorableConstructor<E>,
  E extends Entity = InstanceType<C>,
  A extends ConstructorParameters<C>[0] = ConstructorParameters<C>[0],
  ID = E extends Entity<string, infer IdType> ? IdType : any,
  IDKey extends PropertyKey = E extends Entity<infer IdKey, unknown> ? IdKey : string,
> extends Repository<DM, C, E, A> implements IEntityRepoData<IDKey> {

  public readonly columns: Array<string> = [];
  public readonly primaryKey: IDKey;

  constructor(
    name: string,
    connection: IRepoConnection<DM>,
    entity: C
  ) {
    super(name, connection, entity);
    this.primaryKey = entity.prototype.__id__;

    if (entity.prototype.__col__) {
      this.columns = Object.keys(entity.prototype.__col__);
      delete entity.prototype.__col__;
    } else {
      this.columns = Object.keys(new entity({}, this));
    }
  }

  private get driverOptions(): IEntityRepoData<IDKey> {
    return {
      name: this.name,
      columns: this.columns,
      primaryKey: this.primaryKey
    };
  }

  public async add(
    options: A,
    // TODO: up to debate - singular arguments always or multiple args inference?
    apiOptions?: FromSecArg<DM['add']>
  ) {
    const result = await this.connection.currentDriver.create<A, IEntityRepoData<IDKey>>(this.driverOptions, options);

    try {
      const instance = this.makeDataInstance(result);

      // Call local driver changes synchronously
      const queryResult = new QueryResult(true, instance);

      // @ts-ignore Call api driver asynchronously
      if (apiOptions && this.api) {
        this.$log(`API handler execution start: ${this.name}.add()`);

        // @ts-ignore
        this.api.create(this.driverOptions, apiOptions).then(res => {
          queryResult.result = this.makeDataInstance(result);
          this.$log(`API handler execution end: ${this.name}.add()`);
        }).catch(e => {
          queryResult.error = e;
          this.$log(`API handler execution end: ${this.name}.add()`);
        });
      } else {
        this.$log('No API handler detected');
      }

      return queryResult;
    } catch (e) {
      this.$error(e);

      return new QueryResult<E>(false, this.makeDataInstance(options), e);
    }
  }

  public get(
    id: ID,
    // getApiOptions?: SecArg<DM['get']>
  ): QueryResult<E> {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }

  public update(
    entity: PartialWithId<A, ID, IDKey>,
    // updateApiOptions?: SecArg<DM['update']>
  ): QueryResult<E> {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }

  /* Do we even need this?.. */
  public updateById(
    id: ID,
    query: (entity: E) => Partial<A>,
    // updateApiOptions?: SecArg<DM['updateById']>
  ): QueryResult<E> {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance(query({} as any) as any)
    );
  }

  public delete(
    entity: PartialWithId<A, ID, IDKey> | ID,
    // deleteApiOptions?: SecArg<DM['delete']>
  ): QueryResult<E> {
    throw new Error('Not implemented');

    return new QueryResult(/* TODO: implement this */
      true,
      this.makeDataInstance({} as any)
    );
  }

  // TODO: Find, find by, exists, etc...

  public count() {
    // TODO: count entities
  }

  // TODO: Cluster operations
}