const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');
import RequestPage from "./models/RequestPage";
import { getText } from './models/cheerioHelpers';
import LinkString from './models/LinkString';

const courseListPage = "https://mcs.unibnf.ch/program/courses-timetable/course-finder/";

const courseFinderPage = new RequestPage(courseListPage);

export async function getCoursesDescriptions (): Promise<Array<CourseFinderLink>> {
    const page = await courseFinderPage.request();
    return page.$('tr:nth-child(n+2)') // skip header row, as it isn't un a thead tag
        .map((index: number, rowElement: CheerioElement) => eachCourseRow(rowElement))
        .get() as Array<CourseFinderLink>;
}

let args;
if ((args = process.argv.slice(1))) {
    const [ target ] = args;
    if (target.includes(__filename.substring(0, __filename.lastIndexOf('.')))) {
        getCoursesDescriptions()
            .then(links => new ObjectsToCsv(links).toString(true, true))
            .then(csvString => console.log(csvString));
    }
}

function eachCourseRow (rowElement: CheerioElement) {
    const $ = cheerio.load(rowElement);
    const rowCells = $('td');
    const lecturers: LinkString[] = cheerio.load(rowCells[2])('a')
        .map((index: number, lecturerElement: CheerioElement) => new LinkString(lecturerElement))
        .get();

    return new CourseFinderLink(
        getText(rowCells[0]).split('\n').filter(c => c.length > 0),
        new LinkString(rowCells[1].firstChild),
        lecturers,
        getText(rowCells[3])
    );
}

export class CourseFinderLink {
    public readonly codes: string;
    public readonly courseName: string;
    public readonly courseLink: string;
    public readonly teachers: string;
    constructor (codes: string[], courseLinkString: LinkString, teachers: LinkString[], readonly semester: string) {
        this.codes = codes.join('/');
        this.courseName = courseLinkString.text;
        this.courseLink = courseLinkString.link;
        this.teachers = teachers.map(t => t.text).join(' & ');
    }
}
