const path = /(?:\w+:)?\/\/[^\/]+([^?]+)/;
const query = /\?(.*)/;

export class URLParser {
    /**
     * Get path from url
     * @param url 
     */
    static path(url: string) {
        return path.exec(url)[1] as string;
    }

    /**
     * Get query from url
     * @param url 
     */
    static query(url: string): URLSearchParams | undefined {
        const q = query.exec(url);
        return q && new URLSearchParams(q[1]);
    }
}