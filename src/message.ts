export default class Message {
    silent: boolean;
    constructor(silent: boolean) {
        this.silent = silent;
    }
    create(...message: string[]): void {
        if (!this.silent) {
            console.log(...message);
        }
    }
}