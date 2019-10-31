export default class Charge {
    constructor() {
        this.content = null;
        this.left = null;
    }

    setData(options) {
        const { content, left } = options;
        this.content = content;
        this.left = left;
    }
}