import { request } from 'umi'

type LoginData = {
    username: string;
    password: string;
}

type RegistData = {
    username: string;
    password: string;
    password_repeat: string;
}

export const userLogin = (data: LoginData) => request(`/api/auth/login/`, { data, method: 'post' })

export const userRegist = (data: RegistData) => request(`/api/auth/register/`, { data, method: 'post' })