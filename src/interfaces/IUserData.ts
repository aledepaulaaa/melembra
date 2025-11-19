//bora-app/src/interfaces/IUserData.ts
export interface IUserData {
    name: string
    whatsappNumber: string
    email: string
    password?: string
    avatar?: string
}

export const initialUser: IUserData = {
    name: '',
    whatsappNumber: '',
    email: '',
    password: '',
    avatar: '/logo_melembra_light.svg'
}