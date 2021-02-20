import { existsSync,
    statSync,
    unlinkSync,
    readFileSync,
    writeFileSync,
    mkdirSync } from 'fs';
const cheerio = require('cheerio');
import { join } from 'path';
import got from 'got';
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

    public async request(): Promise<ParsedAnswer> {
        if (this.cacheManager.hasCachedFile(this.filename)) {
            console.warn(`getting ${this.simpleUrl} from cache`);
            const cache = this.cacheManager.getCachedFile(this.filename);
            return new ParsedAnswer(this.url, cache);
        }

        console.warn(`Requesting: ${this.simpleUrl}`);
        const body = await got.get(this.url).text();
        this.cacheManager.addFile(this.filename, body);
        return new ParsedAnswer(this.url, body);
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
        this.folderPath = nullablePath || 'request_cache';
        this.ensureDirSync();
    }

    private getFilePath (filename: string): string {
        return join(this.folderPath, filename);
    }

    private hasFile (filename: string): boolean {
        const path = this.getFilePath(filename);
        return existsSync(path) && statSync(path).isFile();
    }

    private getFileAge (filename: string): number {
        const now = new Date().getTime() / 1000 / 60;
        const fileTime = statSync(this.getFilePath(filename)).mtime.getTime() / 1000 / 60;
        return now - fileTime;
    }

    private invalidCache (filename: string) {
        unlinkSync(this.getFilePath(filename));
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
        return readFileSync(this.getFilePath(filename), "utf8");
    }

    public addFile (filename: string, body: any) {
        writeFileSync(this.getFilePath(filename), body);
    }

    private ensureDirSync() {
        try {
            return mkdirSync(this.folderPath, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }
}
