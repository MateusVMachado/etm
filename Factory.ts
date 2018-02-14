interface ISensor{
    name: string;
}

export class TSensor implements ISensor{
    name: string;

    public hello(){
        console.log("HELLOOOoOoOOooooo");
    }
}

export class FactorySensor{

    public static dicTypes: Map<string, any> = new Map<string, any>();
    
    public static Create<T extends ISensor>(sensorName: string, type: { new(): T ;}): T {
        //primeiro faz o get no dic 
        let abc = typeof(type);
        this.dicTypes.set('abc', abc);
        
        this.Create<TSensor>('sensor_0', TSensor);
        return new type();
    }

}