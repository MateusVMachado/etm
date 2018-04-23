/*[DataContract]*/
export class OpenFACConfig {
    public KeyboardLayout: string;
    public ScanType: string;
    public ActiveSensor: string;
    public ScanTimeLines: number;
    public ScanTimeColumns: number;
    public level: number;
}
/*[DataContract]*/
export class OpenFACLayout {
    public Engine: string;
    public Lines: Array<LayoutLine>;
    public nameLayout: string;
    public email: string;
}
/*[DataContract]*/
export class LayoutLine {
    public Buttons: Array<LayoutButton>;
}
/*[DataContract]*/
export class LayoutButton {
    public Caption: string;
    public Text: string;
    public Action: string;
    public Image: string;
}