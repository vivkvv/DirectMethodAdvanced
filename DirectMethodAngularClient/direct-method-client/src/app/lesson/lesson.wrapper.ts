export class LessonItem {
    start: number;
    duration: number;
    person: string;
    text: string;
    image: string;
    translation: string;

    constructor(item: Element, translation: string) {
        const startAttribute = item.getAttribute('start');
        const durationAttribute = item.getAttribute('duration');
        this.start = startAttribute ? parseFloat(startAttribute) : 0;
        this.duration = durationAttribute ? parseFloat(durationAttribute) : 0;
        this.person = item.getElementsByTagName('person')[0]?.textContent || '';
        this.text = item.getElementsByTagName('text')[0]?.textContent || '';
        this.image = item.getElementsByTagName('image')[0]?.textContent || '';
        this.translation = translation;
    }
}
