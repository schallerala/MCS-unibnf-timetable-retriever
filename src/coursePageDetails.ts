export class CourseDetails {
    public readonly code: string;
    public readonly tracks: string;
    public readonly shortTracks: string;
    constructor (code: string, readonly type: string, readonly site: string, tracks: string) {
        this.code = code.split('\n').filter(c => c.length > 0).join('/');
        this.tracks = tracks.split('\n').filter(c => c.length > 0).join(' & ');
        this.shortTracks = tracks.split('\n').filter(c => c.length > 0).map(t => t.substring(0, 2)).join(' & ');
    }
}


const weekDayIndex = {
    "mon": 0,
    "tue": 1,
    "wed": 2,
    "thu": 3,
    "fri": 4,
    "sat": 5,
    "sun": 6
}


export class ScheduleDetails {
    constructor (readonly period: string, readonly schedule: string, readonly location: string, readonly room: string) {}

    isOnAppointment (): boolean {
        return this.period.toLowerCase().includes("on appointment");
    }

    getWeekDayIndex (): number {
        if (this.isOnAppointment())
            return 8;

        const shortWeekDay = this.schedule.substring(0, 3).toLowerCase();
        return weekDayIndex[shortWeekDay];
    }

    getTimes (): string {
        if (this.isOnAppointment())
            return this.period;

        let times = this.schedule.match(/(\d{1,2}:\d{1,2})[^\d]*(\d{1,2}:\d{1,2})/);
        return `${times[1]} - ${times[2]}`;
    }
}


export class TeachingDetails {
    constructor (readonly lecturers: string, readonly coursePage: string) {}
}
