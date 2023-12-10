"use client";

import {
  Chain,
  ConstraintParamValues,
  ConstraintProps,
  ContractStatus,
  ErrorObjectProp,
  NftStatusProp,
  ProviderDashboardFormDataProp,
  UserRafflesProps,
} from "@/types";
import { fromWei, toWei } from "@/utils/numbersBigNumber";
import {
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useUserProfileContext } from "./userProfile";
import {
  useWalletAccount,
  useWalletBalance,
  useWalletNetwork,
  useWalletProvider,
  useWalletSigner,
} from "@/utils/wallet";
import { getErc721TokenContract } from "@/components/containers/provider-dashboard/helpers/getErc721NftContract";
import { getErc20TokenContract } from "@/components/containers/provider-dashboard/helpers/getErc20TokenContract";
import { isAddress } from "viem";
import { FAST_INTERVAL, ZERO_ADDRESS } from "@/constants";
import {
  getConstraintsApi,
  getProviderDashboardValidChain,
  getUserRaffles,
} from "@/utils/api";
import { createErc721Raffle } from "@/components/containers/provider-dashboard/helpers/createErc721Raffle";
import { createErc20Raffle } from "@/components/containers/provider-dashboard/helpers/createErc20Raffle";
import { approveErc721Token } from "@/components/containers/provider-dashboard/helpers/approveErc721Token";
import { approveErc20Token } from "@/components/containers/provider-dashboard/helpers/approveErc20Token";
import { checkNftsAreValid } from "@/components/containers/provider-dashboard/helpers/checkAreNftsValid";
import { useRefreshWithInitial } from "@/utils/hooks/refresh";
import { checkSocialMediaValidation } from "@/components/containers/provider-dashboard/helpers/checkSocialMediaValidation";

const formInitialData: ProviderDashboardFormDataProp = {
  provider: "",
  description: "",
  isNft: false,
  isNativeToken: false,
  tokenAmount: "",
  tokenContractAddress: "",
  nftContractAddress: "",
  nftTokenIds: [],
  selectedChain: null,
  startTimeStamp: null,
  endTimeStamp: null,
  limitEnrollPeopleCheck: false,
  maxNumberOfEntries: null,
  email: "",
  twitter: "",
  discord: "",
  telegram: "",
  creatorUrl: "",
  necessaryInfo: "",
  satisfy: "satisfyAll",
  allowListPrivate: false,
  setDuration: false,
  numberOfDuration: 0,
  durationUnitTime: "Month",
  NftSatisfy: false,
  decimal: null,
  tokenName: null,
  tokenSymbol: null,
  tokenDecimals: null,
  userTokenBalance: undefined,
  nftName: null,
  nftSymbol: null,
  userNftBalance: undefined,
  nftTokenUri: null,
  winnersCount: 1,
  totalAmount: "",
};

const title = {
  0: "Prize Info",
  1: "Time Limitation",
  2: "Requirements",
  4: "Contact Info",
  5: "Deposit Prize",
  6: "Information Verification",
};

const errorMessages = {
  required: "Required",
  invalidFormat: "Invalid Format",
  startTimeDuration: "The start time must be at least 7 days after now.",
  endDateUnacceptable: "End date is unacceptable.",
  period: "The minimum period is one week.",
  endLessThanStart: "The end time cannot be less than the start time.",
  invalidInput: "Invalid input",
};

