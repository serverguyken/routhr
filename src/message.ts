export default class Message {
    constructor() {
    }
    create(...message: string[]): void {
        console.log(...message);
    }
}