export type OwnershipCondition = 'own' | 'any'

export interface IPolicy {
    _id: string
    action: string
    subject: string
    fields?: string[]
    conditions?: any
    inverted?: boolean
    reason?: string
}

export interface IPolicyConditions {
    ownership?: OwnershipCondition
    [resourceField: string]: 
        | 'own' 
        | string 
        | number 
        | boolean 
        | Array<string | number | boolean> 
        | undefined
}
