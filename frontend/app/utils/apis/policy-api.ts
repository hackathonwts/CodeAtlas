import { IPolicy } from '@/interfaces/policy.interface';
import { get } from '../axios/axios.helpers';

export const getAllPoliciesApi = () => get<IPolicy[]>('/policy');
