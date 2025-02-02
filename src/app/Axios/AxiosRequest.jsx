import axios from 'axios';

export const AxiosRequest = axios.create({
    baseURL: 'http://192.168.100.21:8000'
});
