import cheerio from 'cheerio';
const ObjectsToCsv = require('objects-to-csv');
import RequestPage from "./src/RequestPage";
import CourseDescription from './src/finder/CourseFinderLink';
import { getText } from './src/Parser';
import LinkString from './src/LinkString';

const courseListPage = "https://mcs.unibnf.ch/program/courses-timetable/course-finder/";

const courseFinderPage = new RequestPage(courseListPage);

function eachCourseRow (rowElement: CheerioElement) {
    const $ = cheerio.load(rowElement);
    const rowCells = $('td');
    const lecturers: LinkString[] = cheerio.load(rowCells[2])('a')
        .map((index: number, lecturerElement: CheerioElement) => new LinkString(lecturerElement))
        .get();
    return new CourseDescription(
        getText(rowCells[0]).split('\n').filter(c => c.length > 0),
        new LinkString(rowCells[1].firstChild),
        lecturers,
        getText(rowCells[3])
    );
}

(async function () {
    try {
        const page = await courseFinderPage.request();
        const coursesDescriptions = page.$('tr:nth-child(n+2)') // skip header row, as it isn't un a thead tag
            .map((index: number, rowElement: CheerioElement) => eachCourseRow(rowElement))
            .get();

        console.log(await new ObjectsToCsv(coursesDescriptions).toString(true, true));
    } catch (e) {
        console.error(e);
    }
})();