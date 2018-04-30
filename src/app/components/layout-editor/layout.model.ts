/*[DataContract]*/
export class OpenFACConfig {
    public KeyboardLayout: string;
    public ScanType: string;
    public ActiveSensor: string;
}
/*[DataContract]*/
export class OpenFACLayout {
    public Engine: string;
    public Lines: Array<LayoutLine>;
    public nameLayout: string;
    public email: string;
    public magnify: number;
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