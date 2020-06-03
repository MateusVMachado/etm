export interface IOpenFacPredictor {
    Predict(metaWord: string): void;
    //IMPLEMENTAR
    //GetListWords(): LinkedList<string>;
    Add(word: string): void;
}