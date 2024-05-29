"use client";

import Lottie from "react-lottie";
import AddNftIdListModal from "./AddNftIdListModal";
interface Prop {
  showErrors: boolean;
  isRightChain: boolean;
}

import { loadAnimationOption } from "@/constants/lottieCode";
import { useTokenTapFromContext } from "@/context/providerDashboardTokenTapContext";
import Icon from "@/components/ui/Icon";
import { ZERO_ADDRESS, tokensInformation } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { ContractValidationStatus, TokenOnChain } from "@/types";
import { useOutsideClick } from "@/utils/hooks/dom";
import { zeroAddress } from "viem";
import { fromWei } from "@/utils";
import { useBalance } from "wagmi";
import { useWalletNetwork } from "@/utils/wallet";

const SelectTokenOrNft = ({ showErrors, isRightChain }: Prop) => {
  const {
    data,
    handleSelectTokenOrNft,
    handleSelectNativeToken,
    handleChange,
    openAddNftIdListModal,
    isShowingDetails,
    handleClearNfts,
    insufficientBalance,
    tokenContractStatus,
    nftContractStatus,
    numberOfNfts,
    setNumberOfNfts,
    selectedToken,
    userBalance,
    setData,
    setSelectedToken,
    tokenName,
    setTokenName
  } = useTokenTapFromContext();

  const isTokenFieldDisabled =
    isShowingDetails ||
    // data.isNativeToken ||
    !data.selectedChain ||
    tokenContractStatus.checking ||
    !isRightChain ||
    isShowingDetails;

  const isNftFieldDisabled =
    isShowingDetails ||
    !data.selectedChain ||
    nftContractStatus.checking ||
    !isRightChain ||
    data.nftTokenIds.length > 0;

  const isAmountFieldsDisabled =
    isShowingDetails ||
    tokenContractStatus.checking ||
    tokenContractStatus.isValid === ContractValidationStatus.NotValid ||
    tokenContractStatus.isValid === ContractValidationStatus.Empty ||
    !data.tokenContractAddress;

  const totalAmountError =
    data.tokenAmount && insufficientBalance ||
    (showErrors && (!data.totalAmount || Number(data.totalAmount) <= 0));

  const tokenAddressError =
    (showErrors && !data.tokenContractAddress) ||
    tokenContractStatus.isValid === ContractValidationStatus.NotValid;

  const nftAddressError =
    (showErrors && !data.nftContractAddress) ||
    nftContractStatus.isValid === ContractValidationStatus.NotValid;

  const nftNumberFieldDisabled =
    isShowingDetails ||
    !data.selectedChain ||
    nftContractStatus.checking ||
    !isRightChain ||
    !data.nftContractAddress;

  const [tokenList, setTokenList] = useState<TokenOnChain[] | null>(null);
  const { chain } = useWalletNetwork();
  useEffect(() => {
    if (data.selectedChain) {
      let list = tokensInformation.find(item => item.chainId === data.selectedChain.chainId)?.tokenList
      setTokenList(list!)
      if (Number(data.selectedChain.chainId) !== Number(chain!.id)) {
        setSelectedToken(null);
        setData((prev: any) => ({ ...prev, tokenContractAddress: '' }))
        setTokenName('')

      }
    }
    else {
      setTokenList(null)
    }
  }, [data.selectedChain])

  useEffect(() => {
    if (!data.selectedChain) return;
    let list = tokensInformation.find(item => item.chainId === data.selectedChain.chainId)?.tokenList
    if (tokenName && tokenName.substring(0, 2) != "0x" && data.selectedChain && selectedToken?.tokenSymbol !== tokenName) {

      let filteredList = list?.filter((item) => item.tokenSymbol.toLowerCase().includes(tokenName.toLowerCase()))
      setTokenList(filteredList!)

    }
    else {
      setTokenList(list!)
    }
  }, [tokenName])

  const handleSetTokenAddress = (item: TokenOnChain) => {
    setSelectedToken(item)
    setShowItems(false)
    setTokenName(item.tokenSymbol)
    setData((prevData: any) => ({
      ...prevData,
      isNativeToken: item.tokenAddress === zeroAddress,
      tokenContractAddress: item.tokenAddress,
      decimal: item.tokenAddress === zeroAddress ? 18 : null,
      tokenSymbol: item.tokenSymbol
    }));
  }

  const handleCheckTokenAddress = (address: string) => {
    setTokenName(address)
    if (!address) {
      setData((prev: any) => ({ ...prev, tokenContractAddress: '' }))
      setSelectedToken(null)
    }
    if (address.substring(0, 2) == "0x" && data.selectedChain) {
      setData((prev: any) => ({ ...prev, tokenContractAddress: address }))
      return
    }
    if (address.substring(0, 2) != "0x") {
      setShowItems(true)
    }

  }


  const handleKeyDown = (event: any) => {
    if (event.key === "-" || event.key === "e") {
      event.preventDefault();
    }
  };
  const [showItems, setShowItems] = useState(false)
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => {
    if (showItems) setShowItems(false);
  });

  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  return (
    <div
      className={
        data.selectedChain && isRightChain ? "w-full" : "opacity-30 w-full"
      }
    >
      <section className="flex text-gray80 text-xs bg-gray30 border border-gray50 rounded-xl h-[43px] items-center w-full max-w-[452px] overflow-hidden">
        <div
          className={`
          ${!data.isNft && "text-white font-medium bg-gray40 border-gray50"}
           flex cursor-pointer items-center justify-center border-r border-r-gray50 w-[50%] h-full `}
          onClick={() => handleSelectTokenOrNft(false)}
        >
          Token
        </div>
        <div
          className={`
          ${data.isNft && "text-white font-medium  bg-gray40 border-gray50"}
           flex cursor-pointer items-center justify-center border-l font-semibold border-l-gray50 w-[50%] h-full text-gray90`}
        // onClick={() => handleSelectTokenOrNft(true)}
        >
          NFT<span className="text-gray100 text-2xs ml-1">(Coming soon...)</span>
        </div>
      </section>
      {!data.isNft ? (
        <div className="flex flex-col gap-5 w-full mt-4">
          <div className="relative">
            <div
              className={`flex text-gray100 text-xs bg-gray40 border-[1.4px] 
              rounded-xl h-[43px] max-w-[452px] overflow-hidden 
              ${tokenAddressError ? "border-error" : "border-gray50"}`}
            >
              <div className={`flex justify-between w-full items-center  cursor-pointer`}
                ref={ref}
                onClick={() => { !isShowingDetails && setShowItems(!showItems) }}>
                <div className="min-w-[50px]">
                  {tokenName && !tokenName.includes('0x') && selectedToken &&
                    <Icon iconSrc={selectedToken?.logoUrl} height="24px" width="24px" />
                  }
                </div>
                <input
                  disabled={isTokenFieldDisabled}
                  name="tokenContractAddress"
                  placeholder="Search or paste token contract address"
                  value={
                    tokenName
                      ? tokenName
                      : ""
                  }
                  autoComplete="off"
                  className="provider-dashboard-input w-full "
                  type="text"
                  onChange={(e) => handleCheckTokenAddress(e.target.value)}
                />
                <div className="flex pr-5">
                  <div className="text-gray100 flex items-center">
                    <span className="h-1 w-1 bg-gray100 mx-2 rounded-full"></span>
                    <span className="mr-1">Balance:</span>
                    {tokenContractStatus.isValid ===
                      ContractValidationStatus.Valid && !tokenContractStatus.checking
                      ? data.tokenContractAddress !== zeroAddress ? fromWei(data.userTokenBalance!, data.tokenDecimals) : userBalance : ''
                    }
                  </div>
                </div>

                <div className="h-full flex items-center justify-center w-[55px]">
                  <Icon

                    iconSrc="/assets/images/provider-dashboard/arrow-top.svg"
                    className={`${showItems ? '' : 'rotate-180'}`}
                    width="12px"
                    height="12px"
                  />
                </div>
                {showItems && tokenList && tokenList.length > 0 && <div className="flex-col bg-gray40 w-full rounded-lg absolute z-[11] left-0 top-[45px] border-gray60 border-2 max-h-40 overflow-y-scroll">
                  {tokenList?.map(((item, index) =>
                    <div key={index} className="flex items-center hover:bg-gray70 pl-2 rounded-lg gap-2" onClick={() => handleSetTokenAddress(item)}>
                      <Icon iconSrc={item.logoUrl} width="24px" height="24px" />
                      <p className="flex items-center text-sm cursor-pointer  h-10 w-full "
                      >{item.tokenSymbol}</p>
                    </div>
                  ))}
                </div>}
              </div>
              {tokenContractStatus.checking && (
                <div className="w-[50px] h-full bg-gray30 p-0 m-0 flex items-center">
                  <Lottie
                    width={45}
                    height={45}
                    options={loadAnimationOption}
                  ></Lottie>
                </div>
              )}
              {tokenContractStatus.isValid ===
                ContractValidationStatus.NotValid && (
                  <div className="w-[70px] h-full bg-gray30 p-0 m-0 flex items-center justify-center">
                    <Icon iconSrc="/assets/images/provider-dashboard/invalidAddress.svg" />
                  </div>
                )}
              {tokenContractStatus.isValid ===
                ContractValidationStatus.Valid && (
                  <div className="w-[70px] h-full bg-gray30 p-0 m-0 flex items-center justify-center">
                    <Icon iconSrc="/assets/images/provider-dashboard/validAddress.svg" />
                  </div>
                )}
            </div>
            {tokenContractStatus.isValid ===
              ContractValidationStatus.NotValid && (
                <p className="text-error text-2xs m-0 p-0 mt-[2px] absolute ">
                  Invalid Token Contract Address
                </p>
              )}

            {showErrors && !data.tokenContractAddress && (
              <p className="text-error text-2xs m-0 p-0 mt-[2px] absolute left-1">
                Required
              </p>
            )}
          </div>

          <div className="relative total_amount_box">
            <div
              className={`relative border-2  p-5 rounded-2xl ${totalAmountError ? "border-error" : "border-gray50"
                } `}
            >
              <div
                className={`flex gap-2 text-gray100 text-xs bg-gray40 border-gray50 border-2 rounded-xl h-[43px] pr-4 items-center justify-between overflow-hidden w-full max-w-[452px]`}
              >
                <div className="bg-gray30 flex h-full w-full max-w-[148px] items-center justify-center text-center">
                  Number of claims
                </div>
                <input
                  name="winnersCount"
                  value={data.winnersCount}
                  className="provider-dashboard-input"
                  type="text"
                  inputMode="numeric"
                  onChange={handleChange}
                  min={1}
                  max={500}
                  disabled={isAmountFieldsDisabled}
                  step={1}
                  pattern="[0-9]"
                />
              </div>
              <Icon
                iconSrc="/assets/images/provider-dashboard/cross.png"
                height="16px"
                width="16px"
                className="py-2"
              />
              <div
                className={`flex gap-2 text-gray100 text-xs bg-gray40 border border-gray50 rounded-xl h-[43px] pr-4 items-center justify-between overflow-hidden w-full max-w-[452px]`}
              >
                <div className="bg-gray30 flex h-full w-full max-w-[148px] items-center justify-center text-center">
                  <p>Amount per claim</p>
                </div>
                <input
                  disabled={isAmountFieldsDisabled}
                  onChange={handleChange}
                  value={data.tokenAmount}
                  name="tokenAmount"
                  className="provider-dashboard-input"
                  type="number"
                  min={0}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Icon
                iconSrc="/assets/images/provider-dashboard/equal.svg"
                height="16px"
                width="16px"
                className="py-2"
              />
              <div
                className={`flex gap-2 text-gray100 opacity-50 text-xs bg-gray40 border border-gray50 rounded-xl h-[43px] pr-4 items-center justify-between overflow-hidden w-full max-w-[452px]`}
              >
                <div className="bg-gray30 flex h-full w-full max-w-[148px] items-center justify-center text-center">
                  <p>Total Amount</p>
                </div>
                <input
                  disabled={true}
                  value={data.totalAmount}
                  name="totalAmount"
                  className="provider-dashboard-input"
                  type="number"
                />
              </div>
            </div>

            {showErrors &&
              (!data.totalAmount || Number(data.totalAmount) <= 0) ? (
              <p className="text-error text-2xs mt-[2px] m-0 p-0 absolute -bottom-4">
                Required
              </p>
            )
              // : Number(data.winnersCount) > 500 ? (
              //   <p className="text-error text-2xs mt-[2px] m-0 p-0 absolute -bottom-4">
              //     The maximum number of winners is 500.
              //   </p>
              // )
              : (
                data.tokenAmount && insufficientBalance && (
                  <p className="text-error text-2xs mt-[2px] m-0 p-0 absolute -bottom-4">
                    Insufficient Balance
                  </p>
                )
              )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full mt-5">
          <div className="relative">
            <div
              className={`
							 flex text-gray80 text-xs bg-gray40 border-[1.4px] ${nftAddressError ? "border-error" : "border-gray50"
                } ${data.nftTokenIds.length >= 1 ? "opacity-[0.5]" : "opacity-1"
                } rounded-xl h-[43px]  max-w-[452px] overflow-hidden`}
            >
              <div className="bg-gray30 flex h-full w-full max-w-[148px] items-center text-center justify-center">
                <p>NFT Contract address</p>
              </div>
              <div className="w-full max-w-[254px] overflow-hidden px-2">
                <input
                  disabled={isNftFieldDisabled}
                  name="nftContractAddress"
                  placeholder="paste here"
                  value={data.nftContractAddress ? data.nftContractAddress : ""}
                  className="provider-dashboard-input w-full "
                  type="text"
                  onChange={handleChange}
                />
              </div>
              {nftContractStatus.checking && (
                <div className="w-[50px] h-full bg-gray30 p-0 m-0 flex items-center">
                  <Lottie
                    width={45}
                    height={45}
                    options={loadAnimationOption}
                  ></Lottie>
                </div>
              )}
              {nftContractStatus.isValid ===
                ContractValidationStatus.NotValid && (
                  <div className="w-[70px] h-full bg-gray30 p-0 m-0 flex items-center justify-center">
                    <Icon iconSrc="/assets/images/provider-dashboard/invalidAddress.svg" />
                  </div>
                )}
              {nftContractStatus.isValid === ContractValidationStatus.Valid && (
                <div className="w-[70px] h-full bg-gray30 p-0 m-0 flex items-center justify-center">
                  <Icon iconSrc="/assets/images/provider-dashboard/validAddress.svg" />
                </div>
              )}
            </div>
            {showErrors && !data.nftContractAddress && (
              <p className="text-error text-2xs m-0 p-0 mt-[2px] absolute left-1">
                Required
              </p>
            )}
            {nftContractStatus.isValid ===
              ContractValidationStatus.NotValid && (
                <p className="text-error text-2xs m-0 p-0 mt-[2px] absolute ">
                  Invalid NFT Contract Address
                </p>
              )}
          </div>

          <div className="relative mt-1">
            <div className={`tooltip ${showTooltip ? "flex" : "hidden"}`}>
              <div className="absolute flex items-center justify-center -right-6 z-100 rounded-sm -top-4 w-[100px] h-[20px] text-xs bg-gray100">
                tooltip message
              </div>
              <div className="absolute w-[5px] h-[5px] right-6 rotate-45 top-[1px]  bg-green-100"></div>
            </div>
            <div
              className={`
							 flex text-gray80 text-xs bg-gray40 border ${Number(numberOfNfts) > 500 ||
                  (data.nftTokenIds.length > 0 &&
                    data.nftTokenIds.length != Number(numberOfNfts))
                  ? "border-error"
                  : "border-gray50"
                } rounded-xl h-[43px]  max-w-[452px] overflow-hidden items-center justify-between pr-4`}
            >
              <div className="bg-gray30 flex h-full w-full max-w-[148px] items-center text-center justify-center">
                <p>Number of Nfts</p>
              </div>
              <div className="w-full max-w-[254px] overflow-hidden px-2 h-full">
                <input
                  disabled={nftNumberFieldDisabled}
                  name="NumberOfNfts"
                  placeholder="Number Of Nfts"
                  value={numberOfNfts}
                  className="provider-dashboard-input w-full h-full"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  onChange={(e) =>
                    setNumberOfNfts(e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>
              <div className="min-w-[20px] relative">
                <Icon
                  iconSrc="/assets/images/provider-dashboard/exclamation.svg"
                  className="cursor-pointer"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
              </div>
              {Number(numberOfNfts) > 500 && (
                <p className="absolute text-error text-2xs m-0 p-0 -bottom-4 left-0">
                  Maximum is 500
                </p>
              )}
            </div>
            {data.nftTokenIds.length > 0 &&
              data.nftTokenIds.length != Number(numberOfNfts) && (
                <p className="absolute text-error text-2xs m-0 p-0 -bottom-4 left-0">
                  Number of NFTs are not equal with Number of NFts you added.
                </p>
              )}
          </div>
          {data.nftTokenIds.length > 0 ? (
            <div className="flex relative justify-between items-center mt-[4px] bg-gray50 border max-h-[44px] border-gray60 rounded-xl p-2 px-5">
              <div className="text-white text-xs">
                <p>{data.nftTokenIds.length} NFT ID added</p>
                <div className="flex text-gray90 text-2xs">
                  <p>
                    {data.nftTokenIds.length > 1
                      ? data.nftTokenIds.join(", ")
                      : data.nftTokenIds}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openAddNftIdListModal()}
                  className="text-gray90 text-2xs w-[60px] h-[20px] rounded bg-gray70 border border-gray80 flex items-center justify-center"
                >
                  Edit
                </button>
                <Icon
                  className="cursor-pointer"
                  iconSrc="/assets/images/modal/exit.svg"
                  onClick={() => handleClearNfts()}
                />
              </div>
            </div>
          ) : (
            <div className="relative mt-[4px]">
              <div
                onClick={() => {
                  if (!numberOfNfts) return;
                  openAddNftIdListModal();
                }}
                className={`flex text-white text-xs ${nftContractStatus.isValid ===
                  ContractValidationStatus.NotValid ||
                  !numberOfNfts ||
                  Number(numberOfNfts) > 500
                  ? "opacity-[0.4]"
                  : "cursor-pointer"
                  } ${data.nftTokenIds.length == 0 && showErrors
                    ? "border-error"
                    : "border-gray50"
                  } bg-gray40 border  rounded-xl h-[44px] items-center  overflow-hidden w-full max-w-[452px]`}
              >
                <div className="flex h-full w-full max-w-[148px] items-center gap-2 p-3">
                  <Icon
                    width="16px"
                    height="16px"
                    iconSrc="/assets/images/provider-dashboard/add-requirement.svg"
                  />
                  <p>Add NFT ID</p>
                </div>
              </div>
              {data.nftTokenIds.length == 0 && showErrors && (
                <p className="absolute text-error text-2xs m-0 p-0 mt-[2px] ml-1">
                  Required
                </p>
              )}
            </div>
          )}
        </div>
      )
      }
      <AddNftIdListModal />
    </div >
  );
};

export default SelectTokenOrNft;
