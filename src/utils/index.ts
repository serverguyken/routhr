import { v4 as uuid } from 'uuid';

export const generateId = () => { 
    return 'ru' + uuid().substring(0, 4);
};