import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Renderer2,
    ChangeDetectorRef,
} from '@angular/core';
import { EntityService, IEntity } from '../services/entity.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../loading.service';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, first, isEmpty, tap } from 'rxjs/operators';
import { LessonItem } from './lesson.wrapper';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AudioOverlayComponent } from '../audio-overlay/audio-overlay.component';
import { OptionsService } from '../services/Options/options.service';
import { ExitComponent } from '../exit/exit.component';

interface Lesson {
    nextPart: string;
    nextLesson: string;
}

interface Key {
    itemId: string;
    subItemId: string;
}

@Component({
    selector: 'app-lesson',
    templateUrl: './lesson.component.html',
    styleUrls: ['./lesson.component.css'],
})
export class LessonComponent implements OnInit {
    @ViewChild('headerElement') headerElement!: ElementRef;

    private activateEpisodeSubject = new Subject<any>();

    emitEpisodeActivateEvent() {
        this.activateEpisodeSubject.next(null);
    }

    getEpisodeActivateEvent() {
        return this.activateEpisodeSubject.asObservable();
    }

    public isLeft(): boolean {
        const result = this.optionsService.options.mainPanelSide === "left";
        return result;
    }

    Object = Object;

    timerId: any;
    isPanelHidden: boolean = false;

    title = 'DirectMethod';

    audioContext: AudioContext = new AudioContext();
    audioBuffer!: AudioBuffer;
    source!: AudioBufferSourceNode | null;

    lessonItemsDict: { [key: string]: LessonItem } = {};
    selectedKey: Key = { itemId: '-1', subItemId: '-1' }; //string = '0:0'; //ISelectedKey = { id: 0, person: '' };
    lesson: number = -1;
    part: number = -1;
    isPlaying: boolean = false;
    playLoop: boolean = false;

    //continuousPlayFlag: boolean = false;

    showInterval: boolean = false;
    minPossibleIntervalValue: number = 0;
    maxPossibleIntervalValue: number = 50;
    minIntervalValue!: number;
    maxIntervalValue!: number;
    startLessonTime: number = 0;
    endLessonTime: number = 0;
    currentLessonTime: number = 0;

    isAudioDialogOpen: boolean = false;
    dialogRef: MatDialogRef<AudioOverlayComponent, any> | undefined = undefined;

    formatIntervalLabel(value: number): string {
        return `${value}`;
    }

    private lessonID: string = '';
    private partID: string = '';

    keyToString(key: Key): string {
        return `${key.itemId}-${key.subItemId}`;
    }

    private stringToKey(value: string): Key {
        const [itemId, subItemId] = value.split('-');
        return { itemId, subItemId };
    }

    private stringToISelectedKey(value: string): Key {
        //const parts = this.selectedKey.split(';');
        //return new TSelectedKey(parseInt(parts[0]), parts[1]);
        return this.stringToKey(value);
    }

    //private SelectedKeyToString(value: TSelectedKey) {
    //    return value.id + ';' + value.person;
    //}

    private getPersonByKey(key: Key) {
        return this.lessonItemsDict[this.keyToString(key)]?.person;
    }

