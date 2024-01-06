"use client";

import Icon from "@/components/ui/Icon";
import { usePrizeTapContext } from "@/context/prizeTapProvider";
import { useMemo, useState } from "react";
import { WalletWinner } from "../Linea/LineaWinnersModal";
import { useWalletAccount } from "@/utils/wallet";
import { shortenAddress } from "@/utils";
import UButton from "@/components/ui/Button/UButton";
import { WinnerEntry } from "@/types";
import { Address, isAddressEqual } from "viem";
import { useGlobalContext } from "@/context/globalProvider";

export const getRaffleEntry = (
  entryWallets: WinnerEntry[],
  userWallet?: Address
) => {
  return (
    !!userWallet &&
    entryWallets.find((entry) => isAddressEqual(entry.wallet, userWallet))
  );
};

const WinnersModal = () => {
  const [searchPhraseInput, setSearchPhraseInput] = useState("");

  const { selectedRaffleForEnroll } = usePrizeTapContext();

  const { address, isConnected } = useWalletAccount();

  const { setIsWalletPromptOpen } = useGlobalContext();

  const enrollment = useMemo(
    () => getRaffleEntry(selectedRaffleForEnroll!.winnerEntries, address),
    [selectedRaffleForEnroll, address]
  );

  const userEnrollments = useMemo(() => {
    const items = !searchPhraseInput
      ? selectedRaffleForEnroll?.winnerEntries
      : selectedRaffleForEnroll?.winnerEntries.filter((item) =>
          item.wallet
            .toLocaleLowerCase()
            .includes(searchPhraseInput.toLocaleLowerCase())
        );

    return items ?? [];
  }, [searchPhraseInput]);

  if (!selectedRaffleForEnroll) return null;

  return (
    <>
      <p className="text-xs w-full px-4 text-gray90">Winners</p>
      <div className="flex bg-gray50 p-4 py-3.5 border-2 rounded-xl !border-gray30 items-center w-full mt-1">
        <Icon
          className="mr-5"
          iconSrc="assets/images/modal/search-icon.svg"
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
            raffle={selectedRaffleForEnroll.pk}
          />
        ))}

        {searchPhraseInput && !userEnrollments.length && (
          <p className="text-white">No users found</p>
        )}
      </div>
      <div className="w-full">
        {!isConnected ? (
          <div className="flex px-5 py-3 border-2 border-gray70 rounded-xl mt-5 bg-gray20 items-center text-white">
            <p className="text-gray80 text-base">0xYour...Wallet</p>
            <UButton
              onClick={() => setIsWalletPromptOpen(true)}
              size="small"
              className="gradient-outline-button text-xs ml-auto font-semibold bg-g-primary before:inset-[1px] text-gray100 text-center px-3 py-[6px]"
            >
              <p className="bg-clip-text bg-g-primary text-transparent">
                Connect Wallet
              </p>
            </UButton>
          </div>
        ) : enrollment ? (
          <div className="flex px-5 py-4 rounded-xl mt-5 bg-gray20 items-center text-white">
            {shortenAddress(enrollment.wallet)}

            <button className="ml-auto text-xs border-mid-dark-space-green border-2 rounded-lg bg-dark-space-green px-2 text-space-green flex items-center gap-1 py-1">
              Winner <span className="ml-1">&#x1F604;&#xfe0f;</span>
            </button>
          </div>
        ) : (
          <div className="flex px-5 py-4 rounded-xl mt-5 bg-gray20 items-center text-white">
            {shortenAddress(address) ?? ""}

            <button className="ml-auto text-xs border-[#A13744] border rounded-lg bg-[#2C2228] px-4 text-error flex items-center gap-1 py-1">
              Not a Winner &#x1F61F;
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WinnersModal;
