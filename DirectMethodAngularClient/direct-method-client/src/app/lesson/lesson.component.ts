import { Component, OnInit } from '@angular/core';
import { EntityService, IEntity } from '../services/entity.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../loading.service';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, first, isEmpty, tap } from 'rxjs/operators';
import { LessonItem } from './lesson.wrapper';
import { Observable, forkJoin, of } from 'rxjs';

class TSelectedKey {
    constructor(public id: number = -1, public person: string = '') {}
}

interface Lesson {
    nextPart: string;
    nextLesson: string;
}

@Component({
    selector: 'app-lesson',
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.css'],
})
export class LessonComponent implements OnInit {
    title = 'DirectMethod';
    audio!: HTMLAudioElement;
    lessonItemsDict: { [key: string]: LessonItem[] } = {};
    selectedKey: string = '0:Teacher'; //ISelectedKey = { id: 0, person: '' };
    lesson: number = -1;
    part: number = -1;
    isPlaying: boolean = false;

    private lessonID: string = '';
    private partID: string = '';

    private stringToISelectedKey(value: string): TSelectedKey {
        const parts = this.selectedKey.split(';');
        return new TSelectedKey(parseInt(parts[0]), parts[1]);
    }
    private SelectedKeyToString(value: TSelectedKey) {
        return value.id + ';' + value.person;
    }

    setActiveKey(key: string) {
        this.selectedKey = key;
        this.updateGUIDueToSelectedKey();
    }

    onValueChanged(value: string) {
        this.setActiveKey(value);
    }

    private _questionEntity: IEntity = new IEntity();
    public get questionEntity(): IEntity {
        return this._questionEntity;
    }
    public set questionEntity(value: IEntity) {
        this._questionEntity = value;
    }

    private _answerEntity: IEntity = new IEntity();
    public get answerEntity(): IEntity {
        return this._answerEntity;
    }
    public set answerEntity(value: IEntity) {
        this._answerEntity = value;
    }

    // Переменная для хранения setInterval
    private checkTimeInterval: ReturnType<typeof setInterval> | undefined;

    public onPlay() {
        if (!this.audio) {
            return;
        }

        if (this.isPlaying) {
            if (this.checkTimeInterval) {
                clearInterval(this.checkTimeInterval);
                this.checkTimeInterval = undefined;
            }

            this.audio.pause();
            this.isPlaying = false;
            return;
        }

        const currentKey: TSelectedKey = this.stringToISelectedKey(
            this.selectedKey
        );
        const lessons: LessonItem[] = this.lessonItemsDict[currentKey.id];
        const lesson: LessonItem[] = lessons.filter(
            (item) => item.person == currentKey.person
        );

        if (!lesson) {
            return;
        }

        const episode = lesson[0];

        this.audio.currentTime = episode.start;
        this.isPlaying = true;
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then((_) => {
                    this.checkTimeInterval = setInterval(() => {
                            if (
                            this.audio.currentTime >=
                            episode.start + episode.duration
                        ) {
                            this.audio.pause();
                            this.isPlaying = false;
                            clearInterval(this.checkTimeInterval);
                            this.checkTimeInterval = undefined;
                        }
                    }, 50); // 50 milliseconds
                })
                .catch((error) => {
                    console.log('Playback error detected', error);
                    this.isPlaying = false;
                });
        }

