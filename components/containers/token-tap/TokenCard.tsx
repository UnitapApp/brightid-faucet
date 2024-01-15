"use client";

import { FC, useState, useMemo } from "react";
import { Token } from "@/types";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import { getChainIcon } from "@/utils/chain";
import { numberWithCommas } from "@/utils/numbers";
import styled from "styled-components/";
import { DV } from "@/components/ui/designVariables";
import {
  NoCurrencyButton,
  ClaimButton,
  ClaimedButton,
} from "@/components/ui/Button/button";
import { useWalletAccount } from "@/utils/wallet";
import { useTokenTapContext } from "@/context/tokenTapProvider";
import Markdown from "./Markdown";
import Image from "next/image";
import { AddMetamaskButton } from "@/app/gastap/components/Cards/Chainlist/ChainCard";

const TokenCard: FC<{ token: Token; isHighlighted?: boolean }> = ({
  token,
  isHighlighted,
}) => {
  const { openClaimModal, claimedTokensList, claimingTokenPk } =
    useTokenTapContext();

  const { isConnected, connector } = useWalletAccount();

  const [showAllPermissions, setShowAllPermissions] = useState(false);

  const onTokenClicked = () => {
    window.open(token.distributorUrl);
  };

  const addToken = async () => {
    if (!isConnected) return;

    try {
      await connector?.watchAsset?.({
        decimals: token.chain.decimals,
        symbol: token.token,
        image: token.imageUrl,
        address: token.tokenAddress,
      });
      // await (window.ethereum as any).request({
      //   method: "wallet_watchAsset",
      //   params: {
      //     type: "ERC20",
      //     options: {
      //       name: token.name,
      //       address: token.tokenAddress,
      //       symbol: token.token,
      //       decimals: token.chain.decimals,
      //       image: token.imageUrl,
      //     },
      //   },
      // })
    } catch (error) {
      console.log(error);
    }
  };

  const collectedToken = useMemo(
    () =>
      claimedTokensList.find((item) => item.tokenDistribution.id === token.id),
    [claimedTokensList, token]
  );

  const calculateClaimAmount =
    token.chain.chainName === "Lightning"
      ? token.amount
      : token.amount / 10 ** token.chain.decimals;

  const timePermissionVerification = useMemo(
    () => token.constraints.find((permission) => permission.type === "TIME"),
    [token]
  );

  return (
    <div>
      <div
        className={`token-card flex ${
          isHighlighted
            ? "before:!inset-[3px] p-0 gradient-outline-card mb-20"
            : "mb-4"
        } flex-col items-center justify-center w-full mb-4`}
      >
        <span className="flex flex-col w-full">
          <div
            className={`pt-4 pr-6 pb-4 pl-3 ${
              isHighlighted ? "bg-g-primary-low" : "bg-gray40"
            } w-full flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-center rounded-t-xl`}
          >
            <div
              onClick={onTokenClicked}
              className="hover:cursor-pointer items-center flex mb-6 sm:mb-0"
            >
              <span className="chain-logo-container w-11 h-11 flex justify-center mr-3">
                <img
                  className="chain-logo w-auto h-full"
                  src={token.imageUrl}
                  alt="chain logo"
                />
              </span>
              <span className="w-max">
                <p
                  className="text-white text-center md:text-left flex mb-2"
                  data-testid={`token-name-${token.id}`}
                >
                  {token.name}
                  <Image
                    width={8}
                    height={8}
                    className="arrow-icon mt-1 ml-1 w-2"
                    src="/assets/images/arrow-icon.svg"
                    alt="arrow"
                  />
                </p>
                <p className="text-xs text-white font-medium">
                  {token.distributor}
                </p>
              </span>
            </div>

            <div
              className={
                "flex items-center gap-2 justify-end flex-col md:flex-row !w-full sm:w-auto"
              }
            >
              <div className="w-full sm:w-auto items-center sm:items-end">
                {token.chain.chainName === "Lightning" || (
                  <AddMetamaskButton
                    onClick={addToken}
                    className="font-medium hover:cursor-pointer mx-auto sm:mr-4 text-sm !w-[220px] sm:!w-auto"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png"
                      alt="metamask logo"
                    />
                    Add
                  </AddMetamaskButton>
                )}
              </div>
              <Action className={"w-full sm:w-auto items-center sm:items-end"}>
                {token.isMaxedOut ? (
                  <NoCurrencyButton disabled $fontSize="13px">
                    Empty
                  </NoCurrencyButton>
                ) : collectedToken ? (
                  claimingTokenPk === token.id ||
                  (token.chain.chainName === "Lightning" &&
                    collectedToken.status === "Pending") ? (
                    <ClaimButton
                      data-testid={`chain-pending-claim-${token.id}`}
                      $mlAuto
                      onClick={() => openClaimModal(token)}
                      className="text-sm m-auto"
                    >
                      <p>{`Pending...`}</p>
                    </ClaimButton>
                  ) : collectedToken!.status === "Pending" ? (
                    <ClaimButton
                      data-testid={`chain-show-claim-${token.id}`}
                      $mlAuto
                      onClick={() => openClaimModal(token)}
                      className="text-sm m-auto"
                    >
                      <p>{`Claim ${calculateClaimAmount} ${token.token}`}</p>
                    </ClaimButton>
                  ) : (
                    <ClaimedButton
                      data-testid={`chain-claimed-${token.id}`}
                      $mlAuto
                      $icon="/assets/images/landing/tokentap-icon.png"
                      $iconWidth={24}
                      $iconHeight={24}
                      onClick={() => openClaimModal(token)}
                      className="text-sm bg-g-primary-low border-2 border-space-green m-auto"
                    >
                      <p className="text-gradient-primary flex-[2] font-semibold text-sm">
                        Claimed!
                      </p>
                    </ClaimedButton>
                  )
                ) : token.amount !== 0 ? (
                  <ClaimButton
                    data-testid={`chain-show-claim-${token.id}`}
                    $mlAuto
                    onClick={() => openClaimModal(token)}
                    className="text-sm m-auto"
                  >
                    <p
                      data-testid={`token-claim-text-${token.id}`}
                    >{`Claim ${calculateClaimAmount} ${token.token}`}</p>
                  </ClaimButton>
                ) : (
                  <ClaimedButton
                    data-testid={`chain-claimed-${token.id}`}
                    $mlAuto
                    $icon="/assets/images/claim/claimedIcon.svg"
                    $iconWidth={24}
                    $iconHeight={20}
                    onClick={() => openClaimModal(token)}
                    className="text-sm bg-dark-space-green border-2 border-space-green m-auto"
                  >
                    <p className="text-space-green flex-[2] font-medium text-sm">
                      Claimed!
                    </p>
                  </ClaimedButton>
                )}
              </Action>
            </div>
          </div>
          <Markdown isHighlighted={isHighlighted} content={token.notes} />
          <div
            className={`${
              isHighlighted ? "bg-g-primary-low" : "bg-gray40"
            } pl-6 md:pl-16 pr-6 text-justify pb-3 flex items-center flex-wrap text-xs gap-2 text-white`}
          >
            {(showAllPermissions
              ? token.constraints
              : token.constraints
                  .filter((permission) => permission.type === "VER")
                  .slice(0, 6)
            ).map((permission, key) => (
              <Tooltip
                className={
                  "border-gray70 bg-gray50 hover:bg-gray10 transition-colors border px-3 py-2 rounded-lg "
                }
                data-testid={`token-verification-${token.id}-${permission.name}`}
                key={key}
                text={permission.description}
              >
                <div className="flex items-center gap-3">
                  {permission.title}
                </div>
              </Tooltip>
            ))}

            {token.constraints.length > 6 && (
              <button
                onClick={setShowAllPermissions.bind(null, !showAllPermissions)}
                className="border-gray70 flex items-center z-10 bg-gray60 transition-colors border px-3 py-2 rounded-lg"
              >
                <span>{showAllPermissions ? "Show less" : "Show more"}</span>
                <Image
                  alt="angle-down"
                  width={12}
                  height={7}
                  src="/assets/images/token-tap/angle-down.svg"
                  className={`ml-2 ${
                    showAllPermissions ? "rotate-180" : ""
                  } transition-transform`}
                />
              </button>
            )}
          </div>
        </span>
        <div
          className={`${
            isHighlighted ? "bg-g-primary-low" : "bg-gray30"
          } w-full gap-4 md:gap-0 items-center flex flex-col md:flex-row rounded-b-xl px-4 py-2.5 pr-6 justify-between relative`}
        >
          <div className="flex gap-x-2 items-center text-xs sm:text-sm">
            <p className="text-gray100">
              <span className="text-white">
                {numberWithCommas(
                  token.maxNumberOfClaims - token.numberOfClaims
                )}{" "}
              </span>{" "}
              of{" "}
              <span className="text-white">
                {" "}
                {numberWithCommas(token.maxNumberOfClaims)}{" "}
              </span>{" "}
              are left to claim on
              {" " + token.chain.chainName}
            </p>
            <Icon
              iconSrc={getChainIcon(token.chain)}
              width="auto"
              height="16px"
            />
          </div>

          {!!timePermissionVerification && (
            <Tooltip
              className="px-5 py-2 md:absolute rounded top-0 bottom-0 static left-1/2 md:-translate-x-1/2 text-xs text-gray80 flex items-center justify-center bg-gray20"
              withoutImage
              text={timePermissionVerification.description}
            >
              <div
                data-testid={`token-verification-${token.id}-${timePermissionVerification.name}`}
                className="flex items-center justify-center"
              >
                {timePermissionVerification.title}
                <Icon
                  iconSrc={`/assets/images/token-tap/${
                    timePermissionVerification.name ===
                    "tokenTap.OnceInALifeTimeVerification"
                      ? "non-repeat.svg"
                      : "repeat.svg"
                  }`}
                  className="ml-3"
                />
              </div>
            </Tooltip>
          )}

          <div className="flex gap-x-6 items-center">
            <a target="_blank" rel="noreferrer" href={token.twitterUrl}>
              <Icon
                className="cursor-pointer"
                iconSrc="assets/images/token-tap/twitter-icon.svg"
                width="auto"
                height="20px"
              />
            </a>
            <a target="_blank" rel="noreferrer" href={token.discordUrl}>
              <Icon
                className="cursor-pointer"
                iconSrc="assets/images/token-tap/discord-icon.svg"
                width="auto"
                height="20px"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Action = styled.div`
  display: flex;

  @media only screen and (max-width: ${DV.breakpoints.smallDesktop}) {
    flex-direction: column;
  }
`;

export default TokenCard;
