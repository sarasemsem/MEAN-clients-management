export interface EmailDTO{
    emailId: string,
    sender:string,
    subject:string,
    originalContent:String,
    content:string,
    date:string,
    isRead: boolean,
    treated:boolean,
    isSelected?:boolean,
    urgent?:boolean,
    important:boolean,
    draft:boolean,
    spam:boolean,
    archived:boolean,
    contact ?:SenderDTO ,
    result?: EmailProcessingResultDto,
    relatedData:RelatedDataDto,
    relatedAction: ActionDto,
    attachments ?:AttachmentDto[],

}
export interface RelatedDataDto{
    relatedDataId : string,
    account_number: string,
    account_type:string,
    period : string ;
    amount ?: string,
    currency : string ;
    recipient_account ?: string,
}
export interface EmailProcessingResultDto{
    proposedCategories : CategoryDTO[],
    selectedCategories: CategoryDTO[],
    foundKeywords:keywordDto [],
    score : number ;
    action ?: ActionDto[],
}
export interface UserDTO{
    userId: string;
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    activated: boolean;
    imageUrl: string;
    phoneNbr: string;
    password: string;
    roles: SecurityRoleDto[];
}
export interface createdByDTO{
    userId: string;
    login?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    activated?: boolean;
    imageUrl?: string;
}
export interface SecurityRoleDto{
    roleId :string , 
    roleName :string ,
    description :string ,
}
export interface SenderDTO{
    senderId :string , 
    firstName :string ,
    lastName :string ,
    gender: string;
    senderEmail :string ,
    phoneNbr :string ,
    rib :string ,
    iban :string ,
    address :string ,
    priority : number ,
}
export interface ActionParams {
    field: string;
  }
export interface CategoryDTO{
    categoryId :string , 
    title :string ,
    description ?:string ,
    keywords?: string[],
    action?: ActionDto,
}

export interface keywordDto{
    keywordId :string , 
    word :string ,
    createdBy ?: createdByDTO ,
    categories?: CategoryDTO[],
    weight ?: number,
    translatedKeywords?: TranslatedKeyword[];
}
export interface AttachmentDto{
    attachmentId :string , 
    fileName :string ,
    fileId ?: string ,
    fileContent ?: string ,   
}

export interface ActionDto{
    actionId :string , 
    action :string ,
    descriptionAct ?: string ,
    actionDate?: Date,
    updatedAt ?: Date , 
    updatedBy?: createdByDTO ,
    affected ?:boolean ,
    state:boolean,
    endPoint:string,
    params: string[],
    
}
export interface TranslatedKeyword{
    tkeywordId :string , 
    wordTranslated :string ,
    language ?: Language ,
}
export enum Language {
    FRENCH = 'FRENCH',
    ENGLISH = 'ENGLISH',
    SPANISH = 'SPANISH',
  }
