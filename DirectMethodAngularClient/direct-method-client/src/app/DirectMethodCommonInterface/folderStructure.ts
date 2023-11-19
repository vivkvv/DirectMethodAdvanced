export class Lesson {
  public get duration(): number {
    return this._duration;
  }
  public get mp3(): string {
    return this._mp3;
  }
  public set mp3(value: string) {
    this._mp3 = value;
  }
  public get imagesPath(): string {
    return this._imagesPath;
  }
  public get fileName(): string {
    return this._fileName;
  }
  public get title(): string {
    return this._title;
  }
  public get folderName(): string {
    return this._folderName;
  }
  public get translationFile(): string {
    return this._translationFile;
  }  
  constructor(
    public _title: string,
    public _fileName: string,
    private _folderName: string,
    private _imagesPath: string,
    public _mp3: string,
    private _duration: number,
    public _translationFile: string    
  ) {}
}

export class Part {
  public get lessons(): Lesson[] {
    return this._lessons;
  }
  public get pdf(): string {
    return this._pdf;
  }
  public get pdfPath(): string {
    return this._pdfPath;
  }
  public get path(): string {
    return this._path;
  }
  public get title(): string {
    return this._title;
  }
  constructor(
    public _title: string,
    public _path: string,
    public _pdf: string,
    public _pdfPath: string,
    public _lessons: Lesson[],
  ) {}
}