    setActiveKey(value: string) {
        this.selectedKey = this.stringToKey(value);
        this.updateGUIDueToSelectedKey();
        this.emitEpisodeActivateEvent();
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

    private checkTimeInterval: ReturnType<typeof setInterval> | undefined;

    private async openDialog() {
        const parentComponent = this;
        this.dialogRef = this.dialog.open(AudioOverlayComponent, {
            width: '100%',
            panelClass: 'custom-overlay-pane-class',
            disableClose: true,
            hasBackdrop: false,
            data: { parentComponent },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            this.isAudioDialogOpen = false;
        });

        return this.dialogRef.afterOpened().toPromise();
    }

    async showAudioDialog(
        startRecognition: boolean,
        attemptsNumber: number,
        acceptedResult: number
    ) {
        if (!this.isAudioDialogOpen) {
            this.isAudioDialogOpen = true;
            await this.openDialog();
        }

        if (startRecognition) {
            await this.dialogRef?.componentInstance.onRecognizing(
                attemptsNumber,
                acceptedResult,
                true
            );
        }
    }

    async closeAudioDialog() {
        await this.dialogRef?.close();
    }

    exit() {
        // const parentComponent = this;
        const dialogRef = this.dialog.open(ExitComponent, {
            panelClass: 'exit-overlay-pane-class',
            disableClose: true,
        });
    }

    changeAudioLoop() {
        this.playLoop = !this.playLoop;
    }

    getCurrentEpisode(strictCurrentPerson: boolean): undefined | LessonItem {
        const currentKey: Key = strictCurrentPerson
            ? this.selectedKey
            : { itemId: this.selectedKey.itemId, subItemId: '0' };
        //        const currentKey: Key = this.selectedKey;
        const lesson: LessonItem =
            this.lessonItemsDict[this.keyToString(currentKey)];
        return lesson;
        /*
        const lesson: LessonItem[] = lessons.filter(
            (item) =>
                item.person ===
                (strictCurrentPerson ? this.getPersonByKey(currentKey) : 'Teacher')
        );

        if (!lesson) {
            return undefined;
        }

        return lesson[0];
        */
    }

    private sleep(milliseconds: number) {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    public onContinuousPlay() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.continuousPlay();
        } else {
            if (this.source) {
                this.source.stop();
                this.source = null;
            }
            this.isPlaying = false;
        }
    }

    private continuosPlayCurrentEpisode(episode: LessonItem): Promise<boolean> {
        return new Promise((resolve) => {
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.connect(this.audioContext.destination);
            this.source.loop = false;

            const start = episode.start;
            const duration = episode.duration;

            this.source.onended = () => {
                resolve(true);
            };

            const relativeStart = this.audioContext.currentTime;
            this.source.start(0, start, duration);

            const updateProgress = () => {
                if (!this.isPlaying) {
                    return;
                }

                this.currentLessonTime =
                    start + (this.audioContext.currentTime - relativeStart);
                this.cd.detectChanges();
                requestAnimationFrame(updateProgress);
            };

            updateProgress();
        });
    }

    private async playSignal(): Promise<void> {
        return new Promise((resolve) => {
            const audioCtx = new window.AudioContext();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
            oscillator.onended = () => {
                resolve();
            };
        });
    }

    private async continuousPlay() {
        const activeModelName = this.optionsService.options.activeModelName;
        const opt =
            this.optionsService.options.continuousLessonOptionsMap[
                activeModelName
            ];
        const realStudentAnswer = opt.onRealStudentAnswer;

        const pauseBefore = opt.pauseBeforePhrase;
        const pauseAfter = opt.pauseAfterPhrase;

        const useRealStudent = realStudentAnswer.use;
        const playRealStudentSignal = realStudentAnswer.playSignal;
        const openRecognitionDialog =
            realStudentAnswer.openSpeechRecognitionDialog;
        const attemptsNumber = realStudentAnswer.maximumAttempts;
        const acceptableResult = realStudentAnswer.maximumError;

        while (this.isPlaying) {
            await this.sleep(1000 * pauseBefore);

            const episode = this.getCurrentEpisode(true);
            if (!episode) {
                break;
            }

            let skipEpisode: boolean = false;
            if (episode.person === 'Student' && useRealStudent) {
                if (playRealStudentSignal) {
                    await this.playSignal();
                    await this.sleep(300);
                }

                if (openRecognitionDialog) {
                    await this.showAudioDialog(
                        true,
                        attemptsNumber,
                        acceptableResult
                    );

                    await this.closeAudioDialog();

                    //skipEpisode = true;
                }
            }

            let playResult: boolean = true;

            if (!skipEpisode) {
                playResult = await this.continuosPlayCurrentEpisode(episode);
            }

            if (!playResult || !this.isPlaying) {
                break;
            }

            //this.getPreviousKey()
            await this.sleep(
                1000 *
                    (pauseAfter.constantTime +
                        pauseAfter.multiplePreviousPhraseTime *
                            episode.duration)
            );

            if (this.currentEpisodeIsLast()) {
                break;
            }

            this.gotoNextEpisode();
        }

        this.continuousStop();
        this.isPlaying = false;
    }

