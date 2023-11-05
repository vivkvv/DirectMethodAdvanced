import {
    Component,
    ViewChild,
    ElementRef,
    OnInit,
    ChangeDetectorRef,
    Inject,
    AfterViewInit,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SpeechRecognitionService } from '../services/Speech-recognition/speech-recognition.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { LessonComponent } from '../lesson/lesson.component';
import { HostListener } from '@angular/core';
import * as d3 from 'd3';
import { ScaleLinear, Selection } from 'd3';
import { Subscription } from 'rxjs';
import { OptionsService } from '../services/Options/options.service';

export enum AudioState {
    AS_NONE = 0,
    AS_RECORD = 1,
    AS_PLAY = 2,
    AS_RECOGNIZE = 3,
    AS_SYNC_PLAY = 4,
    AS_PLAY_CURRENT_EPISODE = 5,
}

@Component({
    selector: 'audio-overlay-content',
    templateUrl: './audio-overlay.component.html',
    styleUrls: ['./audio-overlay.component.css'],
})
export class AudioOverlayComponent implements OnInit, AfterViewInit {
    @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
    @HostListener('window:keydown', ['$event'])
    handle(event: KeyboardEvent) {
        switch (event.key.toUpperCase()) {
            case 'C':
                this.clearComparison();
                break;
            case 'N':
                this.onNextEpisode();
                break;
            case 'B':
                this.onPreviousEpisode();
                break;
            case 'P':
                this.onPlayCurrentEpisode();
                break;
            case 'R':
                this.onRecognizing(1, 0.0, false);
                break;
        }
    }

    isMaximized = false;

    subscription!: Subscription;

    public showPlot: Boolean = false;
    public showTimeScroller: Boolean = false;

    public isLeft(): number {
        return this.optionsService.options.mainPanelSide === 'left' ? 0 : 1;
    }

    toggleMaximize(): void {        
        this.isMaximized = !this.isMaximized; // Toggle the state
        if (this.isMaximized) {
            // Maximizing the dialog
            // this.dialogRef.updateSize('100vw', '100vh');
            // this.dialogRef.updatePosition({ top: '0', left: '0' });
            this.dialogRef.addPanelClass('fullscreen');
        } else {
            // Restoring the dialog to its previous size
            // this.dialogRef.updateSize('initial', 'initial');
            // this.dialogRef.updatePosition({ top: 'initial', left: 'initial' });
            this.dialogRef.removePanelClass('fullscreen');
        }
    }

    onShowPlotChange() {
        if (this.showPlot) {
            this.cd.detectChanges();
            this.paintEpisodeAudioData();
        }
    }

    comparison_result: number = 0;
    comparison_result_text: string = '';
    user_audio_buffer: AudioBuffer | undefined = undefined;
    source: AudioBufferSourceNode | undefined = undefined;
    episode_source: AudioBufferSourceNode | undefined = undefined;

    audioContext: AudioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    private recoredGainNode: GainNode = this.audioContext.createGain();
    private episodeGainNode: GainNode = this.audioContext.createGain();

    audioState: AudioState = AudioState.AS_NONE;

    mediaRecorder!: MediaRecorder;
    //transcript = '';
    tableRows: Array<{ text: string; value: string }> = [];

    lesson!: any;

    isRecordEnabled(): boolean {
        return (
            this.audioState === AudioState.AS_NONE ||
            this.audioState === AudioState.AS_RECORD
        );
    }

    isLanguageEnabled(): boolean {
        return this.audioState === AudioState.AS_NONE;
    }

    isRecognizeEnabled(): boolean {
        return (
            this.audioState === AudioState.AS_NONE ||
            this.audioState === AudioState.AS_RECOGNIZE
        );
    }

    isPlayingRecordedAudio(): boolean {
        return (
            this.audioState === AudioState.AS_NONE &&
            Boolean(this.user_audio_buffer)
        );
    }

