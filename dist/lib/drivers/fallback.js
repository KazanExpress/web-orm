"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
/* TODO: driver that just writes everything to short-term memory */
class FallbackDriver extends base_1.Driver {
    constructor() {
        super(...arguments);
        this.repositoryMap = {};
    }
    create(repository, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.repositoryMap[repository.name] = this.repositoryMap[repository.name] || [];
            this.repositoryMap[repository.name].push(data);
            return data;
        });
    }
    read(repository, id) {
        throw new Error('Method not implemented.');
    }
    update(repository, id, query) {
        throw new Error('Method not implemented.');
        return Promise.resolve();
    }
    delete(repository, entity) {
        const idx = this.repositoryMap[repository.name].findIndex(e => Object.keys(e).some(key => {
            return e[key] === entity[key];
        }));
        const res = this.repositoryMap[repository.name][idx];
        this.repositoryMap[repository.name].splice(idx, 1);
        return res;
    }
}
exports.FallbackDriver = FallbackDriver;
//# sourceMappingURL=fallback.js.map