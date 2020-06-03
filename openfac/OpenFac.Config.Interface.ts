import { OpenFacKeyboardManager } from './OpenFac.KeyboardManager';
import { OpenFacKeyboard } from './OpenFac.Keyboard';

export enum EngineScanType {
    ScanAuto,
    ScanManual
}

export interface IOpenFacConfig {
    GetKeyboardManager(): OpenFacKeyboardManager;
    GetCurrentKeyboard(): OpenFacKeyboard;
    GetScanType(): EngineScanType;
    GetActiveSensor(): string;
};