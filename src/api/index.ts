import { Chain, UserProfile } from '../types';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '' : 'http://168.119.127.117:4549/',
});

export async function getChainList(address: string | undefined | null) {
  const url = address ? `/api/v1/chain/list/${address}` : '/api/v1/chain/list/';
  const response = await axiosInstance.get<Chain[]>(url);
  return response.data;
}

export async function getUserProfile(address: string) {
  const response = await axiosInstance.get<UserProfile>(`/api/v1/user/${address}/`);
  return response.data;
}

export async function createUserProfile(address: string) {
  const response = await axiosInstance.post<UserProfile>(`/api/v1/user/create/`, { address });
  return response.data;
}

export async function claimMax(address: string, chainPk: number) {
  const url = `/api/v1/chain/${chainPk}/claim-max/${address}`;
  const response = await axiosInstance.post<void>(url, {});
  return response.data;
}