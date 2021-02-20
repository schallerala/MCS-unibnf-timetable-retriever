import RequestPage from "./models/RequestPage";
const ObjectsToCsv = require('objects-to-csv');
import { getText } from "./models/cheerioHelpers";
import {CourseDetails, ScheduleDetails, TeachingDetails} from './coursePageDetails';

/**
 * Get table with parameter header and get all the values on the right part.
 */
function getTableDetails ($: CheerioStatic, prefixHeaderText: string): string[] {
    return $(`h2:contains("${prefixHeaderText}")`)
        .next('table')
        .find('td:nth-child(2)')
        .map((index: number, cellElement: CheerioElement) => getText(cellElement))
        .get();
}

function getTableMapValues ($: CheerioStatic, prefixHeaderText: string): TableMapValues {
    const entries = $(`h2:contains("${prefixHeaderText}")`)
        .next('table')
        .find('tr')
        .map(((index, element) => {
            const rowCells = $(element).find('td');
            return [getText(rowCells[0]), getText(rowCells[1])];
        })).get() as Array<string>;

    const mapValues = new Array<[string, string]>();
    for (let i = 0; i < entries.length; i += 2) {
        mapValues.push([entries[i], entries[i+1]]);
    }

    return new TableMapValues(mapValues);
}

function caseInsensitiveStringInclude (include: string): (string) => boolean {
    return str => str.toLowerCase().includes(include.toLowerCase());
}

export async function getCoursePageDetails (courseLink: string): Promise<CourseCompleteDetails> {
    const page = await new RequestPage(courseLink).request();

    const courseName = page.$('h1').text();

    const courseDetailsArray = getTableDetails(page.$, "Details");
    const courseDetails = new CourseDetails(courseDetailsArray[0], courseDetailsArray[1], courseDetailsArray[3], courseDetailsArray[4]);
    const teachingMap = getTableMapValues(page.$, "Teaching");

    let teacherFields = teachingMap.getEntryByKey(caseInsensitiveStringInclude('lecturer'))[1];
    const teachers = teacherFields.split('\n').filter(value => value.trim()).map(teacher => teacher.trim()).join(' & ');
    let potentialIliasDescription = teachingMap.getValueByKey(caseInsensitiveStringInclude('ilias.unibe.ch'));
    if ( ! potentialIliasDescription)
        console.warn('No ilias link for', courseLink);
    const ilias = !! potentialIliasDescription
        ? potentialIliasDescription[1].match(/\b.*ilias\.unibe\.ch.*\b/)[0]
        : null;

    const teachingDetails = new TeachingDetails(teachers, ilias);
    const scheduleDetailsArray = getTableDetails(page.$, "Schedules and Rooms");
    const scheduleDetails = new ScheduleDetails(scheduleDetailsArray[0], scheduleDetailsArray[1], scheduleDetailsArray[2], scheduleDetailsArray[3]);

    return {
        courseName,
        courseLink,
        courseDetails,
        teachingDetails,
        scheduleDetails
    };
}

export function flatDetails ({ courseName, courseLink, courseDetails, teachingDetails, scheduleDetails }: CourseCompleteDetails): object {
    const r = {
        courseName, courseLink
    };

    return Object.assign(r, courseDetails, teachingDetails, scheduleDetails);
}

let args;
if ((args = process.argv.slice(1))) {
    const [ target, courseLink ] = args;
    if (target.includes(__filename.substring(0, __filename.lastIndexOf('.')))) {
        console.warn(`Looking for schedule on link: ${courseLink}`);
        getCoursePageDetails(courseLink)
            .then(details => new ObjectsToCsv([flatDetails(details)]).toString(false))
            .then(csvObjectString => console.log(csvObjectString));
    }
}

export interface CourseCompleteDetails {
    courseName: string,
    courseLink: string,
    courseDetails: CourseDetails,
    teachingDetails: TeachingDetails,
    scheduleDetails: ScheduleDetails
}


class TableMapValues extends Map<string, string> {

    constructor(entries: [string, string][]) {
        super(entries);
    }

    getEntryByKey (predicate: (string) => boolean): [string, string] {
        return Array.from(this.entries()).find(([key]) => predicate(key));
    }

    getValueByKey (predicate: (string) => boolean): [string, string] {
        return Array.from(this.entries()).find(([key, value]) => predicate(value));
    }
}
