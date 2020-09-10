export default class CourseDetails {
    public readonly code: string;
    public readonly tracks: string;
    public readonly shortTracks: string;
    constructor (code: string, readonly type: string, readonly site: string, tracks: string) {
        this.code = code.split('\n').filter(c => c.length > 0).join('/');
        this.tracks = tracks.split('\n').filter(c => c.length > 0).join(' & ');
        this.shortTracks = tracks.split('\n').filter(c => c.length > 0).map(t => t.substring(0, 2)).join(' & ');
    }
}