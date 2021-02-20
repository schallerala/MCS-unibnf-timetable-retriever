import pMap = require('p-map');
const ObjectsToCsv = require('objects-to-csv');

import {getCoursesDescriptions} from './get-courses-pages-from-finder';
import {flatDetails, getCoursePageDetails} from './get-course-schedule';

const [ semesterFilter ] = process.argv.slice(2);

(async function (semesterFilter: string) {
    const semesterCoursesLink = (await getCoursesDescriptions())
        .filter(({ semester }) => semester.includes(semesterFilter));

    // concurrently parse the course pages
    const semesterCoursesDetails =
        (await pMap(semesterCoursesLink, async ({ courseLink }) => {
            return await getCoursePageDetails(courseLink);
        }, { concurrency: 5, stopOnError: false }))
        // sort schedules
        .sort((d1, d2) => {
            return d1.scheduleDetails.getWeekDayIndex() - d2.scheduleDetails.getWeekDayIndex()
                || d1.scheduleDetails.getTimes().localeCompare(d2.scheduleDetails.getTimes());
        })
        .map(flatDetails);

    console.log(await new ObjectsToCsv(semesterCoursesDetails).toString(false));

})(semesterFilter);
