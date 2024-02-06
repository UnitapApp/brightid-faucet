import { PublicClient, erc721Abi } from "viem";

//check erc721 collection address

export const checkCollectionAddress = async (
  provider: PublicClient,
  collectionAddress: string,
  chainId: number
) => {
  if (!provider) return;

  const contracts = [
    {
      abi: erc721Abi,
      address: collectionAddress as any,
      functionName: "name",
      chainId: chainId,
    },
    {
      abi: erc721Abi,
      address: collectionAddress as any,
      functionName: "symbol",
      chainId: chainId,
    },
    {
      abi: erc721Abi,
      address: collectionAddress as any,
      functionName: "ownerOf",
      args: [1n],
      chainId: chainId,
    },
  ];

  const data = await provider.multicall({
    contracts,
  });

  const res = data.filter((item) => item.status === "success");

  return res.length === 3;
};
