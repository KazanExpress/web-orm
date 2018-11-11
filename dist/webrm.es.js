const LOG_PREFIX = (name) => name ? `[WebRM:${name}]` : `[WebRM]`;
class Debug {
    constructor() { }
    /**
     * `true` if any debug is enabled
     */
    static get isEnabled() { return this.debugState !== 'disabled'; }
    /**
     * Shows the current debug state of WebRM
     *
     * - `enabled` - all the logs and exceptions are enabled
     * - `custom` - custom rules are set via a `debug()` function
     * - `disabled` - all the logs and most exceptions are suppressed
     */
    static get state() { return this.debugState; }
    static set state(v) { this.debugState = v; }
    static error(instanceName, type, message) {
        return this.print(instanceName, type, message, 'error');
    }
    static log(instanceName, type, message) {
        return this.print(instanceName, type, message, 'log');
    }
    static warn(instanceName, type, message) {
        return this.print(instanceName, type, message, 'warn');
    }
    static errorType(type) {
        if (this.map['*']) {
            return true;
        }
        const isString = (t) => typeof t === 'string';
        if (isString(type) && this.map[type]) {
            return this.map[type];
        }
        if (isString(type)) {
            const matchingType = Object.keys(this.map)
                .find(t => !!t && t.includes(type) && !!this.map[t]);
            return matchingType || false;
        }
        return Object.keys(this.map).find(t => type.test(t)) || false;
    }
    static print(instanceName, type, message, level) {
        if (this.debugState !== 'disabled') {
            const typeOfError = this.errorType(type);
            if (typeOfError) {
                if (typeOfError === 'hard' && level === 'error') {
                    throw new Error(`${LOG_PREFIX(instanceName)}:${type} - ${message}`);
                }
                else {
                    console[level](`%c${LOG_PREFIX(instanceName)}%c:%c${type}%c - ${message}`, 'color: purple', 'color: initial', 'color: blue', 'color: initial');
                }
            }
        }
    }
    static prints(message, level = 'log', type = '*') {
        return (target, key, desc) => {
            Object.defineProperty(this.decoratedLogs, key, desc || {
                value: undefined,
                writable: true,
                enumerable: true
            });
            Object.defineProperty(target, key, {
                get: () => {
                    this.print('', type, message, level);
                    return this.decoratedLogs[key];
                },
                set: v => {
                    this.decoratedLogs[key] = v;
                }
            });
        };
    }
}
Debug.debugState = 'disabled';
/**
 * Contains the map for all debug types and their respective error types for the ORM.
 */
Debug.map = {};
Debug.decoratedLogs = {};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Driver {
    constructor(connection) {
        this.connection = connection;
    }
    /**
     * Determines if the driver is supported in current environment
     */
    static get isSupported() {
        throw new Error('Not implemented.');
    }
}

class FallbackDriver extends Driver {
    create(repositoryName, entity) {
        throw new Error('Method not implemented.');
    }
    read(repositoryName, id) {
        throw new Error('Method not implemented.');
    }
    update(repositoryName, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
            return {};
        });
    }
    delete(repositoryName, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
            return {};
        });
    }
}

/**
 * @TODO:
 * - Async API MAP crap for handling QueryResults
 */
class Repository {
    constructor(name, connection, Data) {
        this.name = name;
        this.connection = connection;
        this.Data = Data;
        if (
        // If this class was instantiated directly (without inheritance)
        Repository.prototype === this.constructor.prototype
            // And set debug for db:[name]
            && Debug.map[`db:${name}`]) {
            Debug.warn(connection.name, `db:${name}`, `Using default empty repository for ${name}`);
        }
    }
}

/**
 * Incapsulates the query result data for further manipulation
 *
 * @template T the type of data encapsulated
 */
class QueryResult {
    constructor(ok, result, error) {
        this.error = error;
        this.handlers = [];
        this._ok = ok;
        let promise;
        if (typeof result === 'function') {
            promise = new Promise(result);
        }
        else {
            promise = result;
        }
        this._result = promise;
    }
    /**
     * Determines whether the incapsulated data is OK and contains no errors
     */
    get ok() { return this._ok; }
    /**
     * The resulting data of the query request
     */
    get result() { return this._result; }
    set result(value) {
        this._result = value;
        this.handlers.forEach((h) => __awaiter(this, void 0, void 0, function* () { return h(); }));
    }
    /**
     * Fires a handler whenever the data in the result has been changed
     *
     * @param callback the callback to fire
     */
    onChange(callback) {
        this.handlers.push(callback);
    }
    /**
     * Unsubscribe the callback from the result data changes
     */
    offChange(callback) {
        const idx = this.handlers.indexOf(callback);
        if (idx > -1) {
            this.handlers.splice(idx, 1);
        }
    }
}

class EntityRepository extends Repository {
    constructor(name, connection, entity) {
        super(name, connection, entity);
        this.primaryKey = entity.prototype.__id__;
        this.columns = Object.keys(entity.prototype.__col__);
        delete entity.prototype.__col__;
    }
    add(options) {
        return new QueryResult(true, Promise.resolve(new this.Data(options)));
    }
    get(id) {
        return new QueryResult(true, Promise.resolve(new this.Data({})));
    }
    update(options) {
        return new QueryResult(true, Promise.resolve(new this.Data({})));
    }
    updateById(id, query) {
        return new QueryResult(true, Promise.resolve(new this.Data({})));
    }
    delete(id) {
        return new QueryResult(true, Promise.resolve(new this.Data({})));
    }
}

