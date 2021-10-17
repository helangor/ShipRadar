export class CodeDescriptions {
    agentTypes: CodeType[] = [];
    cargoTypes: CodeType[] = [];
    vesselTypes: CodeType[] = [];
}

class CodeType {
    code: string = "";
    descriptionEn: string= "";
    descriptionFi: string= "";   
}