class RefLink {
    constructor(link) {
        this.link = link;
        
        if(this.link[0]) {
            let mid = this.link[0];
            let source = {};
            switch(mid[0]) {
                case "$": {
                    source.value = mid.slice(1);
                    source.type = "state";
                    break;
                }
                case "#": {
                    source.value = mid.slice(1);
                    source.type = "tag";
                    break;
                }
                default: {
                    source.value = mid
                    source.type = "source";
                }
            }
            this.source = source;
        }
    }
    get type() {
        switch(this.link.length) {
            case 3: {
                return "permlink"
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
    toString() {
        return this.link.join("/")
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