    private continuousStop() {}

    public onPlay(
        strictCurrentPerson: boolean,
        customStart: number | undefined = undefined,
        customDuration: number | undefined = undefined
    ) {
        if (!this.audioBuffer) {
            return;
        }

        if (this.isPlaying) {
            if (this.source) {
                this.source.stop();
                this.source = null;
            }
            this.isPlaying = false;
            return;
        }

        const episode = this.getCurrentEpisode(strictCurrentPerson);
        this.playEpisode(episode, customStart, customDuration);
    }

    private playEpisode(
        episode: LessonItem | undefined,
        customStart: number | undefined,
        customDuration: number | undefined
    ) {
        if (!episode) {
            return;
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.audioContext.destination);
        this.source.loop = this.playLoop;
        this.isPlaying = true;

        const start = customStart ? customStart : episode.start;
        const duration = customDuration ? customDuration : episode.duration;

        this.source.onended = () => {
            this.isPlaying = false;
            this.source = null;
            this.cd.detectChanges();
        };

        const relativeStart = this.audioContext.currentTime;
        if (this.source.loop) {
            this.source.loopStart = start;
            this.source.loopEnd = start + duration;
            this.source.start(0, start); //, duration);
        } else {
            this.source.start(0, start, duration);
        }

        const updateProgress = () => {
            if (!this.isPlaying) {
                return;
            }

            this.currentLessonTime =
                start +
                ((this.audioContext.currentTime - relativeStart) % duration);
            this.cd.detectChanges();
            requestAnimationFrame(updateProgress);
        };

        updateProgress();
    }

