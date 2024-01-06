import { ClaimReceipt } from "@/types";

export const getFaucetListServer = async () => {
  const chainsApi = await fetch(
    process.env.NEXT_PUBLIC_API_URL! + "/api/gastap/faucet/list/",
    {
      cache: "no-store",
    }
  );

  console.log(chainsApi.status);

  return chainsApi.json();
};

export const getClaimedReceiptsServer = async (token?: string) => {
  if (!token) return [];

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL! + "/api/gastap/user/claims/",
    {
      cache: "no-store",
      headers: {
        Authorization: `token ${token}`,
      },
    }
  ).then((res) => res.json());

  if (!Array.isArray(res)) return [];

  return res as ClaimReceipt[];
};

export const getOneTimeClaimedReceiptsServer = async (token?: string) => {
  if (!token) return [];

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_URL! + "/api/gastap/user/one-time-claims/",
    {
      cache: "no-store",
      headers: {
        Authorization: `token ${token}`,
      },
    }
  ).then((res) => res.json());

  if (!Array.isArray(res)) return [];

  return res as ClaimReceipt[];
};