export const ProviderDashboardContext = createContext<{
  page: number;
  setPage: (page: number) => void;
  data: ProviderDashboardFormDataProp;
  selectedConstrains: ConstraintProps | null;
  title: any;
  handleChange: (e: any) => void;
  handleSelectTokenOrNft: (e: boolean) => void;
  handleSelectLimitEnrollPeopleCheck: () => void;
  openRequirementModal: () => void;
  openAddNftIdListModal: () => void;
  closeRequirementModal: () => void;
  closeAddNftIdListModal: () => void;
  openCreteRaffleModal: () => void;
  closeCreateRaffleModal: () => void;
  openShowPreviewModal: () => void;
  closeShowPreviewModal: () => void;
  handleSelectConstraint: (constraint: ConstraintProps) => void;
  isModalOpen: boolean;
  selectedConstraintTitle: string | null;
  handleBackToRequirementModal: () => void;
  chainList: Chain[];
  selectedChain: Chain | null;
  setSelectedChain: (chain: Chain) => void;
  chainName: string;
  handleSearchChain: (e: any) => void;
  setChainName: (e: string) => void;
  filterChainList: Chain[];
  setSearchPhrase: (e: string) => void;
  handleSelectChain: (chain: Chain) => void;
  handleSelectSatisfy: (satisfy: string) => void;
  allowListPrivate: boolean;
  handleSelectAllowListPrivate: () => void;
  canGoStepTwo: () => boolean;
  canGoStepThree: () => void;
  canGoStepFive: () => boolean;
  setDuration: boolean;
  handleSetDuration: (e: boolean) => void;
  handleSelectDurationUnitTime: (unit: string) => void;
  selectNewOffer: boolean;
  handleSelectNewOffer: (select: boolean) => void;
  handleGOToDashboard: () => void;
  insertRequirement: (
    requirement: ConstraintParamValues | null,
    id: number,
    name: string,
    title: string,
    isNotSatisfy: boolean
  ) => void;
  requirementList: ConstraintParamValues[];
  deleteRequirement: (id: number) => void;
  updateRequirement: (
    id: number,
    requirements: ConstraintParamValues | null,
    isNotSatisfy: boolean
  ) => void;
  handleSelectNativeToken: (e: boolean) => void;
  handleCreateRaffle: () => void;
  isCreateRaffleModalOpen: boolean;
  createRaffleResponse: any | null;
  createRaffleLoading: boolean;
  handleSetCreateRaffleLoading: () => void;
  isNftContractAddressValid: boolean;
  handleSetDate: (timeStamp: number, label: string) => void;
  handleApproveErc20Token: () => void;
  isErc20Approved: boolean;
  isApprovedAll: boolean;
  approveLoading: boolean;
  constraintsList: ConstraintProps[];
  handleApproveErc721Token: () => void;
  userRaffles: UserRafflesProps[];
  userRafflesLoading: boolean;
  handleGetConstraints: () => void;
  updateChainList: () => void;
  handleCheckForReason: (raffle: UserRafflesProps) => void;
  handleShowUserDetails: (raffle: UserRafflesProps) => void;
  handleAddNftToData: (nftIds: string[]) => void;
  setUploadedFile: (file: any) => void;
  uploadedFile: any;
  isShowingDetails: boolean;
  handleCheckOwnerOfNfts: (nftIds: string[]) => Promise<boolean>;
  nftStatus: NftStatusProp[];
  handleClearNfts: () => void;
  selectedRaffleForCheckReason: UserRafflesProps | null;
  insufficientBalance: boolean;
  userBalance: string | null;
  socialMediaValidation: {
    creatorUrl: boolean;
    twitter: boolean;
    discord: boolean;
    email: boolean;
    telegram: boolean;
  };
  tokenContractStatus: ContractStatus;
  nftContractStatus: ContractStatus;
}>({
  page: 0,
  setPage: () => {},
  data: formInitialData,
  selectedConstrains: null,
  title: {
    ...title,
  },
  handleChange: () => {},
  handleSelectTokenOrNft: () => {},
  handleSelectLimitEnrollPeopleCheck: () => {},
  closeRequirementModal: () => {},
  closeAddNftIdListModal: () => {},
  closeCreateRaffleModal: () => {},
  openRequirementModal: () => {},
  openAddNftIdListModal: () => {},
  openCreteRaffleModal: () => {},
  handleSelectConstraint: () => {},
  isModalOpen: false,
  selectedConstraintTitle: null,
  handleBackToRequirementModal: () => {},
  chainList: [],
  selectedChain: null,
  setSelectedChain: () => {},
  chainName: "",
  handleSearchChain: () => {},
  setChainName: () => {},
  filterChainList: [],
  setSearchPhrase: () => {},
  handleSelectChain: () => {},
  handleSelectSatisfy: () => {},
  allowListPrivate: false,
  handleSelectAllowListPrivate: () => {},
  canGoStepTwo: () => false,
  canGoStepThree: () => {},
  canGoStepFive: () => false,
  setDuration: false,
  handleSetDuration: () => {},
  handleSelectDurationUnitTime: () => {},
  openShowPreviewModal: () => {},
  closeShowPreviewModal: () => {},
  selectNewOffer: false,
  handleSelectNewOffer: () => {},
  handleGOToDashboard: () => {},
  insertRequirement: () => {},
  requirementList: [],
  deleteRequirement: () => {},
  updateRequirement: () => {},
  handleSelectNativeToken: () => {},
  handleCreateRaffle: () => {},
  isCreateRaffleModalOpen: false,
  createRaffleResponse: null,
  createRaffleLoading: false,
  handleSetCreateRaffleLoading: () => {},
  isNftContractAddressValid: false,
  handleSetDate: () => {},
  handleApproveErc20Token: () => {},
  isErc20Approved: false,
  approveLoading: false,
  constraintsList: [],
  isApprovedAll: false,
  handleApproveErc721Token: () => {},
  userRaffles: [],
  userRafflesLoading: false,
  handleGetConstraints: () => {},
  updateChainList: () => {},
  handleCheckForReason: () => {},
  handleShowUserDetails: () => {},
  handleAddNftToData: () => {},
  setUploadedFile: () => {},
  uploadedFile: null,
  isShowingDetails: false,
  handleCheckOwnerOfNfts: async () => false,
  nftStatus: [],
  handleClearNfts: () => {},
  selectedRaffleForCheckReason: null,
  insufficientBalance: false,
  userBalance: null,
  socialMediaValidation: {
    creatorUrl: true,
    twitter: false,
    discord: true,
    email: false,
    telegram: true,
  },
  tokenContractStatus: {
    checking: false,
    isValid: false,
    canDisplayStatus: false,
  },
  nftContractStatus: {
    checking: false,
    isValid: false,
    canDisplayStatus: false,
  },
});

