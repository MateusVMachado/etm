import { IOpenFacConfig, EngineScanType } from './OpenFac.Config.Interface';
import { OpenFACConfig } from './OpenFac.ConfigContract';
import { OpenFACLayout } from './OpenFac.ConfigContract';
import { OpenFacKeyboardManager } from './OpenFac.KeyboardManager';
import { OpenFacActionManager } from './OpenFac.ActionManager';
import { LayoutLine } from './OpenFac.ConfigContract';
import { LayoutButton } from './OpenFac.ConfigContract';
import { OpenFacKeyboard } from './OpenFac.Keyboard';
import { OpenFacKeyboardLine } from './OpenFac.KeyboardLine';
import { OpenFacKeyboardButton } from './OpenFac.KeyboardButton';
import { IOpenFacAction } from './OpenFac.Action.Interface';

export class OpenFacConfig implements IOpenFacConfig {
    private config: OpenFACConfig;
    layout: OpenFACLayout;
    keyboardManager: OpenFacKeyboardManager;
    actionManager: OpenFacActionManager;

    constructor(configFile:string)
    {
        this.keyboardManager = new OpenFacKeyboardManager();
        this.actionManager = new OpenFacActionManager();
        this.config = this.LoadConfig(configFile);
        this.layout = this.LoadLayout(this.config.KeyboardLayout);
        this.LoadLayoutConfig();
    } 

