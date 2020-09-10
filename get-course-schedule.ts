import RequestPage from "./src/RequestPage";
const ObjectsToCsv = require('objects-to-csv');
import { getText } from "./src/Parser";
import ScheduleDetails from "./src/details/ScheduleDetails";
import CourseDetails from "./src/details/CourseDetails";

var myArgs = process.argv.slice(2);
if (myArgs.length < 1)
    throw new Error("missing link argument");

const courseLink = myArgs[0];
console.warn(`Looking for schedule on link: ${courseLink}`);

function getTableDetails ($: CheerioStatic, prefixHeaderText: string): string[] {
    return $(`h2:contains("${prefixHeaderText}")`).next('table').find('td:nth-child(2)').map((index: number, cellElement: CheerioElement) => getText(cellElement)).get();
}

(async function () {
    const page = await new RequestPage(courseLink).request();

    const courseName = page.$('h1').text();

    const courseDetailsArray = getTableDetails(page.$, "Details");
    const courseDetails = new CourseDetails(courseDetailsArray[0], courseDetailsArray[1], courseDetailsArray[3], courseDetailsArray[4]);
    const scheduleDetailsArray = getTableDetails(page.$, "Schedules and Rooms");
    const scheduleDetails = new ScheduleDetails(scheduleDetailsArray[0], scheduleDetailsArray[1], scheduleDetailsArray[2], scheduleDetailsArray[3]);

    const details = {
        courseName,
        courseLink
    };
    for (const [key, value] of Object.entries(courseDetails)) {
        details[key] = value;
    }
    for (const [key, value] of Object.entries(scheduleDetails)) {
        details[key] = value;
    }
    console.log(await new ObjectsToCsv([details]).toString(false));
})();