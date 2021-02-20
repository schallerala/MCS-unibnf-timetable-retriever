import * as cheerio from 'cheerio';

export function getText (element: CheerioElement): string {
    if (element === undefined)
        return '';

    if (element.type == 'text' && element.nodeValue != null)
        return element.nodeValue.trim();

    return element.children.map(node => getText(node)).join('\n').trim();
}


// const dummyRoot = cheerio.load('');
// export type CheerioRoot = ReturnType<typeof cheerio.load>;
// export type Cheerio = ReturnType<typeof dummyRoot.root>;
// export type CheerioElement = Parameters<typeof dummyRoot.contains>[0];
