//melembra/src/interfaces/IUserData.ts
export interface IUserData {
    name: string
    nickname: string
    whatsappNumber: string
    email: string
    password?: string
    avatar?: string
}

export const initialUser: IUserData = {
    name: '',
    nickname: '',
    whatsappNumber: '',
    email: '',
    password: '',
    avatar: '/logo_melembra_light.svg'
}