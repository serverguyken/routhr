"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = void 0;
const uuid_1 = require("uuid");
const generateId = () => {
    return 'ru' + (0, uuid_1.v4)().substring(0, 4);
};
exports.generateId = generateId;
