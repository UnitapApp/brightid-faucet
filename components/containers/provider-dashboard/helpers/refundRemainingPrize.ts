import {
  GetContractReturnType,
  PublicClient,
  getContract,
  Address,
} from "viem";

import { prizeTapAbi } from "@/types/abis/contracts";
import { GetWalletClientReturnType } from "wagmi/actions";
import { contractAddresses } from "@/constants";

export const refundRemainingPrizeCallback = async (
  address: Address,
  erc20Contract: GetContractReturnType,
  provider: PublicClient,
  signer: GetWalletClientReturnType,
  raffleId: bigint,
  setRefundRes: any,
  hasWinner: boolean,
) => {
  const response = await signer?.writeContract({
    abi: prizeTapAbi,
    address: erc20Contract.address,
    account: address,
    functionName: hasWinner ? "refundRemainingPrizes" : "refundPrize",
    args: [raffleId],
  });

  if (response) {
    const res = await provider.waitForTransactionReceipt({
      hash: response,
      confirmations: 1,
    });

    setRefundRes({
      success: true,
      state: "Done",
      txHash: res.transactionHash,
      message: "Token claimed successfully.",
    });

    return;
  } else {
    setRefundRes({
      success: false,
      state: "Retry",
      message: "Token claimed successfully.",
    });
  }

  return;
};

export const refundRemainingPrize = async (
  provider: PublicClient,
  signer: GetWalletClientReturnType,
  address: Address,
  chainId: number,
  raffleId: string,
  setRefundRes: any,
  hasWinner: boolean,
) => {
  if (!provider || !signer) return;
  const contract = getContract({
    abi: prizeTapAbi,
    address: contractAddresses.prizeTap[chainId].erc20 as `0x${string}`,
    client: provider,
  });

  try {
    const response = await refundRemainingPrizeCallback(
      address,
      contract,
      provider,
      signer,
      BigInt(raffleId),
      setRefundRes,
      hasWinner,
    );
    return response;
  } catch (e: any) {
    console.log(e);
  }
};
