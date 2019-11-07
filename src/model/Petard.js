export default class Petard {
    constructor() {
        this.content = null;
        this.left = null;
        this.boom = false;
    }

    setData(options) {
        const { content, left } = options;
        this.content = content;
        this.left = left;
    }
}