    isPlayingCurrentEpisode(): boolean {
        return this.audioState === AudioState.AS_PLAY_CURRENT_EPISODE;
    }

    isSyncPlayEnabled(): boolean {
        return (
            (this.audioState === AudioState.AS_NONE &&
                Boolean(this.user_audio_buffer)) ||
            this.audioState === AudioState.AS_SYNC_PLAY
        );
    }

    isRecording(): boolean {
        return this.audioState === AudioState.AS_RECORD;
    }

    isPlaying(): boolean {
        return this.audioState === AudioState.AS_PLAY;
    }

    isRecognizing(): boolean {
        return this.audioState === AudioState.AS_RECOGNIZE;
    }

    isSyncPlaying(): boolean {
        return this.audioState === AudioState.AS_SYNC_PLAY;
    }

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AudioOverlayComponent>,
        private speechRecognitionService: SpeechRecognitionService,
        private cd: ChangeDetectorRef,
        public optionsService: OptionsService
    ) {
        this.lesson = data.parentComponent;
        this.speechRecognitionService.onResult((event) => {
            let final_flag: boolean = false;
            let transcript: string = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final_flag = true;
                    transcript += result[0].transcript + '\n';
                } else {
                    //   this.transcript += result[0].transcript + '\n';
                }
            }

            if (final_flag) {
                const desired_text = this.lesson.getCurrentEpisode(true)?.text;
                if (desired_text) {
                    const difference = this.levenshtein(
                        transcript,
                        desired_text
                    );
                    this.comparison_result =
                        (100 * difference) / desired_text.length;
                    this.comparison_result_text =
                        this.comparison_result.toFixed(1) + '%';

                    const newRow = {
                        text: transcript,
                        value: this.comparison_result_text,
                    };
                    this.tableRows.unshift(newRow);
                }
            }

            this.cd.detectChanges();
        });
    }

    private clearSvg(svgId: string) {
        d3.select(svgId).selectAll('*').remove();
    }

    private createSvg(svgId: string, width: number, height: number) {
        return d3.select(svgId).attr('width', width).attr('height', height);
    }

    // private createScales(data: number[], width: number, height: number) {
    //     const minData = d3.min(data) ?? 0;
    //     const maxData = d3.max(data) ?? 0;

    //     const xScale = d3
    //         .scaleLinear()
    //         .domain([0, data.length])
    //         .range([0, width]);
    //     const yScale = d3
    //         .scaleLinear()
    //         .domain([minData, maxData])
    //         .range([height, 0]);

    //     return { xScale, yScale };
    // }

    private createScales(
        xRange: [number, number],
        yRange: [number, number],
        width: number,
        height: number
    ) {
        const xScale = d3.scaleLinear().domain(xRange).range([0, width]);
        const yScale = d3.scaleLinear().domain(yRange).range([height, 0]);

        return { xScale, yScale };
    }

    private drawData(
        svg: Selection<SVGSVGElement, unknown, null, undefined>,
        data: number[],
        scales: {
            xScale: d3.ScaleLinear<number, number, never>;
            yScale: d3.ScaleLinear<number, number, never>;
        },
        color: string,
        opacity: number
    ) {
        const line = d3
            .line<number>()
            .x((_, i) => scales.xScale(i))
            .y((d) => scales.yScale(d));

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', opacity)
            .attr('d', line);
    }

    private getAudioData(
        audioBuffer: any,
        startTime: number,
        endTime: number
    ): number[] {
        const channelData = audioBuffer.getChannelData(0);

        const width = this.chartContainer.nativeElement.offsetWidth;
        const height = this.chartContainer.nativeElement.offsetHeight;

        const sampleRate = audioBuffer.sampleRate;
        const startIndex = Math.floor(startTime * sampleRate);
        const endIndex = Math.floor(endTime * sampleRate);

        let data = Array.from(channelData).slice(
            startIndex,
            endIndex
        ) as number[];

        return data;
    }

    normalizeData(data: number[]) {
        if (data.length === 0 || data.every((val) => val === 0)) {
            return data;
        }

        const maxVal = data.reduce(
            (max, val) => Math.max(max, Math.abs(val)),
            0
        );
        return data.map((val) => val / maxVal);
    }

    scales!: {
        xScale: d3.ScaleLinear<number, number>;
        yScale: d3.ScaleLinear<number, number>;
    };

    svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    cursorLine!: d3.Selection<SVGLineElement, unknown, null, undefined>;

    private paintEpisodeAudioData() {
        if (!this.lesson.audioBuffer) {
            return;
        }

        const width = this.chartContainer.nativeElement.offsetWidth;
        const height = this.chartContainer.nativeElement.offsetHeight;

        const episodeStart = this.lesson.getCurrentEpisode(true).start;
        const episodeEnd =
            this.lesson.getCurrentEpisode(true).start +
            this.lesson.getCurrentEpisode(true).duration;

        const start1 = this.findStartOfSignal(
            this.lesson.audioBuffer,
            0.1,
            episodeStart,
            episodeEnd
        );

        let data1 = this.getAudioData(
            this.lesson.audioBuffer,
            episodeStart,
            episodeEnd
        );

        let user_audio_data: number[] = [];
        if (this.user_audio_buffer) {
            let userStart = 0;
            const start2 = this.findStartOfSignal(
                this.user_audio_buffer,
                0.1,
                userStart
            );

            if (start2 >= start1 - episodeStart) {
                userStart = start2 - (start1 - episodeStart);
                const userEnd =
                    this.user_audio_buffer.length /
                    this.user_audio_buffer.sampleRate;
                user_audio_data = this.getAudioData(
                    this.user_audio_buffer,
                    userStart,
                    userEnd
                );
            } else {
                userStart = 0;
                const userEnd =
                    this.user_audio_buffer.length /
                    this.user_audio_buffer.sampleRate;
                const lengthInSamples = Math.round(
                    (start1 - episodeStart - start2) *
                        this.user_audio_buffer.sampleRate
                );
                let prefixData: number[] = new Array(lengthInSamples).fill(0);
                user_audio_data = this.getAudioData(
                    this.user_audio_buffer,
                    userStart,
                    userEnd
                );
                user_audio_data = prefixData.concat(user_audio_data);
            }

            const maxLength = Math.max(data1.length, user_audio_data.length);

            let suffixData: number[] = [];
            if (maxLength > data1.length) {
                suffixData = new Array(maxLength - data1.length).fill(0);
                data1 = data1.concat(suffixData);
            } else {
                suffixData = new Array(maxLength - user_audio_data.length).fill(
                    0
                );
                user_audio_data = user_audio_data.concat(suffixData);
            }
        }
        const normalizedData1 = this.normalizeData(data1);
        const normalizedUserAudioData = this.normalizeData(user_audio_data);
        const combinedNormalizedData = normalizedData1.concat(
            normalizedUserAudioData
        );

        const combinedData = data1.concat(user_audio_data); // Combine both data arrays
        const minData = d3.min(combinedData) ?? 0;
        const maxData = d3.max(combinedData) ?? 0;

        const maxLength = Math.max(data1.length, user_audio_data.length);

        this.clearSvg('#chart1');
        this.svg = this.createSvg(
            '#chart1',
            width,
            height
        ) as unknown as d3.Selection<SVGSVGElement, unknown, null, undefined>;
        this.scales = this.createScales(
            [0, maxLength],
            [minData, maxData],
            width,
            height
        );

        this.drawData(this.svg, data1, this.scales, 'darkblue', 1);
        this.drawData(this.svg, user_audio_data, this.scales, 'orange', 0.5);
    }

    ngAfterViewInit() {
        // this.paintEpisodeAudioData();

        const ro = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === this.chartContainer.nativeElement) {
                    this.paintEpisodeAudioData();
                }
            }
        });

        if (
            Boolean(this.chartContainer) &&
            Boolean(this.chartContainer.nativeElement)
        ) {
            ro.observe(this.chartContainer.nativeElement);
        }
    }

    private initChart(
        id: string,
        func: (d: number) => number,
        domain: [number, number],
        width: number,
        height: number
    ) {
        const svg = d3
            .select(`#${id}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x = d3.scaleLinear().domain(domain).range([0, width]);
        const y = d3.scaleLinear().domain(domain.map(func)).range([height, 0]);

        const line = d3
            .line<number>()
            .x((d, i) => x(d))
            .y((d, i) => y(func(d)));

        const data = d3.range(domain[0], domain[1]).map((d) => +d);

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);
    }

    ngOnInit() {
        this.speechRecognitionService.onStart(() => {
            if (this.audioState === AudioState.AS_NONE) {
                this.audioState = AudioState.AS_RECOGNIZE;
            }
            //this.transcript = '';
            this.cd.detectChanges();
        });

        this.speechRecognitionService.onEnd(() => {
            if (this.audioState === AudioState.AS_RECOGNIZE) {
                this.audioState = AudioState.AS_NONE;
            }
            this.cd.detectChanges();
        });

        this.subscription = this.data.parentComponent
            .getEpisodeActivateEvent()
            .subscribe(() => {
                if (this.showPlot) {
                    this.paintEpisodeAudioData();
                }
            });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    // getColor(value: string): string {
    //     const percentage = parseFloat(value);
    //     const hue = (1 - percentage / 100) * 120;
    //     return `hsl(${hue}, 100%, 50%)`;
    // }

    close(): void {
        //this.dialogRef.close();
        this.data.hideDialog();
    }

    private findStartOfSignal(
        audioBuffer: AudioBuffer,
        threshold = 0.1,
        startTimeInSeconds = 0,
        endTimeInSeconds = -1
    ) {
        let startOfSignal = 0;

        const startSample = startTimeInSeconds * audioBuffer.sampleRate;
        let endSample = endTimeInSeconds * audioBuffer.sampleRate;

        if (endTimeInSeconds === -1) {
            endSample = audioBuffer.length;
        }

        for (
            let channel = 0;
            channel < audioBuffer.numberOfChannels;
            channel++
        ) {
            const data = audioBuffer.getChannelData(channel);

            for (
                let i = startSample;
                i < Math.min(endSample, data.length);
                i++
            ) {
                if (Math.abs(data[i]) > threshold) {
                    startOfSignal = i / audioBuffer.sampleRate;
                    break;
                }
            }

            if (startOfSignal > 0) break;
        }

        return startOfSignal;
    }

    showRecorderAudioVolumeSlider = false;
    recorderAudioVolume: number = 50;
    toggleRecorderAudioVolumeSlider() {
        this.showRecorderAudioVolumeSlider =
            !this.showRecorderAudioVolumeSlider;
    }

    showEpisodeAudioVolumeSlider = false;
    episodeAudioVolume: number = 50;
    toggleEpisodeAudioVolumeSlider() {
        this.showEpisodeAudioVolumeSlider = !this.showEpisodeAudioVolumeSlider;
    }

    updateRecordedVolume(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input) {
            this.recorderAudioVolume = Number(input.value);
            this.recoredGainNode.gain.value = this.recorderAudioVolume / 100;
        }
    }

    updateEpisodeVolume(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input) {
            this.episodeAudioVolume = Number(input.value);
            this.episodeGainNode.gain.value = this.episodeAudioVolume / 100;
        }
    }

    onPlayRecordedAudio() {
        if (this.audioState === AudioState.AS_NONE) {
            if (this.user_audio_buffer) {
                this.audioState = AudioState.AS_PLAY;

                this.source = this.audioContext.createBufferSource();
                this.recoredGainNode.gain.value =
                    this.recorderAudioVolume / 100.0;

                this.source.buffer = this.user_audio_buffer;

                this.source.connect(this.recoredGainNode);
                this.recoredGainNode.connect(this.audioContext.destination);

                this.source.onended = () => {
                    this.audioState = AudioState.AS_NONE;
                    this.cd.detectChanges();
                };

                this.source.start();
            }
        }
    }

    private addVerticalLineToSVG() {
        if (!this.showTimeScroller) {
            return;
        }
        // Set the x position for the vertical line, could be the start of the x-axis or any other value
        const xPosition = this.scales.xScale(0); // Change '0' to whatever x-value you want the line to correspond to

        // Add the vertical line to the SVG
        this.cursorLine = this.svg
            .append('line')
            .attr('x1', xPosition)
            .attr('x2', xPosition)
            .attr('y1', this.scales.yScale(this.scales.yScale.domain()[1])) // y1 is the top of the y-axis scale
            .attr('y2', this.scales.yScale(this.scales.yScale.domain()[0])) // y2 is the bottom of the y-axis scale
            .attr('stroke', 'red')
            .attr('stroke-width', 2);
    }

    private removeVerticalLineFromSVG() {
        if (!this.showTimeScroller) {
            return;
        }

        if (this.cursorLine) {
            this.cursorLine.remove();
            //this.cursorLine = null; // Clear the reference if necessary
        }
    }

    private updateLinePosition(time: number) {
        if (!this.showTimeScroller) {
            return;
        }

        const rate = this.lesson.audioBuffer.sampleRate;
        this.cursorLine
            .attr('x1', this.scales.xScale(time * rate))
            .attr('x2', this.scales.xScale(time * rate));
    }

    private startMovingLine() {
        if (!this.showTimeScroller) {
            return;
        }

        const recordingStartTime = Date.now();
        const recordingLengthInSeconds = 10; // Set this to your recording length
        const interval = 10; // Update every 100ms

        const intervalId = setInterval(() => {
            const currentTime = (Date.now() - recordingStartTime) / 1000;
            if (currentTime >= recordingLengthInSeconds) {
                clearInterval(intervalId); // Stop updating after the recording duration
            } else {
                this.updateLinePosition(currentTime);
            }
        }, interval);
    }

    onPlayCurrentEpisode() {
        const episode = this.lesson.getCurrentEpisode(true);
        if (this.audioState === AudioState.AS_NONE && Boolean(episode)) {
            this.episode_source = this.audioContext.createBufferSource();
            this.episodeGainNode.gain.value = this.episodeAudioVolume / 100.0;

            const start = episode.start;
            const duration = episode.duration;

            this.audioState = AudioState.AS_PLAY_CURRENT_EPISODE;

            this.episode_source.onended = () => {
                this.audioState = AudioState.AS_NONE;
                this.cd.detectChanges();
                this.removeVerticalLineFromSVG();
            };

            this.episode_source.buffer = this.lesson.audioBuffer;

            this.episode_source.connect(this.episodeGainNode);
            this.episodeGainNode.connect(this.audioContext.destination);

            this.addVerticalLineToSVG();
            this.episode_source.start(0, start, duration);
            this.startMovingLine();

            this.cd.detectChanges();
        }
    }

    onRecord() {
        if (this.audioState === AudioState.AS_NONE) {
            this.audioState = AudioState.AS_RECORD;
            this.startRecording();
        } else if (this.audioState === AudioState.AS_RECORD) {
            // this.soundExists = true;
            this.audioState = AudioState.AS_NONE;
            this.stopRecording();
        }

        this.cd.detectChanges();
    }

    clearUserAudioData() {
        this.user_audio_buffer = undefined;
        this.onShowPlotChange();
    }

    async onRecognizing(
        attemptsNumber: number,
        acceptedResult: number,
        checkResult: boolean
    ) {
        if (this.audioState === AudioState.AS_NONE) {
            let attempts = 0;
            while (attempts < attemptsNumber) {
                ++attempts;
                this.speechRecognitionService.start();

                if (checkResult) {
                    await this.speechRecognitionService.recognitionEnded();
                    if (this.comparison_result <= acceptedResult) {
                        break;
                    }
                }
            }
        } else if (this.audioState === AudioState.AS_RECOGNIZE) {
            this.speechRecognitionService.stopListening();
        }
    }

    onNextEpisode() {
        this.lesson.gotoNextEpisode();
    }

    onPreviousEpisode() {
        this.lesson.gotoPreviousEpisode();
    }

    onSyncPlay() {
        if (this.audioState === AudioState.AS_NONE) {
            if (this.user_audio_buffer) {
                this.audioState = AudioState.AS_SYNC_PLAY;

                this.recoredGainNode.gain.value =
                    this.recorderAudioVolume / 100.0;
                this.episodeGainNode.gain.value =
                    this.episodeAudioVolume / 100.0;

                const episode = this.lesson.getCurrentEpisode(true);

                const episode_signal_start = this.findStartOfSignal(
                    this.lesson.audioBuffer,
                    0.1,
                    episode.start,
                    episode.start + episode.duration
                );
                this.episode_source = this.audioContext.createBufferSource();

                const signal_start = this.findStartOfSignal(
                    this.user_audio_buffer,
                    0.1
                );

                this.source = this.audioContext.createBufferSource();

                this.source.onended = () => {
                    this.audioState = AudioState.AS_NONE;
                    this.cd.detectChanges();
                    this.episode_source?.stop();
                };

                this.source.buffer = this.user_audio_buffer;
                this.source.connect(this.recoredGainNode);
                this.recoredGainNode.connect(this.audioContext.destination);

                this.source.start(this.audioContext.currentTime, signal_start);

                this.episode_source.buffer = this.lesson.audioBuffer;
                this.episode_source.connect(this.episodeGainNode);
                this.episodeGainNode.connect(this.audioContext.destination);

                this.episode_source.start(
                    this.audioContext.currentTime,
                    episode_signal_start
                );

                this.cd.detectChanges();
            }
        } else if (this.audioState === AudioState.AS_SYNC_PLAY) {
            this.source?.stop();
            this.audioState = AudioState.AS_NONE;
            this.cd.detectChanges();
        }
    }

    private startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia is not supported on your browser!');
            return;
        }

        console.log('getUserMedia supported.');
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
            })
            .then((stream) => {
                const chunks: Blob[] = [];
                this.mediaRecorder = new MediaRecorder(stream);

                this.mediaRecorder.onstop = (e) => {
                    const blob = new Blob(chunks, {
                        type: 'audio/ogg; codecs=opus',
                    });

                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const arrayBuffer = reader.result as ArrayBuffer;
                        //const audioContext = new (window.AudioContext ||
                        //    (window as any).webkitAudioContext)();
                        this.audioContext
                            .decodeAudioData(arrayBuffer)
                            .then((audioBuffer) => {
                                this.user_audio_buffer = audioBuffer;
                                this.cd.detectChanges();
                                this.onShowPlotChange();
                            })
                            .catch((err) => {
                                console.error('Error on file decoding', err);
                            });
                    };
                    reader.readAsArrayBuffer(blob);

                    this.removeVerticalLineFromSVG();
                };

                this.addVerticalLineToSVG();
                this.mediaRecorder.start();
                this.mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };
                this.startMovingLine();
            })
            // Error callback
            .catch((err) => {
                console.error(
                    `The following getUserMedia error occurred: ${err}`
                );
            });
    }

    private stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.stream) {
            this.mediaRecorder.stream
                .getTracks()
                .forEach((track) => track.stop());
        }
        this.mediaRecorder.stop();
    }

    normalizeString(str: string) {
        return str
            .replace(/[.,\/#!?$%\^&\*;:{}=\-_`~()\n\r\ \"\\\/]/g, '')
            .toLowerCase();
    }

    private levenshtein(a: string, b: string) {
        a = this.normalizeString(a);
        b = this.normalizeString(b);

        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        let matrix = [];

        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    clearComparison() {
        this.tableRows = [];
    }
}
