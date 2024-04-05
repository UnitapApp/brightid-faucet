import { Competition, CompetitionStatus } from "@/types";

export const fetchQuizApi = async (id: number): Promise<Competition> => {
  return {
    chain: {
      pk: 17,
      chainName: "Rootstock Mainnet",
      chainId: "30",
      nativeCurrencyName: "RBTC",
      symbol: "RBTC",
      decimals: 18,
      explorerUrl: "https://explorer.rsk.co",
      rpcUrl: "https://public-node.rsk.co",
      logoUrl:
        "https://chainlist.wtf/static/cb755722e5ced5bf0e423f70021b91d9/179cd/rootstock.webp",
      modalUrl:
        "https://chainlist.wtf/static/cb755722e5ced5bf0e423f70021b91d9/179cd/rootstock.webp",
      isTestnet: false,
      chainType: "EVM",
    },
    createdAt: "2024-04-05T09:05:52.331Z",
    startAt: "2024-04-07T09:17:52.331Z",
    isActive: true,
    prizeAmount: 200000,
    restTimeSeconds: 10,
    status: CompetitionStatus.HOLDING,
    token: "MATIC",
    tokenAddress: "0xb3A97684Eb67182BAa7994b226e6315196D8b364",
    userProfile: {
      initial_context_id: "-13123",
      isAuraVerified: true,
      isMeetVerified: true,
      pk: 1,
      token: "",
      username: "alimak",
      wallets: [],
    },
    detail: "Get ready for a fun ride into the future",
  };
};