    formatTime(time: number): string {
        const minutes = Math.floor(time / 60)
            .toString()
            .padStart(2, '0');
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, '0');
        const dSeconds = Math.floor((time * 10) % 10);
        return `${minutes}:${seconds}:${dSeconds}`;
    }

    public updateGUIDueToSelectedKey() {
        const iKey = this.selectedKey;

        const lesson: LessonItem = this.lessonItemsDict[this.keyToString(iKey)];

        let student: LessonItem | undefined = undefined;
        let teacher: LessonItem | undefined = undefined;

        if (iKey.subItemId === '0') {
            teacher = lesson;
        } else {
            student = lesson;
            teacher =
                this.lessonItemsDict[
                    this.keyToString({ itemId: iKey.itemId, subItemId: '0' })
                ];
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

        const episode = this.getCurrentEpisode(true);
        if (episode) {
            this.minPossibleIntervalValue = episode.start;
            this.maxPossibleIntervalValue = episode.start + episode?.duration;
            this.minIntervalValue = episode.start;
            this.maxIntervalValue = episode.start + episode.duration;

            this.currentLessonTime = episode.start;
        }
    }

    showHideInterval() {
        this.showInterval = !this.showInterval;
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

    private getNextKey(): string {
        const currentKey = this.keyToString(this.selectedKey);

        const keys = Object.keys(this.lessonItemsDict);
        const currentIndex = keys.indexOf(currentKey);

        if (currentIndex === -1) return '0-0';

        const nextKey =
            currentIndex < keys.length - 1 ? keys[currentIndex + 1] : keys[0];

        return nextKey;
    }

    private getPreviousKey(): string {
        const currentKey = this.keyToString(this.selectedKey);

        const keys = Object.keys(this.lessonItemsDict);
        const currentIndex = keys.indexOf(currentKey);

        if (currentIndex === -1) return '0-0';

        const previousKey =
            currentIndex > 0 ? keys[currentIndex - 1] : keys[keys.length - 1];

        return previousKey;
    }

    private currentEpisodeIsLast(): boolean {
        const currentKey = this.keyToString(this.selectedKey);

        const keys = Object.keys(this.lessonItemsDict);
        const currentIndex = keys.indexOf(currentKey);

        return keys[keys.length - 1] === currentKey;
    }

    gotoPreviousEpisode() {
        const previousSelectedKey = this.getPreviousKey();
        this.setActiveKey(previousSelectedKey);
    }

    gotoNextEpisode() {
        const nextSelectedKey = this.getNextKey();
        this.setActiveKey(nextSelectedKey);
    }

    get lessonItemKeys(): string[] {
        return Object.keys(this.lessonItemsDict);
    }

    constructor(
        private http: HttpClient,
        private entityService: EntityService,
        private route: ActivatedRoute,
        private router: Router,
        private loadingService: LoadingService,
        private cd: ChangeDetectorRef,
        private renderer: Renderer2,
        public dialog: MatDialog,
        public optionsService: OptionsService
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

    private async parseLessonData(response: any) {
        this.lessonItemsDict = {};
        const parser = new DOMParser();

        const lessonXmlDoc = parser.parseFromString(
            response.lesson_xml,
            'application/xml'
        );
        const translationXmlDoc = parser.parseFromString(
            response.translation_xml,
            'application/xml'
        );

        const topLevelItems = Array.from(
            lessonXmlDoc.querySelectorAll('items > item')
        );

        topLevelItems.forEach((topItem) => {
            const itemId = topItem.getAttribute('id') || '-1';
            const subItems = topItem.querySelectorAll('item');
            subItems.forEach((subItem) => {
                const subItemId = subItem.getAttribute('id') || '-1';
                const translationElement = translationXmlDoc.querySelector(
                    `item[id="${itemId}"] item[id="${subItemId}"] translation`
                );
                const translation = translationElement?.textContent || '';
                const key = this.keyToString({ itemId, subItemId });
                this.lessonItemsDict[key] = new LessonItem(
                    subItem,
                    translation
                );
            });
        });
    }

    private async loadImagesForLesson(partId: any, lessonId: any) {
        let fetchObservables = [];
        for (const key in this.lessonItemsDict) {
            fetchObservables.push(
                this.fetchAndReplaceImage(
                    partId,
                    lessonId,
                    this.lessonItemsDict[key]
                )
            );
        }
        await forkJoin(fetchObservables).toPromise();
    }

    private async loadAndDecodeAudio(audio_link: string) {
        const audio_response = await fetch(audio_link);
        const arrayBuffer = await audio_response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
            arrayBuffer
        );

        this.audioBuffer = audioBuffer;
        this.startLessonTime = 0;
        this.endLessonTime = audioBuffer.duration;
        this.currentLessonTime = 0;
    }

    private async fetchLessonData(partId: any, lessonId: any): Promise<void> {
        this.partID = partId;
        this.lessonID = lessonId;
        this.part = this.extractNumber(this.partID);
        this.lesson = this.extractNumber(this.lessonID);
        this.loadingService.setLoading(true);

        this.http
            .get(`/api/lessons?part=${partId}&lesson=${lessonId}`)
            .subscribe({
                next: async (response: any) => {
                    try {
                        await this.parseLessonData(response);
                        await this.loadImagesForLesson(partId, lessonId);
                        await this.loadAndDecodeAudio(response.audio_link);
                        this.setActiveKey('0-0');
                    } catch (error) {
                        console.error(error);
                    } finally {
                        this.loadingService.setLoading(false);
                    }
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

    navigateToOptions() {
        this.router.navigate(['/options']);
    }

    navigateToQuickLinks() {
        this.router.navigate(['/quick-links']);
    }
}