/**
 * fromPath
 * Returns a value from an object by a given path (usually string).
 *
 * https://gist.github.com/Raiondesu/759425dede5b7ff38db51ea5a1fb8f11
 *
 * @param obj an object to get a value from.
 * @param path to get a value by.
 * @param splitter to split the path by. Default is '.' ('obj.path.example')
 * @returns a value from a given path. If a path is invalid - returns undefined.
 */
function NonEnumerable(target, key, desc = {}) {
    Object.defineProperty(target, key, Object.assign({}, desc, { 
        // TODO: check to be writable
        enumerable: false }));
}

class Entity {
    constructor(options) {
        // TODO: check to be writable
        this.__col__ = [];
        if (this.__idCol__) {
            this.__idValue__ = options[this.__idCol__];
        }
    }
    $save() {
        return Promise.resolve();
    }
    $delete() {
        return Promise.resolve();
    }
    static Column(target, key) {
        target.__col__.push(key);
    }
    static ID(target, key) {
        target.__idCol__ = key;
    }
}
__decorate([
    NonEnumerable,
    __metadata("design:type", Array)
], Entity.prototype, "__col__", void 0);
__decorate([
    NonEnumerable,
    __metadata("design:type", Object)
], Entity.prototype, "__idCol__", void 0);
__decorate([
    NonEnumerable,
    __metadata("design:type", Object)
], Entity.prototype, "__idValue__", void 0);
const Column = Entity.Column;
const ID = Entity.ID;

class Record {
    $save() {
        throw new Error('Method not implemented.');
    }
    $delete() {
        throw new Error('Method not implemented.');
    }
}

class RecordRepository extends Repository {
    create(options) {
        return new QueryResult(true, Promise.resolve(new this.Data(options)));
    }
    update(options) {
        return new QueryResult(true, Promise.resolve(new this.Data(options)));
    }
    read() {
        return new QueryResult(true, Promise.resolve(new this.Data({})));
    }
    delete() {
        return new QueryResult(true, Promise.resolve(new this.Data({})));
    }
}

function makeRepository(name, connection, data) {
    if (data.prototype instanceof Entity) {
        return new EntityRepository(name, connection, data);
    }
    else if (data.prototype instanceof Record) {
        return new RecordRepository(name, connection, data);
    }
    else {
        Debug.error(connection.name, 'db', `No suitable repository found for ${data.name} when trying to connect with ${name}.`);
        return new Repository(name, connection, data);
    }
}

class Connection {
    /**
     * Creates a WebRM connection instance.
     * @param name the name of the connection to the storage. Namespaces all respositories invoked from the instance.
     * @param drivers determine a variety of drivers the orm can select from. The first one that fits for the environment is selected.
     * @param repositories sets the relation of a repository name to its contents' prototype.
     * @param apiMap maps the API calls onto the current entity structure
     */
    constructor(name, drivers, repositories, apiMap) {
        this.name = name;
        this.drivers = drivers;
        this.apiMap = apiMap;
        /**
         * A current map of bound repositories
         */
        this.repositories = {};
        // Select the first supported driver from the bunch
        const SupportedDriver = drivers.find(d => d.isSupported);
        if (SupportedDriver) {
            // TODO: multi-driver mode
            Debug.log(this.name, 'orm', `Using driver "${SupportedDriver.name}" as the first supported driver`);
            this.currentDriver = new SupportedDriver(this);
        }
        else {
            Debug.warn(this.name, 'orm', 'No supported driver provided. Using fallback.');
            this.currentDriver = new FallbackDriver(this);
        }
        let reProxy;
        if (!Proxy) {
            Debug.warn(this.name, 'orm', `window.Proxy is unavailable. Using insufficient property forwarding.`);
            reProxy = (repoName) => Object.defineProperty(this, repoName, {
                get: () => this.repositories[repoName],
            });
        }
        for (const repoName in repositories) {
            const entityConstructor = repositories[repoName];
            this.repositories[repoName] = makeRepository(repoName, this, entityConstructor);
            reProxy && reProxy(repoName);
        }
        if (Proxy) {
            Debug.log(this.name, 'orm', `window.Proxy is available. Using modern property forwarding.`);
            return new Proxy(this, {
                get(target, key) {
                    if (!target.repositories[key]) {
                        if (!target[key]) {
                            Debug.log(target.name, 'orm', `Repository "${key}" is not registered upon initialization. No other property with the same name was found.`);
                        }
                        return target[key];
                    }
                    return target.repositories[key];
                }
            });
        }
    }
    static debug(type, exceptions) {
        if (typeof type === 'boolean') {
            Debug.state = (type ? 'enabled' : 'disabled');
        }
        else {
            Debug.state = ('custom');
            Debug.map[type] = exceptions || !Debug.map[type];
        }
    }
}

const Connection$1 = Connection;

export { Connection$1 as Connection, Entity, Column, ID, Record };
//# sourceMappingURL=webrm.es.js.map