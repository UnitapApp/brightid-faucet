"use client";

import { FC, useCallback, useEffect, useState } from "react";
import { RequirementProps, ConstraintProps, Chain } from "@/types";
import useAddRequirement from "@/components/containers/provider-dashboard/hooks/useAddRequirement";
import Icon from "@/components/ui/Icon";
import { CreateParams } from "./ConstraintDetailsModal";

import Select from "@/components/ui/Select";
import { ShouldNotSatisfy, ShouldSatisfy } from "./ShouldSatisfy";

type DetailsModal = {
  handleBackToConstraintListModal: any;
  requirementList: RequirementProps[];
  insertRequirement: any;
  updateRequirement: any;
  allChainList: Chain[];
  selectedApp?: {
    label: string;
    constraints: ConstraintProps[];
  };
  setSelectedApp: (value?: {
    label: string;
    constraints: ConstraintProps[];
  }) => void;
};

const ConstraintAppDetailModal: FC<DetailsModal> = ({
  handleBackToConstraintListModal,
  requirementList,
  insertRequirement,
  updateRequirement,
  allChainList,
  selectedApp,
  setSelectedApp,
}) => {
  const addRequirements = useAddRequirement(
    handleBackToConstraintListModal,
    insertRequirement,
    updateRequirement,
  );

  const [existRequirement, setExistRequirement] =
    useState<RequirementProps | null>(null);

  const [requirementParamsList, setRequirementParamsList] = useState<any>();

  const [isNotSatisfy, setIsNotSatisfy] = useState<boolean>(false);

  const [constraintFile, setConstraintFile] = useState<any>();

  const [isCollectionValid, setIsCollectionValid] = useState<boolean>(false);

  const [decimals, setDecimals] = useState<number | undefined>();

  const [constraint, setConstraint] = useState<ConstraintProps | null>(null);

  console.log(requirementList);

  const createRequirementParamsList = useCallback(() => {
    if (!constraint) return;

    if (constraint.params.length > 0) {
      setRequirementParamsList(
        constraint.params.reduce((obj: any, item: any, index: any) => {
          obj[item] = "";
          return obj;
        }, {}),
      );
    }
  }, [constraint]);

  const [errorMessage, setErrorMessage] = useState<string | null>();

  useEffect(() => {
    const requirement = requirementList.find(
      (item) => item.pk == constraint?.pk,
    );

    setExistRequirement(requirement ?? null);

    if (requirement) {
      setIsNotSatisfy(requirement.isNotSatisfy);
      setRequirementParamsList(requirement.params);
    } else {
      createRequirementParamsList();
    }
  }, [constraint, createRequirementParamsList, requirementList]);

  const checkingParamsValidation = () => {
    if (!requirementParamsList) return false;
    if (
      !requirementParamsList.ADDRESS ||
      !requirementParamsList.CHAIN ||
      !requirementParamsList.MINIMUM ||
      Number(requirementParamsList.MINIMUM) <= 0
    ) {
      !requirementParamsList.ADDRESS
        ? setErrorMessage("Please enter collection address.")
        : !requirementParamsList.CHAIN
          ? setErrorMessage("Please select chain.")
          : setErrorMessage("Please select minimum amount.");
      return false;
    }

    if (!isCollectionValid) return false;
    return true;
  };

  const checkCsvFileUploadedValidation = () => {
    if (!requirementParamsList) return false;
    if (!requirementParamsList.CSV_FILE) {
      setErrorMessage("Please upload a csv file.");
      return false;
    }
    return true;
  };

  const handleAddRequirement = () => {
    if (!constraint) return;
    if (requirementParamsList) {
      const checkValues = Object.values(requirementParamsList).every(
        (value) => value !== null && value !== undefined && value !== "",
      );

      if (!checkValues) {
        return;
      }
    }

    if (
      constraint.name === "core.HasNFTVerification" ||
      constraint.name === "core.HasTokenVerification" ||
      constraint.name === "core.HasTokenTransferVerification"
    ) {
      const res = checkingParamsValidation();
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
      constraintFile,
      decimals,
    );

    setSelectedApp();
  };

  const handleSelectNotSatisfy = (isSatisfy: boolean) => {
    setIsNotSatisfy(isSatisfy);
  };

  return (
    <div className="mt-5 flex min-h-[200px] flex-col gap-2">
      <div
        className="absolute top-5 z-30 cursor-pointer"
        onClick={() => setSelectedApp()}
      >
        <Icon
          iconSrc="/assets/images/provider-dashboard/arrow-left.svg"
          className="cursor-pointer"
        />
      </div>
      <div className="mb-2 flex h-[32px] w-full gap-4">
        <div
          onClick={() => handleSelectNotSatisfy(false)}
          className={`relative w-full`}
        >
          <ShouldSatisfy isSatisfy={isNotSatisfy} />
        </div>
        <div
          onClick={() => handleSelectNotSatisfy(true)}
          className={`relative w-full`}
        >
          <ShouldNotSatisfy notSatisfy={isNotSatisfy} />
        </div>
      </div>

      <Select
        label="Constraint"
        placeholder="Select Constraint"
        onChange={(value) => setConstraint(value)}
        options={
          selectedApp
            ? selectedApp?.constraints.map((item) => ({
                label: item.title,
                value: item,
              }))
            : []
        }
        value={constraint}
      />

      {!!constraint && (
        <CreateParams
          constraint={constraint}
          setRequirementParamsList={setRequirementParamsList}
          requirementParamsList={requirementParamsList}
          constraintFile={constraintFile}
          setConstraintFile={setConstraintFile}
          allChainList={allChainList}
          requirementList={requirementList}
          isCollectionValid={isCollectionValid}
          setIsCollectionValid={setIsCollectionValid}
          setErrorMessage={setErrorMessage}
          decimals={decimals}
          setDecimals={setDecimals}
        />
      )}

      <div className="mb-4">{constraint?.description}</div>
      <div className="min-h-[15px] text-2xs text-error">{errorMessage}</div>
      <div
        onClick={handleAddRequirement}
        className="mb-2 mt-auto flex h-[44px] cursor-pointer items-center justify-center rounded-xl border-2 border-gray70 bg-gray40 text-sm font-semibold text-white"
      >
        Add Requirement
      </div>
    </div>
  );
};

export default ConstraintAppDetailModal;
