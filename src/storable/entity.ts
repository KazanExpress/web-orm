import { IStorable } from './istorable';

export class Entity implements IStorable {
  constructor(options) {
    
  }

  public repository;

  public $save() {
    return Promise.resolve();
  }

  public $delete() {
    return Promise.resolve();
  }
}