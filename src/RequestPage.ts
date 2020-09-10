import request from 'request';
import fs from 'fs';
import cheerio from 'cheerio';
import path from 'path';
const md5 = require('md5');

export default class RequestPage {

    private readonly cacheManager: RequestCacheManager;
    private readonly filename: string;
    private readonly simpleUrl: string;

    constructor(private readonly url: string) {
        this.cacheManager = new RequestCacheManager();
        this.filename = `${md5(url)}.html`;
        this.simpleUrl = this.url.replace(/.+\?/, '');
    }

    public request(): Promise<ParsedAnswer> {
        if (this.cacheManager.hasCachedFile(this.filename)) {
            console.warn(`getting ${this.simpleUrl} from cache`);
            const cache = this.cacheManager.getCachedFile(this.filename);
            return Promise.resolve(new ParsedAnswer(this.url, cache));
        }

        return new Promise<ParsedAnswer>((resolve, reject) => {
            const callback = (error: any, response: any, body: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                this.cacheManager.addFile(this.filename, body);
                resolve(new ParsedAnswer(this.url, body));
            };

            console.warn(`Requesting: ${this.simpleUrl}`);
            request.get(this.url, callback);
        });
    }
}

export class ParsedAnswer {

    readonly $: CheerioStatic;

    constructor(readonly url: string, readonly body: any) {
        this.$ = cheerio.load(body);
    }
}


class RequestCacheManager {

    public static MINUTE_AGE: number = 240; // 4 hours

    private folderPath: string;

    constructor(nullablePath?: string) {
        this.folderPath = nullablePath || path.join(__dirname, 'request_cache');
        this.ensureDirSync();
    }

    private getFilePath (filename: string): string {
        return path.join(this.folderPath, filename);
    }

    private hasFile (filename: string): boolean {
        const path = this.getFilePath(filename);
        return fs.existsSync(path) && fs.statSync(path).isFile();
    }

    private getFileAge (filename: string): number {
        const now = new Date().getTime() / 1000 / 60;
        const fileTime = fs.statSync(this.getFilePath(filename)).mtime.getTime() / 1000 / 60;
        return now - fileTime;
    }

    private invalidCache (filename: string) {
        fs.unlinkSync(this.getFilePath(filename));
    }

    public hasCachedFile (filename: string): boolean {
        if ( ! this.hasFile(filename))
            return false;

        if (this.getFileAge(filename) < RequestCacheManager.MINUTE_AGE)
            return true;

        this.invalidCache(filename);
        return false;
    }

    public getCachedFile (filename: string): string {
        return fs.readFileSync(this.getFilePath(filename), "utf8");
    }

    public addFile (filename: string, body: any) {
        fs.writeFileSync(this.getFilePath(filename), body);
    }

    private ensureDirSync() {
        try {
            return fs.mkdirSync(this.folderPath);
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }
}