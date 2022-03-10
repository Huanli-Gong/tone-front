export interface FormProps {
    contrl : any ,
    disabled? : boolean,
    callBackProjectId?:any,
    project_id?:number,
    ws_id ? : string
    onRef? : any ,
    template? : any,
    test_type? : string, 
    business_type? : string, 
    server_provider? : string,
    isReset?: any,
    projectListDataRef?: any,
    baselineListDataRef?: any,
    tagsDataRef?:any,
    reportTemplateDataRef?:any,
    templateFormData?:Object | undefined,
    basicFormData?:Object | undefined,
    envFormData?:Object | undefined,
    moreFormData?:Object | undefined,
    isYamlFormat?:boolean
}