const ProviderDashboard: FC<PropsWithChildren> = ({ children }) => {
  const [requirementList, setRequirementList] = useState<
    ConstraintParamValues[]
  >([]);

  const [selectNewOffer, setSelectNewOffer] = useState<boolean>(false);

  const [searchPhrase, setSearchPhrase] = useState<string>("");

  const [selectedChain, setSelectedChain] = useState<any | null>(null);

  const [chainName, setChainName] = useState<string>("");

  const [page, setPage] = useState<number>(0);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [isCreateRaffleModalOpen, setIsCreateRaffleModalOpen] =
    useState<boolean>(false);

  const [chainList, setChainList] = useState<Chain[]>([]);

  const [isErc20Approved, setIsErc20Approved] = useState<boolean>(false);

  const [allowListPrivate, setAllowListPrivate] = useState<boolean>(false);

  const [tokenContractStatus, setTokenContractStatus] =
    useState<ContractStatus>({
      checking: false,
      isValid: false,
      canDisplayStatus: false,
    });

  const [nftContractStatus, setNftContractStatus] = useState<ContractStatus>({
    checking: false,
    isValid: false,
    canDisplayStatus: false,
  });
  const [insufficientBalance, setInsufficientBalance] =
    useState<boolean>(false);

  const [createRaffleResponse, setCreteRaffleResponse] = useState<any | null>(
    null
  );

  const [createRaffleLoading, setCreateRaffleLoading] =
    useState<boolean>(false);

  const [userRafflesLoading, setUserRafflesLoading] = useState<boolean>(false);

  const [isApprovedAll, setIsApprovedAll] = useState<boolean>(false);

  const [selectedConstrains, setSelectedConstrains] =
    useState<ConstraintProps | null>(null);

  const [selectedConstraintTitle, setSelectedConstraintTitle] = useState<
    string | null
  >(null);

  const [userRaffles, setUserRaffles] = useState<UserRafflesProps[]>([]);

  const [approveLoading, setApproveLoading] = useState<boolean>(false);

  const [selectedRaffleForCheckReason, setSelectedRaffleForCheckReason] =
    useState<UserRafflesProps | null>(null);

  const [uploadedFile, setUploadedFile] = useState<any | null>(null);
  const [isShowingDetails, setIsShowingDetails] = useState<boolean>(false);
  const [setDuration, setSetDuration] = useState<boolean>(false);
  const [nftStatus, setNftStatus] = useState<NftStatusProp[]>([]);

  const [reverseConstraint, setReverseConstrain] = useState<string | null>(
    null
  );

  const [data, setData] =
    useState<ProviderDashboardFormDataProp>(formInitialData);

  const [socialMediaValidation, setSocialMediaValidation] = useState({
    creatorUrl: true,
    twitter: true,
    discord: true,
    email: true,
    telegram: true,
  });

  // validation states
  const [isTokenContractAddressValid, setIsTokenContractAddressValid] =
    useState<boolean>(false);

  const [isNftContractAddressValid, setIsNftContractAddressValid] =
    useState<boolean>(false);

  const [constraintsList, setConstraintsList] = useState<ConstraintProps[]>([]);

  const { userToken } = useUserProfileContext();
  const signer = useWalletSigner();
  const provider = useWalletProvider();
  const { address } = useWalletAccount();
  const { chain } = useWalletNetwork();

  const { data: userBalance } = useWalletBalance({
    address,
    chainId: chain?.id,
  });

  useEffect(() => {
    if (!address || !userBalance?.value) return;
  }, [chain, address, data.selectedChain]);

  const refController = useRef<any>();

  const filterChainList = useMemo(() => {
    return chainList.filter((chain) =>
      chain.chainName
        .toLocaleLowerCase()
        .includes(searchPhrase.toLocaleLowerCase())
    );
  }, [chainList, searchPhrase]);

  const chainId = chain?.id;

  const deleteRequirement = (id: number) => {
    setRequirementList((prev) => prev.filter((item) => item.pk != id));
  };

  const handleSelectNewOffer = (select: boolean) => {
    setSelectNewOffer(select);
  };

  const updateRequirement = (
    id: number,
    requirements: ConstraintParamValues | null,
    isNotSatisfy: boolean
  ) => {
    if (!requirements) return;

    const newItem = requirementList.map((item) => {
      if (item.pk == id) {
        return { ...requirements, isNotSatisfy };
      }
      return item;
    });

    setRequirementList(newItem);
  };

  const handleSetDuration = (e: boolean) => {
    if (isShowingDetails) return;
    setSetDuration(e);
  };

  const isValidContractAddress = useCallback(
    async (contractAddress: string) => {
      try {
        const res = await provider?.getBytecode({
          address: contractAddress as any,
        });
        return res != "0x";
      } catch {
        return false;
      }
    },
    [provider]
  );

  const checkContractInfo = useCallback(async () => {
    if (!data.isNft && provider && address) {
      await getErc20TokenContract(
        data,
        address,
        provider,
        setData,
        setIsErc20Approved,
        handleSetContractStatus
      );
    }

    if (data.isNft && provider && address) {
      getErc721TokenContract(
        data,
        address,
        provider,
        setData,
        setIsApprovedAll,
        handleSetContractStatus
      );
    }
  }, [address, data, provider]);

  const checkContractAddress = useCallback(
    async (contractAddress: string) => {
      const step1Check = isAddress(contractAddress);
      const step2Check = await isValidContractAddress(contractAddress);
      const isValid = !!(step1Check && step2Check);
      if (isValid) {
        checkContractInfo();
      } else {
        data.isNft
          ? handleSetContractStatus(true, false, false, true)
          : handleSetContractStatus(false, false, false, true);
      }
    },
    [checkContractInfo, data.isNft, isValidContractAddress]
  );

  const handleSetDate = (timeStamp: number, label: string) => {
    label == "startTime"
      ? setData((prevData) => ({ ...prevData, startTimeStamp: timeStamp }))
      : setData((prevData) => ({ ...prevData, endTimeStamp: timeStamp }));
  };

  useEffect(() => {
    if (!data.tokenAmount) setInsufficientBalance(true);
    else {
      setInsufficientBalance(
        data.isNativeToken
          ? Number(data.tokenAmount) * Number(data.winnersCount) <
              Number(userBalance?.formatted)
          : Number(data.tokenAmount) * Number(data.winnersCount) <
              Number(data.userTokenBalance)
      );
    }
  }, [data.tokenAmount, data.tokenContractAddress, data.winnersCount]);

  useEffect(() => {
    if (data.tokenAmount && data.winnersCount) {
      const totalAmount = fromWei(
        toWei(data.tokenAmount) * Number(data.winnersCount)
      );
      setData((prev) => ({ ...prev, totalAmount: totalAmount }));
    }
  }, [data.tokenAmount, data.winnersCount]);

  const canGoStepTwo = () => {
    if (isShowingDetails) return true;
    const {
      provider,
      description,
      selectedChain,
      tokenAmount,
      nftContractAddress,
      isNativeToken,
      tokenContractAddress,
      nftTokenIds,
      userTokenBalance,
      winnersCount,
    } = data;

    const checkToken = () => {
      if (data.isNft) return true;
      const total = Number(tokenAmount) * Number(winnersCount);
      if (
        !data.totalAmount ||
        Number(data.tokenAmount) <= 0 ||
        !data.winnersCount ||
        total <= 0
      )
        return false;
      let balance: boolean = !data.isNativeToken
        ? total <= Number(userTokenBalance)
        : total < Number(userBalance?.formatted);
      setInsufficientBalance(balance);
      const isValid =
        tokenContractAddress == ZERO_ADDRESS
          ? true
          : tokenContractStatus.isValid;
      if (
        !isValid ||
        !balance ||
        (!isNativeToken && !tokenContractAddress) ||
        Number(winnersCount) > 500
      )
        return false;
      return true;
    };

    const checkNft = () => {
      if (!data.isNft) return true;
      const isValid = nftContractStatus.isValid;
      return !!(nftContractAddress && nftTokenIds.length >= 1 && isValid);
    };

    return !!(
      provider &&
      description &&
      selectedChain &&
      checkNft() &&
      checkToken()
    );
  };

  const canGoStepThree = () => {
    const errorObject: ErrorObjectProp = {
      startDateStatus: true,
      statDateStatusMessage: null,
      endDateStatus: true,
      endDateStatusMessage: null,
      numberOfDurationStatus: true,
      numberOfDurationMessage: null,
      maximumLimitationStatus: true,
      maximumLimitationMessage: null,
      numberOfWinnersStatus: true,
      numberOfWinnersMessage: null,
    };

    const { startTimeStamp, endTimeStamp } = data;
    if (!startTimeStamp) {
      errorObject.startDateStatus = false;
      errorObject.statDateStatusMessage = errorMessages.required;
    }
    const sevenDaysLaterAfterNow: Date = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    const sevenDaysLaterAfterNowTimeStamp = Math.round(
      sevenDaysLaterAfterNow.getTime() / 1000
    );

    if (startTimeStamp && startTimeStamp < sevenDaysLaterAfterNowTimeStamp) {
      errorObject.startDateStatus = false;
      errorObject.statDateStatusMessage = errorMessages.startTimeDuration;
    }
    if (!setDuration && !endTimeStamp) {
      errorObject.endDateStatus = false;
      errorObject.endDateStatusMessage = errorMessages.required;
    }

    if (!setDuration && endTimeStamp && startTimeStamp) {
      if (endTimeStamp <= startTimeStamp) {
        errorObject.endDateStatus = false;
        errorObject.endDateStatusMessage = errorMessages.endLessThanStart;
      }
    }

    if (setDuration && !data.numberOfDuration) {
      errorObject.numberOfDurationStatus = false;
      errorObject.numberOfDurationMessage = errorMessages.required;
    }

    if (data.limitEnrollPeopleCheck && !data.maxNumberOfEntries) {
      errorObject.maximumLimitationStatus = false;
      errorObject.maximumLimitationMessage = errorMessages.required;
    }

    if (data.maxNumberOfEntries && Number(data.maxNumberOfEntries) <= 0) {
      errorObject.maximumLimitationStatus = false;
      errorObject.maximumLimitationMessage = errorMessages.required;
    }

    if (
      data.winnersCount &&
      Math.floor(data.winnersCount) != data.winnersCount
    ) {
      errorObject.numberOfWinnersStatus = false;
      errorObject.numberOfWinnersMessage = errorMessages.invalidInput;
    }

    if (data.winnersCount && data.winnersCount <= 0) {
      errorObject.numberOfWinnersStatus = false;
      errorObject.numberOfWinnersMessage = errorMessages.invalidInput;
    }

    if (!data.winnersCount) {
      errorObject.numberOfWinnersStatus = false;
      errorObject.numberOfWinnersMessage = errorMessages.required;
    }

    if (data.limitEnrollPeopleCheck && Number(data.maxNumberOfEntries) > 0) {
      if (
        (data.isNft &&
          Number(data.maxNumberOfEntries) <= data.nftTokenIds.length) ||
        (!data.isNft &&
          Number(data.maxNumberOfEntries) <= Number(data.winnersCount))
      ) {
        errorObject.maximumLimitationStatus = false;
        errorObject.maximumLimitationMessage = (
          <p>
            The maximum number of enrollees cannot be less than or equal to the
            number of winners.
            <br />
            Number of winners:{" "}
            {!data.isNft ? data.winnersCount : data.nftTokenIds.length}
          </p>
        );
      }
    }

    return errorObject;
  };

  const canGoStepFive = () => {
    if (isShowingDetails) return true;
    const { email, twitter, creatorUrl, discord, telegram } = data;
    if (!email || !twitter) {
      return false;
    }
    const {
      urlValidation,
      twitterValidation,
      discordValidation,
      emailValidation,
      telegramValidation,
    } = checkSocialMediaValidation(
      creatorUrl,
      twitter,
      discord,
      email,
      telegram
    );
    setSocialMediaValidation({
      creatorUrl: urlValidation,
      twitter: twitterValidation,
      discord: discordValidation,
      email: emailValidation,
      telegram: telegramValidation,
    });
    return !!(
      urlValidation &&
      twitterValidation &&
      discordValidation &&
      emailValidation &&
      telegramValidation
    );
  };

  const handleSelectNativeToken = (e: boolean) => {
    if (!data.selectedChain || isShowingDetails) return;
    handleSetContractStatus(false, !e, false, !e);
    setIsErc20Approved(!e);
    setData((prevData) => ({
      ...prevData,
      isNativeToken: !e,
      tokenContractAddress: !e ? ZERO_ADDRESS : "",
      decimal: !e ? 18 : null,
    }));
  };

  const handleSelectDurationUnitTime = (unit: string) => {
    setData((prevData) => ({
      ...prevData,
      ["durationUnitTime"]: unit,
    }));
  };

  const handleSelectAllowListPrivate = () => {
    setAllowListPrivate(!allowListPrivate);
  };

  const handleSelectTokenOrNft = (e: boolean) => {
    if (!data.selectedChain || isShowingDetails) return;
    setData((prevData) => ({
      ...prevData,
      ["isNft"]: e,
    }));
  };

  const handleGetUserRaffles = useCallback(async () => {
    if (!userToken) return;
    setUserRafflesLoading(true);
    refController.current = new AbortController();
    try {
      const raffles = await getUserRaffles(
        userToken,
        refController.current.signal
      );
      refController.current = null;
      setUserRaffles(raffles);
      setUserRafflesLoading(false);
    } catch (e: any) {
      if (e?.message !== "canceled" || !e?.message) {
        console.log(e);
      }
      setUserRafflesLoading(false);
    }
  }, [userToken]);

  const updateChainList = useCallback(async () => {
    try {
      const newChainList = await getProviderDashboardValidChain();
      setChainList(newChainList);
    } catch (e) {}
  }, []);

  const handleSearchChain = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setChainName(e.target.value);
    setSearchPhrase(e.target.value);
  };

  const handleSelectChain = (chain: Chain) => {
    setSelectedChain(chain);
    setChainName(chain.chainName);
    setSearchPhrase("");
  };

  const handleSelectSatisfy = (satisfy: string) => {
    setData((prevData) => ({
      ...prevData,
      ["satisfy"]: satisfy,
    }));
  };

  const handleGetConstraints = async () => {
    if (constraintsList.length != 0) return;
    const res = await getConstraintsApi();
    setConstraintsList(res);
  };

  const handleSelectLimitEnrollPeopleCheck = () => {
    if (isShowingDetails) return true;
    setData((prevData) => ({
      ...prevData,
      limitEnrollPeopleCheck: !data.limitEnrollPeopleCheck,
      maxNumberOfEntries: null,
    }));
  };

  const handleChange = (e: {
    target: { type: any; name: any; checked: any; value: any };
  }) => {
    if (isShowingDetails) return;
    const type = e.target.type;
    const name = e.target.name;
    if (page == 3) {
      setSocialMediaValidation({
        creatorUrl: true,
        twitter: true,
        discord: true,
        email: true,
        telegram: true,
      });
    }

    name == "tokenContractAddress" &&
      handleSetContractStatus(false, false, false, false);
    name == "nftContractAddress" &&
      handleSetContractStatus(true, false, false, false);

    let value = type == "checkbox" ? e.target.checked : e.target.value;
    if (name == "provider" && value.length > 30) return;
    if (name == "description" && value.length > 100) return;
    if (name == "winnersCount" || name == "maxNumberOfEntries") {
      value = value.replace(/[^0-9]/g, "");
    }
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectConstraint = (constraint: ConstraintProps) => {
    setSelectedConstraintTitle(constraint.title);
    setSelectedConstrains(constraint);
  };

  const handleBackToRequirementModal = () => {
    setSelectedConstrains(null);
    setSelectedConstraintTitle(null);
  };

  const closeRequirementModal = () => {
    setSelectedConstrains(null);
    setSelectedConstraintTitle(null);
    setIsModalOpen(false);
  };

  const closeAddNftIdListModal = () => {
    setIsModalOpen(false);
  };

  const closeCreateRaffleModal = () => {
    setIsCreateRaffleModalOpen(false);
  };

  const openCreteRaffleModal = () => {
    setIsCreateRaffleModalOpen(true);
  };

  const openRequirementModal = () => {
    if (isShowingDetails) return;
    setIsModalOpen(true);
  };

  const openAddNftIdListModal = () => {
    !isShowingDetails &&
      data.nftContractAddress &&
      nftContractStatus.isValid &&
      setIsModalOpen(true);
  };

  const closeShowPreviewModal = () => {
    setIsModalOpen(false);
  };

  const openShowPreviewModal = () => {
    setIsModalOpen(true);
  };

  const handleGOToDashboard = () => {
    setSelectNewOffer(false);
    setIsShowingDetails(false);
    setPage(0);
    setData(formInitialData);
    setChainName("");
    setSelectedChain(null);
    setCreteRaffleResponse(null);
    setRequirementList([]);
    setIsModalOpen(false);
    setSelectedRaffleForCheckReason(null);
  };

  const handleApproveErc20Token = () => {
    if (!provider || !address || !signer) return;

    approveErc20Token(
      data,
      provider,
      signer,
      address,
      setApproveLoading,
      setIsErc20Approved
    );
  };

  const handleApproveErc721Token = () => {
    if (!provider || !address || !signer) return;
    approveErc721Token(
      data,
      provider,
      signer,
      address,
      setApproveLoading,
      setIsApprovedAll
    );
  };

  const handleSetCreateRaffleLoading = () => {
    setCreateRaffleLoading(true);
  };

  const handleCreateRaffle = () => {
    if (!address || !address || !provider || !userToken || !signer) return;

    if (!data.isNft) {
      createErc20Raffle(
        data,
        provider,
        signer,
        requirementList,
        address,
        userToken,
        setCreateRaffleLoading,
        setCreteRaffleResponse
      );
    } else {
      createErc721Raffle(
        data,
        provider,
        signer,
        requirementList,
        address,
        userToken,
        setCreateRaffleLoading,
        setCreteRaffleResponse
      );
    }
  };

  const insertRequirement = (
    requirement: ConstraintParamValues | null,
    id: number,
    name: string,
    title: string,
    isNotSatisfy: boolean
  ) => {
    setRequirementList([
      ...requirementList,
      {
        pk: id,
        values: !requirement ? null : { 1: "", 2: "", 3: "" },
        name,
        title,
        isNotSatisfy,
      },
    ]);
  };

  const handleCheckForReason = (raffle: UserRafflesProps) => {
    setPage(5);
    setSelectNewOffer(true);
    setSelectedRaffleForCheckReason(raffle);
  };

  const handleShowUserDetails = async (raffle: UserRafflesProps) => {
    setChainName(raffle.chain.chainName);
    setData((prev) => ({
      ...prev,
      provider: raffle.name,
      selectedChain: raffle.chain,
      description: raffle.description,
      isNft: raffle.isPrizeNft,
      isNativeToken: raffle.prizeAsset == ZERO_ADDRESS,
      tokenAmount: fromWei(raffle.prizeAmount, raffle.decimals),
      tokenContractAddress: raffle.isPrizeNft ? "" : raffle.prizeAsset,
      nftContractAddress: raffle.isPrizeNft ? raffle.prizeAsset : "",
      startTimeStamp: Date.parse(raffle.startAt) / 1000,
      endTimeStamp: Date.parse(raffle.deadline) / 1000,
      limitEnrollPeopleCheck:
        raffle.maxNumberOfEntries != 1000000000 ? true : false,
      maxNumberOfEntries:
        raffle.maxNumberOfEntries != 1000000000
          ? raffle.maxNumberOfEntries.toString()
          : null,
      winnersCount: raffle.winnersCount,
      nftTokenIds: raffle.nftIds ? raffle.nftIds.split(",") : [],
      twitter: raffle.twitterUrl,
      discord: raffle.discordUrl,
      creatorUrl: raffle.creatorUrl,
      telegram: raffle.telegramUrl,
      email: raffle.emailUrl,
      necessaryInfo: raffle.necessaryInformation,
      tokenSymbol: raffle.prizeSymbol,
      nftName: raffle.prizeName,
    }));
    setIsShowingDetails(true);
    setSelectNewOffer(true);
    raffle.isPrizeNft
      ? handleSetContractStatus(true, true, false, true)
      : handleSetContractStatus(false, true, false, true);
    setConstraintsList(await getConstraintsApi());
    setRequirementList(
      raffle.constraints.map((constraint) =>
        raffle.reversedConstraints?.includes(constraint.pk.toString())
          ? { ...constraint, isNotSatisfy: true }
          : { ...constraint, isNotSatisfy: false }
      )
    );
    setReverseConstrain(raffle.reversedConstraints);
  };

  const handleCheckOwnerOfNfts = async (nftIds: string[]) => {
    if (provider && address) {
      setNftStatus([]);
      const res = await checkNftsAreValid(data, provider, nftIds, address);
      const invalidNfts = res?.filter((item) => !item.isOwner);
      if (invalidNfts && invalidNfts.length > 0) {
        setNftStatus(invalidNfts);
      }
      return !res?.find((item) => !item.isOwner);
    }
    return false;
  };

  const handleAddNftToData = async (nftIds: string[]) => {
    setData((prev) => ({
      ...prev,
      nftTokenIds: nftIds,
    }));
  };

  const handleClearNfts = () => {
    if (isShowingDetails) return;
    setUploadedFile(null);
    setData((prev) => ({ ...prev, nftTokenIds: [], nftContractAddress: "" }));
  };

  useEffect(() => {
    if (isShowingDetails || !data.tokenContractAddress || data.isNft) return;
    console.log("+-+-+");
    if (!data.isNft && data.tokenContractAddress == ZERO_ADDRESS) {
      handleSetContractStatus(false, true, false, true);
      return;
    }
    handleSetContractStatus(false, false, true, false);
    checkContractAddress(data.tokenContractAddress);
  }, [data.tokenContractAddress, chainId, data.isNft]);

  const handleSetContractStatus = (
    isNft: boolean,
    isValid: boolean,
    checking: boolean,
    display: boolean
  ) => {
    !isNft &&
      setTokenContractStatus((prev) => ({
        ...prev,
        isValid: isValid,
        checking: checking,
        canDisplayStatus: display,
      }));

    isNft &&
      setNftContractStatus((prev) => ({
        ...prev,
        isValid: isValid,
        checking: checking,
        canDisplayStatus: display,
      }));
  };

  useEffect(() => {
    if (isShowingDetails || !data.nftContractAddress || !data.isNft) return;
    handleSetContractStatus(true, false, true, false);
    checkContractAddress(data.nftContractAddress);
  }, [data.nftContractAddress, chainId, data.isNft]);

  useEffect(() => {
    if (isShowingDetails || !data.tokenContractAddress) return;
    if (data.totalAmount && data.tokenContractAddress != ZERO_ADDRESS) {
      const debounce = setTimeout(() => {
        checkContractInfo();
      }, 700);

      return () => clearTimeout(debounce);
    }
  }, [data.totalAmount, data.tokenContractAddress]);

  useEffect(() => {
    return () => refController.current?.abort();
  }, []);

  useEffect(() => {
    if (selectedChain) {
      setChainName(selectedChain?.chainName);
      setData((prevData) => ({
        ...prevData,
        ["selectedChain"]: selectedChain,
      }));
    }
  }, [selectedChain]);

  useEffect(() => {
    updateChainList();
  }, [updateChainList]);

  useEffect(() => {
    let newEndTimeStamp: any;
    if (setDuration && data.startTimeStamp && data.numberOfDuration > 0) {
      if (data.durationUnitTime == "Day") {
        newEndTimeStamp =
          data.startTimeStamp + data.numberOfDuration * 24 * 60 * 60;
      }
      if (data.durationUnitTime == "Week") {
        newEndTimeStamp =
          data.startTimeStamp + data.numberOfDuration * 7 * 24 * 60 * 60;
      }
      if (data.durationUnitTime == "Month") {
        const currentDate = new Date(data.startTimeStamp * 1000);

        newEndTimeStamp = Math.round(
          currentDate.setMonth(
            Number(currentDate.getMonth()) + Number(data.numberOfDuration)
          ) / 1000
        );
      }
    }
    if (newEndTimeStamp) {
      setData((prevData) => ({
        ...prevData,
        ["endTimeStamp"]: newEndTimeStamp,
      }));
    }
  }, [
    setDuration,
    data.durationUnitTime,
    data.numberOfDuration,
    setData,
    data.startTimeStamp,
  ]);

  useRefreshWithInitial(
    () => {
      if (userRaffles.length > 0) return;
      handleGetUserRaffles();
    },
    FAST_INTERVAL,
    [handleGetUserRaffles, userToken, userRaffles]
  );

  return (
    <ProviderDashboardContext.Provider
      value={{
        page,
        setPage,
        data,
        title,
        handleChange,
        handleSelectTokenOrNft,
        handleSelectLimitEnrollPeopleCheck,
        openRequirementModal,
        closeRequirementModal,
        openAddNftIdListModal,
        closeAddNftIdListModal,
        isModalOpen,
        selectedConstrains,
        handleSelectConstraint,
        selectedConstraintTitle,
        handleBackToRequirementModal,
        chainList,
        selectedChain,
        setSelectedChain,
        chainName,
        handleSearchChain,
        setChainName,
        filterChainList,
        setSearchPhrase,
        handleSelectChain,
        handleSelectSatisfy,
        allowListPrivate,
        handleSelectAllowListPrivate,
        canGoStepTwo,
        canGoStepThree,
        canGoStepFive,
        setDuration,
        handleSetDuration,
        handleSelectDurationUnitTime,
        closeShowPreviewModal,
        openShowPreviewModal,
        selectNewOffer,
        handleSelectNewOffer,
        handleGOToDashboard,
        insertRequirement,
        requirementList,
        deleteRequirement,
        updateRequirement,
        handleSelectNativeToken,
        handleCreateRaffle,
        closeCreateRaffleModal,
        isCreateRaffleModalOpen,
        openCreteRaffleModal,
        createRaffleResponse,
        createRaffleLoading,
        handleSetCreateRaffleLoading,
        isNftContractAddressValid,
        handleSetDate,
        handleApproveErc20Token,
        isErc20Approved,
        approveLoading,
        constraintsList,
        isApprovedAll,
        handleApproveErc721Token,
        userRaffles,
        userRafflesLoading,
        handleGetConstraints,
        updateChainList,
        handleCheckForReason,
        handleShowUserDetails,
        handleAddNftToData,
        setUploadedFile,
        uploadedFile,
        isShowingDetails,
        handleCheckOwnerOfNfts,
        nftStatus,
        handleClearNfts,
        selectedRaffleForCheckReason,
        socialMediaValidation,
        insufficientBalance,
        userBalance: userBalance?.formatted.toString() ?? null,
        tokenContractStatus,
        nftContractStatus,
      }}
    >
      {children}
    </ProviderDashboardContext.Provider>
  );
};

export const usePrizeOfferFormContext = () => {
  return useContext(ProviderDashboardContext);
};

export default ProviderDashboard;