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
import { watchAsset } from "viem/actions";

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

    const provider = await connector?.getClient?.();

    if (!provider) return;

    try {
      watchAsset(provider, {
        options: {
          decimals: token.chain.decimals,
          symbol: token.token,
          image: token.imageUrl,
          address: token.tokenAddress,
        },
        type: "ERC20",
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
    [claimedTokensList, token],
  );

  const calculateClaimAmount =
    token.chain.chainName === "Lightning"
      ? token.amount
      : token.amount / 10 ** token.chain.decimals;

  const timePermissionVerification = useMemo(
    () => token.constraints.find((permission) => permission.type === "TIME"),
    [token],
  );

  return (
    <div>
      <div
        className={`token-card flex ${
          isHighlighted
            ? "gradient-outline-card mb-20 p-0 before:!inset-[3px]"
            : "mb-4"
        } mb-4 w-full flex-col items-center justify-center`}
      >
        <span className="flex w-full flex-col">
          <div
            className={`pb-4 pl-3 pr-6 pt-4 ${
              isHighlighted ? "bg-g-primary-low" : "bg-gray40"
            } flex w-full flex-col items-center justify-between gap-2 rounded-t-xl md:flex-row md:gap-0`}
          >
            <div
              onClick={onTokenClicked}
              className="mb-6 flex items-center hover:cursor-pointer sm:mb-0"
            >
              <span className="chain-logo-container mr-3 flex h-11 w-11 justify-center rounded-full">
                <img
                  className="chain-logo h-full w-auto"
                  src={token.imageUrl}
                  alt="chain logo"
                />
              </span>
              <span className="w-max">
                <p
                  className="mb-2 flex text-center text-white md:text-left"
                  data-testid={`token-name-${token.id}`}
                >
                  {token.name}
                  <Image
                    width={8}
                    height={8}
                    className="arrow-icon ml-1 mt-1 w-2"
                    src="/assets/images/arrow-icon.svg"
                    alt="arrow"
                  />
                </p>
                <p className="text-xs font-medium text-white">
                  {token.distributor}
                </p>
              </span>
            </div>

            <div
              className={
                "flex !w-full flex-col items-center justify-end gap-2 sm:w-auto md:flex-row"
              }
            >
              <div className="w-full items-center sm:w-auto sm:items-end">
                {token.chain.chainName === "Lightning" || (
                  <AddMetamaskButton
                    onClick={addToken}
                    className="mx-auto !w-[220px] text-sm font-medium hover:cursor-pointer sm:mr-4 sm:!w-auto"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png"
                      alt="metamask logo"
                    />
                    Add
                  </AddMetamaskButton>
                )}
              </div>
              <Action className={"w-full items-center sm:w-auto sm:items-end"}>
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
                      className="m-auto text-sm"
                    >
                      <p>{`Pending...`}</p>
                    </ClaimButton>
                  ) : collectedToken!.status === "Pending" ? (
                    <ClaimButton
                      data-testid={`chain-show-claim-${token.id}`}
                      $mlAuto
                      onClick={() => openClaimModal(token)}
                      className="m-auto text-sm"
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
                      className="m-auto border-2 border-space-green bg-g-primary-low text-sm"
                    >
                      <p className="text-gradient-primary flex-[2] text-sm font-semibold">
                        Claimed!
                      </p>
                    </ClaimedButton>
                  )
                ) : token.amount !== 0 ? (
                  <ClaimButton
                    data-testid={`chain-show-claim-${token.id}`}
                    $mlAuto
                    onClick={() => openClaimModal(token)}
                    className="m-auto text-sm"
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
                    className="m-auto border-2 border-space-green bg-dark-space-green text-sm"
                  >
                    <p className="flex-[2] text-sm font-medium text-space-green">
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
            } flex flex-wrap items-center gap-2 pb-3 pl-6 pr-6 text-justify text-xs text-white md:pl-16`}
          >
            {(showAllPermissions
              ? token.constraints
              : token.constraints
                  .filter((permission) => permission.type === "VER")
                  .slice(0, 6)
            ).map((permission, key) => (
              <Tooltip
                className={
                  "rounded-lg border border-gray70 bg-gray50 px-3 py-2 transition-colors hover:bg-gray10 "
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
                className="z-10 flex items-center rounded-lg border border-gray70 bg-gray60 px-3 py-2 transition-colors"
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
          } relative flex w-full flex-col items-center justify-between gap-4 rounded-b-xl px-4 py-2.5 pr-6 md:flex-row md:gap-0`}
        >
          <div className="flex items-center gap-x-2 text-xs sm:text-sm">
            <p className="text-gray100">
              <span className="text-white">
                {numberWithCommas(
                  token.maxNumberOfClaims - token.numberOfClaims,
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
              className="static bottom-0 left-1/2 top-0 flex items-center justify-center rounded bg-gray20 px-5 py-2 text-xs text-gray80 md:absolute md:-translate-x-1/2"
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

          <div className="flex items-center gap-x-6">
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
