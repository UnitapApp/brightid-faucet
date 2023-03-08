import { Chain, ClaimReceipt, UserProfile } from 'types';
import axios from 'axios';
import { getLastMonday } from 'utils';

const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '' : process.env.REACT_APP_API_URL,
});

export async function getChainList() {
  const response = await axiosInstance.get<Chain[]>('/api/v1/chain/list/');
  return response.data;
}

export async function getUserProfile(address: string, signature: string) {
  const response = await axiosInstance.post<UserProfile>(`/api/test/user/login/`, { username: address, password: signature});
  return response.data;
}

export async function createUserProfile(address: string) {
  const response = await axiosInstance.post<UserProfile>(`/api/v1/user/create/`, { address });
  return response.data;
}

export async function claimMax(address: string, chainPk: number) {
  const url = `/api/v1/chain/${chainPk}/claim-max/${address}/`;
  const response = await axiosInstance.post<ClaimReceipt>(url, {});
  return response.data;
}

export async function getActiveClaimHistory(address: string) {
  const date = new Date();
  const lastMonday = getLastMonday(date).toISOString();
  const url = `/api/v1/user/${address}/claims?datetime__gte=${lastMonday}`;
  const response = await axiosInstance.get<ClaimReceipt[]>(url, {});
  return response.data;
}

export async function getUserProfileWithTokenAPI(token: string) {
  const response = await axiosInstance.get<UserProfile>(`/api/test/user/info/`, {
    headers: {
      'Authorization': `Token ${token}`,
    }
  });
  return response.data;
}

export async function getWeeklyChainClaimLimitAPI(token: string) {
  const response = await axiosInstance.get<number>('/api/v1/settings/', {
    headers: {
      'Authorization': `Token ${token}`,
    }
  })
  return response.data;
}