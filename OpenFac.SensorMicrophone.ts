import { OpenFacSensorBase } from './OpenFac.SensorBase';

export class OpenFacSensorMicrophoneWindows extends OpenFacSensorBase {
    /*
    private _recorder: WaveInRecorder;
    private _recorderBuffer: number[];
    private _waveFormat: WaveFormat;
    private _audioFrameSize: number = 11025;
    private _audioBitsPerSample: number = 16;
    private _audioChannels: number = 1;
    public Dispose(): void {
        Stop();
        super.Dispose();
    }
    public IsTrigged(): boolean {
        return true;
    }
    public Start(): void {
        this._waveFormat = new WaveFormat(this._audioFrameSize, this._audioBitsPerSample, this._audioChannels);
        this._recorder = new WaveInRecorder(0, this._waveFormat, this._audioFrameSize * 2, 3, new BufferDoneEventHandler(DataArrived));
    }
    public Open(): void {

    }
    public DoAction(state: SensorState): void {
        super.DoAction(state);
    }
    private DataArrived(data: IntPtr, size: number): void {
        if (this._recorderBuffer == null || this._recorderBuffer.length < size)
            this._recorderBuffer = new Array(size);
        if (this._recorderBuffer != null) {
            System.Runtime.InteropServices.Marshal.Copy(data, this._recorderBuffer, 0, size);
            var bigValue: number = 0;
            var MaxValue: number = 80;
            for (var index: number = 0; index < this._recorderBuffer.length; index += 2) {
                var sample: number = <number>((this._recorderBuffer[index + 1] << 8) | this._recorderBuffer[index + 0]);
                var sample32: number = 100 * sample / 32768f;
                if (bigValue < sample32) {
                    bigValue = sample32;
                    if (bigValue > MaxValue) {
                        DoAction(0);
                    }
                }
            }
        }
    }
    public Close(): void {

    }
    public SetWaveFormat(): void {

    }
    public SetTriggerLevel(Level: number): void {

    }
    public SwapBuffers(): void {

    }
    */
}