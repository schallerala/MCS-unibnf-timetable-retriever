import { getText } from './cheerioHelpers';

export default class LinkString {

    public readonly link: string;
    public readonly text: string;

    constructor (element: CheerioElement) {
        if (element.tagName != 'a')
            throw new Error("Not an anchor");

        this.link = element.attribs['href'];
        this.text = getText(element);
    }
}
