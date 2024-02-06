"use client";

import { useEffect, useState } from "react";
import { RequirementProps, ConstraintProps, Chain } from "@/types";
import useAddRequirement from "@/components/containers/provider-dashboard/hooks/useAddRequirement";
import Icon from "@/components/ui/Icon";
import ChainList from "@/app/contribution-hub/ChainList";
import SelectMethodInput from "@/app/contribution-hub/SelectMethodInput";
import { useWalletProvider } from "@/utils/wallet";
import { isAddress } from "viem";
import { checkCollectionAddress } from "@/components/containers/provider-dashboard/helpers/checkCollectionAddress";
import CsvFileInput from "./CsvFileInput";

interface CreateModalParam {
  constraint: ConstraintProps;
  setRequirementParamsList: any;
  requirementParamsList: any;
  constraintFile: any;
  allChainList: Chain[];
  setConstraintFile: (item: any) => void;
}

interface DetailsModal {
  constraint: ConstraintProps;
  handleBackToConstraintListModal: any;
  requirementList: RequirementProps[];
  insertRequirement: any;
  updateRequirement: any;
  allChainList: Chain[];
}

const ConstraintDetailsModal = ({
  constraint,
  handleBackToConstraintListModal,
  requirementList,
  insertRequirement,
  updateRequirement,
  allChainList,
}: DetailsModal) => {
  const provider = useWalletProvider();

  const addRequirements = useAddRequirement(
    handleBackToConstraintListModal,
    insertRequirement,
    updateRequirement
  );

  const [existRequirement, setExistRequirement] =
    useState<RequirementProps | null>(null);

  const [requirementParamsList, setRequirementParamsList] = useState<any>();

  const [isNotSatisfy, setIsNotSatisfy] = useState<boolean>(false);

  const [constraintFile, setConstraintFile] = useState<any>();

  const createRequirementParamsList = () => {
    if (constraint.params.length > 0) {
      setRequirementParamsList(
        constraint.params.reduce((obj: any, item: any, index: any) => {
          obj[item] = "";
          return obj;
        }, {})
      );
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>();

  useEffect(() => {
    const requirement = requirementList.find(
      (item) => item.pk == constraint.pk
    );

    setExistRequirement(requirement ? requirement : null);

    if (requirement) {
      setIsNotSatisfy(requirement.isNotSatisfy);
      setRequirementParamsList(requirement.params);
    } else {
      createRequirementParamsList();
    }
  }, []);

  const checkingParamsValidation = async () => {
    if (!requirementParamsList) return false;
    if (
      !requirementParamsList.COLLECTION_ADDRESS ||
      !requirementParamsList.CHAIN ||
      !requirementParamsList.MINIMUM
    ) {
      !requirementParamsList.COLLECTION_ADDRESS
        ? setErrorMessage("Please enter collection address.")
        : !requirementParamsList.CHAIN
        ? setErrorMessage("Please select chain.")
        : setErrorMessage("Please select minimum amount.");
      return false;
    }

    if (requirementParamsList.COLLECTION_ADDRESS) {
      const step2Check = isAddress(requirementParamsList.COLLECTION_ADDRESS);
      const chain = allChainList?.find(
        (item) => Number(item.pk) === Number(requirementParamsList.CHAIN)
      );

      if (!chain) return false;

      const res = await checkCollectionAddress(
        provider,
        requirementParamsList.COLLECTION_ADDRESS,
        Number(chain.chainId)
      );

      (!step2Check || !res) && setErrorMessage("Invalid contract address.");
      return step2Check && res;
    }
  };

  const checkCsvFileUploadedValidation = () => {
    console.log(requirementParamsList, requirementParamsList.CSV_FILE);
    if (!requirementParamsList) return false;
    if (!requirementParamsList.CSV_FILE) {
      setErrorMessage("Please upload a csv file.");
      return false;
    }
    return true;
  };

  const handleAddRequirement = async () => {
    if (constraint.name === "core.HasNFTVerification") {
      const res = await checkingParamsValidation();
      if (!res) return;
    }

    if (constraint.name === "core.AllowListVerification") {
      const res = checkCsvFileUploadedValidation();
      if (!res) return;
    }

    addRequirements(
      existRequirement,
      constraint.pk,
      constraint.name,
      constraint.title,
      isNotSatisfy,
      requirementParamsList,
      constraintFile
    );
  };

  const handleSelectNotSatisfy = (isSatisfy: boolean) => {
    setIsNotSatisfy(isSatisfy);
  };

  return (
    <div className="flex flex-col gap-2 mt-5 relative">
      <div
        className="absolute -top-14 cursor-pointer z-[999]"
        onClick={handleBackToConstraintListModal}
      >
        <Icon
          iconSrc="/assets/images/provider-dashboard/arrow-left.svg"
          className="cursor-pointer z-[999999]"
        />
      </div>
      <div className="w-full flex gap-4 h-[32px] mb-2">
        <div
          onClick={() => handleSelectNotSatisfy(false)}
          className={`w-full flex items-center justify-center rounded-lg h-full cursor-pointer text-white relative overflow-hidden`}
        >
          <div
            className={`${
              !isNotSatisfy ? "bg-dark-space-green opacity-30" : "bg-gray50"
            } absolute w-full h-full`}
          ></div>
          <p className="absolute text-white">Should satisfy</p>
        </div>
        <div
          onClick={() => handleSelectNotSatisfy(true)}
          className={`w-full flex items-center justify-center rounded-lg h-full cursor-pointer text-white relative overflow-hidden`}
        >
          <div
            className={`${
              isNotSatisfy ? "bg-error opacity-50" : "bg-gray50"
            } absolute w-full h-full `}
          ></div>
          <p className="absolute text-white">Should not satisfy</p>
        </div>
      </div>
      <CreateParams
        constraint={constraint}
        setRequirementParamsList={setRequirementParamsList}
        requirementParamsList={requirementParamsList}
        constraintFile={constraintFile}
        setConstraintFile={setConstraintFile}
        allChainList={allChainList}
      />
      <div className="mb-4">{constraint.description}</div>
      <div className="text-error text-[10px] min-h-[15px]">{errorMessage}</div>
      <div
        onClick={handleAddRequirement}
        className="flex cursor-pointer  bg-gray40 text-[14px] font-semibold text-white h-[44px] border-2 border-gray70 rounded-xl items-center justify-center mb-2"
      >
        Add Requirement
      </div>
    </div>
  );
};

const CreateParams = ({
  constraint,
  setRequirementParamsList,
  requirementParamsList,
  constraintFile,
  setConstraintFile,
  allChainList,
}: CreateModalParam) => {
  const [reqNftAddress, setReqNftAddress] = useState("");

  useEffect(() => {
    if (!requirementParamsList) return;
    setReqNftAddress(requirementParamsList.COLLECTION_ADDRESS);
  }, [requirementParamsList]);

  const handleChangeCollection = (address: string) => {
    setReqNftAddress(address);
    setRequirementParamsList({
      ...requirementParamsList,
      ["COLLECTION_ADDRESS"]: address,
    });
  };

  if (constraint.params.length === 0) return;

  if (constraint.name === "core.HasNFTVerification") {
    return (
      <div className="flex flex-col gap-3">
        <ChainList
          setRequirementParamsList={setRequirementParamsList}
          requirementParamsList={requirementParamsList}
          allChainList={allChainList}
        />
        <div className="nftAddress_requirement_input overflow-hidden pl-4 flex rounded-2xl bg-gray40 border items-center h-[43px] border-gray50">
          <input
            name="nftAddressRequirement"
            placeholder="Paste NFT address"
            className="bg-inherit w-full h-full"
            value={reqNftAddress ?? ""}
            onChange={(e) => handleChangeCollection(e.target.value)}
          />
        </div>
        <SelectMethodInput
          setRequirementParamsList={setRequirementParamsList}
          requirementParamsList={requirementParamsList}
        />
      </div>
    );
  }

  if (constraint.name === "core.AllowListVerification") {
    return (
      <CsvFileInput
        setRequirementParamsList={setRequirementParamsList}
        requirementParamsList={requirementParamsList}
        setConstraintFile={setConstraintFile}
        constraintFile={constraintFile}
      />
    );
  }
  return <></>;
};

export default ConstraintDetailsModal;
