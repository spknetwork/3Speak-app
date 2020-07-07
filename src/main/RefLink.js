class RefLink {
    constructor(link) {
        this.link = link;
    }
    get type() {
        switch(this.link.length) {
            case 3: {
                return "post"
            }
            case 2: {
                return "root"
            }
            case 1: {
                return "source"
            }
        }
    }
    get permlink() {
        return this.link[2];
    }
    get root() {
        return this.link[1];
    }
    get source() {
        return this.link[0];
    }
    toString() {
        return this.link.join("/");
    }
    static isValid(link) {
        try {
            RefLink.parse(link);
            return true;
        } catch {
            return false;
        }
    }
    static parse(link) {
        if(typeof link !== "string") {
            throw new Error("Invalid reflink");
        }
        link = link.split("/");
        return new RefLink(link);
    }
}
export default RefLink