        this.audio.onended = () => {
            this.isPlaying = false;
        };
    }

    public updateGUIDueToSelectedKey() {
        const iKey = this.stringToISelectedKey(this.selectedKey);

        const lessons = this.lessonItemsDict[iKey.id];
        const teacher = lessons.find((item) => item.person === 'Teacher');
        let student: LessonItem | undefined = undefined;
        if (iKey.person === 'Student') {
            student = lessons.find((item) => item.person === 'Student');
        }

        if (teacher) {
            this.questionEntity = {
                sourceText: teacher.text,
                translatedText: teacher.translation,
                imageUrl: teacher.image,
            };
        }

        if (student) {
            this.answerEntity = {
                sourceText: student.text,
                translatedText: student.translation,
                imageUrl: student.image,
            };
        } else {
            this.answerEntity = {
                sourceText: '',
                translatedText: '',
                imageUrl: '',
            };
        }
    }

    gotoPreviousLesson() {
        this.http
            .get<Lesson>(
                `/api/prev.lesson?part=${this.partID}&lesson=${this.lessonID}`
            )
            .pipe(first())
            .subscribe((data) => {
                this.fetchLessonData(data.nextPart, data.nextLesson);
            });
    }

    gotoNextLesson(): void {
        this.http
            .get<Lesson>(
                `/api/next.lesson?part=${this.partID}&lesson=${this.lessonID}`
            )
            .pipe(first())
            .subscribe((data) => {
                this.fetchLessonData(data.nextPart, data.nextLesson);
            });
    }

    private getPreviousKey(): string {
        const iKey: TSelectedKey = this.stringToISelectedKey(this.selectedKey);

        const lessons = this.lessonItemsDict[iKey.id];
        const ind = lessons.findIndex((item) => item.person === iKey.person);
        if (ind == 0) {
            if (iKey.id === 0) {
                const keys = Object.keys(this.lessonItemsDict);
                const lastKey = keys[keys.length - 1];
                const lastLessons: LessonItem[] = this.lessonItemsDict[lastKey];
                const lesson: LessonItem = lastLessons[lastLessons.length - 1];
                iKey.id = parseInt(lastKey);
                iKey.person = lesson.person;
            } else {
                iKey.id -= 1;
                const lessonItems: LessonItem[] = this.lessonItemsDict[iKey.id];
                iKey.person = lessonItems[lessonItems.length - 1].person;
            }
        } else {
            iKey.person = lessons[ind - 1].person;
        }

        return this.SelectedKeyToString(iKey);
    }

    private getNextKey(): string {
        const iKey: TSelectedKey = this.stringToISelectedKey(this.selectedKey);

        const lessons = this.lessonItemsDict[iKey.id];
        const ind = lessons.findIndex((item) => item.person === iKey.person);
        if (ind < 0 || ind >= lessons.length - 1) {
            // if this element is the last
            // we have to go the next element and it has to be 'Teacher'
            iKey.id += 1;
            iKey.person = 'Teacher';
            if (!this.lessonItemsDict[iKey.id]) {
                iKey.id = 0;
            }
        } else {
            iKey.person = lessons[ind + 1].person;
        }

        return this.SelectedKeyToString(iKey);
    }

    gotoPreviousEpisode() {
        const previousSelectedKey = this.getPreviousKey();
        this.selectedKey = previousSelectedKey;
        this.updateGUIDueToSelectedKey();
    }

    gotoNextEpisode() {
        const nextSelectedKey = this.getNextKey();
        this.selectedKey = nextSelectedKey;
        this.updateGUIDueToSelectedKey();
    }

    get lessonItemKeys(): string[] {
        return Object.keys(this.lessonItemsDict);
    }

    constructor(
        private http: HttpClient,
        private entityService: EntityService,
        private route: ActivatedRoute,
        private loadingService: LoadingService
    ) {}

    async ngOnInit(): Promise<void> {
        this.route.params.subscribe(async (params: { [x: string]: any }) => {
            const partId = params['part_id'];
            const lessonId = params['lesson_id'];
            await this.fetchLessonData(partId, lessonId);
        });
    }

    private extractNumber(str: string) {
        let match = str.match(/(\d+)/);
        return match ? Number(match[0]) : -1;
    }

    private async fetchLessonData(partId: any, lessonId: any): Promise<void> {
        this.partID = partId;
        this.lessonID = lessonId;
        this.part = this.extractNumber(this.partID);
        this.lesson = this.extractNumber(this.lessonID);
        this.loadingService.setLoading(true);
        this.lessonItemsDict = {};
        this.http
            .get(`/api/lessons?part=${partId}&lesson=${lessonId}`)
            .pipe(finalize(() => this.loadingService.setLoading(false)))
            .subscribe({
                next: async (response: any) => {
                    const parser = new DOMParser();

                    const lessonXmlDoc = parser.parseFromString(
                        response.lesson_xml,
                        'application/xml'
                    );

                    const translationXmlDoc = parser.parseFromString(
                        response.translation_xml,
                        'application/xml'
                    );

                    const lessonItems = Array.from(
                        lessonXmlDoc.getElementsByTagName('item')
                    );
                    let translationItems = Array.from(
                        translationXmlDoc.getElementsByTagName('item')
                    );

                    for (const lessonItem of lessonItems) {
                        const id = lessonItem.getAttribute('id')!;
                        const translationItem = translationItems.find(
                            (item) => item.getAttribute('id') === id
                        );
                        if (translationItem) {
                            translationItems = translationItems.filter(
                                (item) => item !== translationItem
                            );
                        }
                        const translation =
                            translationItem?.getElementsByTagName(
                                'translation'
                            )[0]?.textContent || '';
                        this.lessonItemsDict[id] = [
                            ...(this.lessonItemsDict[id] || []),
                            new LessonItem(lessonItem, translation),
                        ];
                    }

                    // load all the images of this.lessonItemsDict
                    let fetchObservables = [];
                    for (const key in this.lessonItemsDict) {
                        for (let item of this.lessonItemsDict[key]) {
                            fetchObservables.push(
                                this.fetchAndReplaceImage(
                                    partId,
                                    lessonId,
                                    item
                                )
                            );
                        }
                    }

                    forkJoin(fetchObservables).subscribe((responces) => {});

                    this.setActiveKey('0;Teacher');

                    const audio_link = response.audio_link;

                    fetch(audio_link)
                        .then((response) => response.blob())
                        .then((blob) => {
                            let url = URL.createObjectURL(blob);
                            this.audio = new Audio(url);
                            let overlay = document.getElementById('overlay');
                            if (overlay) {
                                overlay.style.display = 'none';
                            }
                        });
                },
                error: (error) => {
                    console.error(error);
                },
            });
    }

    fetchAndReplaceImage(
        partId: any,
        lessonId: any,
        item: LessonItem
    ): Observable<Blob | null> {
        if (!item.image) {
            return of(null);
        }

        return this.http
            .get<Blob>(
                `/api/images?part=${partId}&lesson=${lessonId}&image=${item.image}`,
                { responseType: 'blob' as 'json' }
            )
            .pipe(
                tap((imageBlob) => {
                    item.image = URL.createObjectURL(imageBlob);
                }),
                catchError((error) => {
                    item.image = `broken: ${item.image}`;
                    return of(null);
                })
            );
    }

    get isLoading() {
        return this.loadingService.loading$;
    }
}
