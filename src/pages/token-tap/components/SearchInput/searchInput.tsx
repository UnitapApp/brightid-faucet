import React, { useContext, useState } from "react";

import { ClaimContext } from "hooks/useChainList";
import Icon from "components/basic/Icon/Icon";
import Input from "components/basic/Input/input";

type SearchInputProps = {
  className?: string;
}

const SearchInput = ({ className="" }: SearchInputProps) => {
  const [searchPhraseInput, setSearchPhraseInput] = useState<string>("");
  const { changeSearchPhrase } = useContext(ClaimContext);

  const searchPhraseChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phrase: string = event.target.value;
    setSearchPhraseInput(phrase);
    changeSearchPhrase!(phrase);
  };

  return (
    <div className={`search-input relative border-gray30 border-2 bg-gray40 rounded-xl ${className}`}>
      <Input
        data-testid="search-box"
        icon="search.png"
        width="100%"
        fontSize="14px"
        iconWidth="20px"
        iconHeight="20px"
        value={searchPhraseInput}
        onChange={searchPhraseChangeHandler}
        placeholder="Token name"
        pl={7}
        p={1.5}
        mb={0}
        backgroundColor="black1"
      ></Input>
      <Icon
        iconSrc="assets/images/claim/slash-icon.svg"
        hoverable
        className="icon-right absolute right-4 top-[10px] z-10"
      ></Icon>
    </div>
  );
};

export default SearchInput;
