export enum EngineScanType {
    ScanAuto,
    ScanManual
}

export interface IOpenCapConfig {
    GetKeyboardManager(): OpenCapKeyboardManager;
    GetCurrentKeyboard(): OpenCapKeyboard;
    GetScanType(): EngineScanType;
    GetActiveSensor(): string;
};