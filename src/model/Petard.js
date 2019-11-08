export default class Petard {
    constructor() {
        this.content = null;
        this.left = null;
        this.key = null;
    }

    setData(options) {
        const { content, left, key } = options;
        this.content = content;
        this.left = left;
        this.key = key;
    }
}