    private LoadConfig(FileName: string): OpenFACConfig {
        //IMPLEMENTAR
        //let js: DataContractJsonSerializer = new DataContractJsonSerializer(/*typeof*/OpenFACConfig);
        //let fs: FileStream = new FileStream(FileName, FileMode.Open, FileAccess.Read);
        
        let config: OpenFACConfig = new OpenFACConfig();
        config.KeyboardLayout = 'QWERT';
        config.ScanType = "Auto";
        config.ActiveSensor = "Joystick";
        //config = <OpenFACConfig>js.ReadObject(fs);
        //fs.Close();
        return config;
    }
    private LoadLayout(FileName: string): OpenFACLayout {
        //IMPLEMENTAR
        let layoutString = "";
        //let js: DataContractJsonSerializer = new DataContractJsonSerializer(/*typeof*/OpenFACLayout);
        //let fs: FileStream = new FileStream(FileName, FileMode.Open, FileAccess.Read);
        let layout: OpenFACLayout = new OpenFACLayout();

        //layout.Lines = JSON.parse("\"Lines\" : [{\"Buttons\" : [{\"Action\" : \"Keyboard\",\"Caption\" : \"A\",\"Text\" : \"A\"}, {\"Action\" : \"TTS\",\"Caption\" : \"B\",\"Text\" : \"Oi Galera\"}]}, {\"Buttons\" : [{\"Action\" : \"Keyboard\",\"Caption\" : \"A\",\"Text\" : \"A\"}, {\"Action\" : \"TTS\",\"Caption\" : \"B\",\"Text\" : \"Alexandre Henzen\"}]}, {\"Buttons\" : [{\"Action\" : \"Keyboard\",\"Caption\" : \"A\",\"Text\" : \"A\"}, {\"Action\" : \"TTS\",\"Caption\" : \"B\",\"Text\" : \"Felippeto\"}]}]");
        layout.Lines = new Array<LayoutLine>();
        layout.Lines.push(new LayoutLine());
        layout.Lines.push(new LayoutLine());
        layout.Lines.push(new LayoutLine());
        layout.Lines.push(new LayoutLine());
        //console.log(layout.Lines.length);
        layout.Lines[0].Buttons = new Array<LayoutButton>();
        layout.Lines[1].Buttons = new Array<LayoutButton>();
        layout.Lines[2].Buttons = new Array<LayoutButton>();
        layout.Lines[3].Buttons = new Array<LayoutButton>();
        for (let k = 0; k <= 12 ; k++) {
            layout.Lines[0].Buttons.push(new LayoutButton());
            layout.Lines[0].Buttons[k].Action = 'Keyboard';
            layout.Lines[0].Buttons[k].Caption = 'caption';
            layout.Lines[0].Buttons[k].Text = 'text';

            layout.Lines[1].Buttons.push(new LayoutButton());
            layout.Lines[1].Buttons[k].Action = 'Keyboard';
            layout.Lines[1].Buttons[k].Caption = 'caption';
            layout.Lines[1].Buttons[k].Text = 'text';

            layout.Lines[2].Buttons.push(new LayoutButton());
            layout.Lines[2].Buttons[k].Action = 'Keyboard';
            layout.Lines[2].Buttons[k].Caption = 'caption';
            layout.Lines[2].Buttons[k].Text = 'text';

            layout.Lines[3].Buttons.push(new LayoutButton());
            layout.Lines[3].Buttons[k].Action = 'Keyboard';
            layout.Lines[3].Buttons[k].Caption = 'caption';
            layout.Lines[3].Buttons[k].Text = 'text';
        }
        console.log(JSON.stringify(layout.Lines));

        layout.Engine = "QWERT";
        
        //layout.Lines = JSON.parse
        //layout = <OpenFACLayout>js.ReadObject(fs);
        //fs.Close();
        return layout;
    }
    public GetActiveSensor(): string {
        return this.config.ActiveSensor;
    }
    /*
    private GenerateConfigSample(): void {
        //IMPLEMENTAR
        let layout: OpenFACLayout = new OpenFACLayout();
        layout.Engine = "QWERT";
        layout.Lines = new Array<LayoutLine>();
        let li: LayoutLine = new LayoutLine();
        li.Buttons = new Array<LayoutButton>();
        let bt: LayoutButton = new LayoutButton();
        bt.Action = "Keyboard";
        bt.Caption = "A";
        bt.Text = "A";
        let b2: LayoutButton = new LayoutButton();
        b2.Action = "Keyboard";
        b2.Caption = "B";
        b2.Text = "B";
        li.Buttons.Add(bt);
        li.Buttons.Add(b2);
        layout.Lines.Add(li);
        let l2: LayoutLine = new LayoutLine();
        l2.Buttons = new Array<LayoutButton>();
        l2.Buttons.Add(bt);
        l2.Buttons.Add(b2);
        let l3: LayoutLine = new LayoutLine();
        l3.Buttons = new Array<LayoutButton>();
        l3.Buttons.Add(bt);
        l3.Buttons.Add(b2);
        layout.Lines.Add(l2);
        layout.Lines.Add(l3);
        //let js: DataContractJsonSerializer = new DataContractJsonSerializer(OpenFACLayout);
        //let fs: FileStream = new FileStream("LayoutDefault.json", FileMode.OpenOrCreate, FileAccess.Write);
        //js.WriteObject(fs, layout);
        //fs.Close();
}*/
    public GetKeyboardManager(): OpenFacKeyboardManager {
        return this.keyboardManager;
    }
    public GetCurrentKeyboard(): OpenFacKeyboard {        
        return this.keyboardManager.Find(this.layout.Engine) as OpenFacKeyboard;
    }
    public GetScanType(): EngineScanType {
        if (this.config.ScanType == "Auto")
            return EngineScanType.ScanAuto;
        return EngineScanType.ScanManual;
    }
    private LoadLayoutConfig(): void {
        // IMPLEMENTAR
        let kb = this.keyboardManager.Find(this.layout.Engine) as OpenFacKeyboard;
        for (let i = 0; i < this.layout.Lines.length; i++) {
            let li = this.layout.Lines[i];
            let line: OpenFacKeyboardLine = kb.Lines.Add();
            for (let k = 0; k < li.Buttons.length; k++) {
                let bt = li.Buttons[k];
                let button: OpenFacKeyboardButton = line.Buttons.Add();
                button.Caption = bt.Caption;
                button.Text = bt.Text;
                let action: IOpenFacAction = this.actionManager.Find(bt.Action);
                button.Action = action;
            }
        }
    }

}