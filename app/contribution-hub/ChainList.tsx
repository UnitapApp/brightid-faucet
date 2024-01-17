import Icon from "@/components/ui/Icon";
import { Chain } from "@/types/gastap";
import { useOutsideClick } from "@/utils/hooks/dom";
import React, { useEffect, useRef, useState } from "react";

interface Props {
  setRequirementParamsList: any;
  requirementParamsList: any;
  allChainList: Chain[] | undefined;
}

const ChainList = ({
  setRequirementParamsList,
  requirementParamsList,
  allChainList,
}: Props) => {
  const [selectedChain, setSelectedChain] = useState<Chain | undefined>();

  const handleSelectChain = (chian: Chain) => {
    setSelectedChain(chian);
    setRequirementParamsList({
      ...requirementParamsList,
      ["CHAIN"]: chian.pk,
    });
    setShowItems(false);
  };

  const [showItems, setShowItems] = useState<boolean>(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!requirementParamsList || !allChainList) return;
    if (!requirementParamsList.CHAIN) return;
    const chain = allChainList!.find(
      (item) => item.pk === requirementParamsList.CHAIN
    );
    setSelectedChain(chain);
  }, [requirementParamsList]);

  useOutsideClick(ref, () => {
    if (showItems) setShowItems(false);
  });

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setShowItems(!showItems)}
        className="flex items-center justify-between cursor-pointer h-[43px] bg-gray40 border-gray50 rounded-xl px-3"
      >
        {!selectedChain && <p>Please select Chain...</p>}
        <div className="flex gap-2 items-center">
          {selectedChain && (
            <Icon iconSrc={selectedChain.logoUrl} height="24px" width="24px" />
          )}
          {selectedChain && <p>{selectedChain.chainName}</p>}
        </div>
        <Icon
          iconSrc="/assets/images/fund/arrow-down.png"
          height="8px"
          width="14px"
        />
      </div>
      {showItems && (
        <div className="absolute bg-gray40 z-10 w-full border border-gray50 overflow-x-hidden overflow-y-scroll max-h-[200px] rounded-lg ">
          {allChainList?.map((chain) => (
            <div
              onClick={() => handleSelectChain(chain)}
              key={chain.chainPk}
              className="p-2 cursor-pointer hover:bg-gray70 rounded-lg"
            >
              <div className="flex items-center gap-2 text-white">
                <Icon iconSrc={chain.logoUrl} height="24px" width="24px" />
                {chain.chainName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChainList;
