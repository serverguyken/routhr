export default class Message {
    constructor() {
    }
    create(...message: string[]): void {
        console.log(...message);
    }
    error(message: string): void {
        throw new Error(message);
    }
} 