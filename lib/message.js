"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Message {
    constructor() {
    }
    create(...message) {
        console.log(...message);
    }
    error(message) {
        throw new Error(message);
    }
}
exports.default = Message;
