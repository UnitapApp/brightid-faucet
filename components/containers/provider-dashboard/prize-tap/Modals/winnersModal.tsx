"use client";

import Icon from "@/components/ui/Icon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { usePrizeOfferFormContext } from "@/context/providerDashboardContext";
import { WalletWinner } from "@/components/containers/prize-tap/Linea/LineaWinnersModal";
import Modal from "@/components/ui/Modal/modal";
import { prizeTap721ABI, prizeTapABI } from "@/types/abis/contracts";
import { readContracts } from "wagmi";
import { CSVLink } from "react-csv";

const WinnersModalBody = () => {
  const [searchPhraseInput, setSearchPhraseInput] = useState("");
  const [enrollmentWallets, setEnrollmentWallets] = useState<[]>([]);

  const { winnersResultRaffle } = usePrizeOfferFormContext();

  const exportEnrollmentWallets = useCallback(async () => {
    const isNft = winnersResultRaffle!.isPrizeNft;
    const raffleId = Number(winnersResultRaffle!.raffleId);
    const entriesNumber = winnersResultRaffle!.numberOfOnchainEntries;
    const contracts = [];

    for (let i = 0; i <= entriesNumber / 100; i++) {
      contracts.push({
        abi: isNft ? prizeTap721ABI : prizeTapABI,
        address: winnersResultRaffle!.contract as Address,
        functionName: "getParticipants",
        args: [BigInt(raffleId), BigInt(i * 100), BigInt(i * 100 + 100)],
        chainId: Number(winnersResultRaffle?.chain.chainId ?? 1),
      });
    }

    const data = await readContracts({
      contracts,
    });

    const allWallet = (data.map((item) => item.result) as any)
      .flat(2)
      .map((item: string) => {
        return {
          wallet: item,
        };
      });
    setEnrollmentWallets(allWallet);
  }, [winnersResultRaffle]);

  const userEnrollments = useMemo(() => {
    const items = !searchPhraseInput
      ? winnersResultRaffle?.winnerEntries
      : winnersResultRaffle?.winnerEntries?.filter((item) =>
          item.wallet
            .toLocaleLowerCase()
            .includes(searchPhraseInput.toLocaleLowerCase())
        ) ?? [];

    return items ?? [];
  }, [searchPhraseInput, winnersResultRaffle?.winnerEntries]);

  useEffect(() => {
    exportEnrollmentWallets();
  }, [exportEnrollmentWallets]);

  if (!winnersResultRaffle) return null;

  return (
    <>
      <p className="text-xs w-full px-4 text-gray90">Winners</p>
      <div className="flex bg-gray50 p-4 py-3.5 border-2 rounded-xl !border-gray30 items-center w-full mt-1">
        <Icon
          className="mr-5"
          iconSrc="/assets/images/modal/search-icon.svg"
          width="20px"
          height="20px"
        />
        <input
          className="bg-transparent placeholder:text-gray90 text-white w-full z-1"
          value={searchPhraseInput}
          onChange={(e) => setSearchPhraseInput(e.target.value)}
          placeholder="Search Wallet"
        />
      </div>

      <div className="mt-4 h-72 text-sm styled-scroll w-full overflow-auto">
        {userEnrollments.map((item, key) => (
          <WalletWinner
            id={item.pk}
            walletAddress={item.wallet}
            isWinner
            claimTx={item.txHash}
            key={key}
            raffle={winnersResultRaffle.pk}
          />
        ))}

        {searchPhraseInput && !userEnrollments.length && (
          <p className="text-white">No users found</p>
        )}
      </div>
      <div className="w-full flex justify-end">
        <CSVLink
          className="bg-gray40 rounded-lg p-2 border border-gray50 hover:bg-gray50"
          filename={`${winnersResultRaffle.prizeName}_raffleEntry_wallets.csv`}
          data={enrollmentWallets}
          target="_blank"
        >
          export
        </CSVLink>
      </div>
    </>
  );
};

const WinnersModal = () => {
  const { winnersResultRaffle, handleWinnersResult } =
    usePrizeOfferFormContext();

  return (
    <Modal
      isOpen={!!winnersResultRaffle}
      closeModalHandler={() => handleWinnersResult(null)}
      className="provider-dashboard__modal"
    >
      <WinnersModalBody />
    </Modal>
  );
};

export default WinnersModal;
