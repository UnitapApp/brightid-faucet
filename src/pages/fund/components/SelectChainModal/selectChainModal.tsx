import React, { useContext, useState } from 'react';

import { SelectChainModalWrapper } from './selectChainModal.style';
import ChainItem from './chainItem';
import { ClaimContext } from '../../../../hooks/useChainList';
import { Chain } from '../../../../types';
import Icon from 'components/basic/Icon/Icon';

const SelectChainModal = ({
  selectedChain,
  setSelectedChain,
  closeModalHandler,
}: {
  selectedChain: Chain | null;
  setSelectedChain: (chain: Chain) => any;
  closeModalHandler: () => any;
}) => {
  const [searchPhraseInput, setSearchPhraseInput] = useState<string>('');
  const { changeSearchPhrase, chainListSearchSimpleResult } = useContext(ClaimContext);
  const searchPhraseChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phrase: string = event.target.value;
    setSearchPhraseInput(phrase);
    changeSearchPhrase!(phrase);
  };

  return (
    <SelectChainModalWrapper className="relative bg-gray20 pt-4">
      <input
        className="bg-gray10 border-2 !border-gray30 rounded-lg p-4 py-3.5 pl-[52px] mb-2 w-full text-white z-1"
        value={searchPhraseInput}
        onChange={searchPhraseChangeHandler}
        placeholder="Search Network"
      />
      <Icon
        className="absolute left-4 top-8"
        iconSrc="assets/images/modal/search-icon.svg"
        width="20px"
        height="20px"
      />
      {chainListSearchSimpleResult.map((chain) => (
        <ChainItem
          data-testid={`select-chain-modal-item-${chain.pk}`}
          key={chain.chainId}
          chain={chain}
          selected={selectedChain?.chainId === chain.chainId}
          onClick={() => {
            setSelectedChain(chain);
            closeModalHandler();
          }}
        />
      ))}
    </SelectChainModalWrapper>
  );
};

export default SelectChainModal;
