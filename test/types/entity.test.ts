import { Connection } from '../../src';
import { Broken, Product, User } from '../common/models';
import { UserApiMap, ProductApiMap } from '../common/api';

describe('types', () => {
  it('types', async () => {
    Connection.$debug(true);

    const orm = new Connection('asd', [], {
      Products: Product,
      User,
      Broken
    }, {
      User: new UserApiMap(),
      Products: new ProductApiMap(),
      Broken: {
        async create() {
          return Promise.resolve(new Broken());
        },
        async delete() {
          return Promise.resolve(new Broken());
        },
        async update() {
          return Promise.resolve(new Broken());
        },
      }
    });

    const podguznik = {
      id: 0,
      title: 'podguznik',
      url: '/products'
    };

    await orm.Products.add(podguznik, 'asdasd');
    await orm.Products.add(podguznik, false);

    expect((await orm.Products.get(0)).result).toMatchObject(podguznik);

    try {
      await orm.Products.update({
        id: 0,
        title: 'Cool Podguzninki for cool kids!'
      });
    } catch (e) { }

    try {
      await orm.Products.updateById(0, product => ({
        url: `/products/${product.id}`
      }));
    } catch (e) { }

    try {
      await orm.Products.delete(0);
    } catch (e) { }

    expect(orm.User.name).toBe('User');

    try {
      await orm.User.create({
        name: 'max',
        birthDate: new Date,
        cart: []
      }, {
        username: 'max',
        password: 'sadasdasd'
      });
    } catch (e) { }

    try {
      await orm.User.update({
        cart: [
          (await orm.Products.get(0)).result!
        ]
      });
    } catch (e) { }

    try {
      await orm.User.delete();
    } catch (e) { }

    expect(typeof orm.Broken.name).toBe('string');
    expect(orm.Broken.name).toBe('Broken');

    expect(await orm.Broken.API.create()).toMatchObject(new Broken());
  });
});
