export function getText (element: CheerioElement): string {
    if (element === undefined)
        return '';

    if (element.type == 'text' && element.nodeValue != null)
        return element.nodeValue.trim();

    return element.children.map(node => getText(node)).join('\n');
}