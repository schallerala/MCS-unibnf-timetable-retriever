import LinkString from "../LinkString";

export default class CourseFinderLink {
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