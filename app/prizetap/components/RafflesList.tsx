"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { Prize } from "@/types";
import Icon from "@/components/ui/Icon";
import {
  ClaimAndEnrollButton,
  ClaimPrizeButton,
  EnrolledButton,
} from "@/components/ui/Button/button";
import styled from "styled-components";
import { DV } from "@/components/ui/designVariables";
import Tooltip from "@/components/ui/Tooltip";
import { numberWithCommas } from "@/utils/numbers";
import { LineaRaffleCard } from "./Linea";
import { usePrizeTapContext } from "@/context/prizeTapProvider";
import { useSearchParams } from "next/navigation";
import { useUserProfileContext } from "@/context/userProfile";
import Image from "next/image";
import { FAST_INTERVAL, LINEA_RAFFLE_PK } from "@/constants";
import { getAssetUrl, replacePlaceholders, shortenAddress } from "@/utils";

import { zeroAddress } from "viem";
import { useFastRefresh, useRefreshWithInitial } from "@/utils/hooks/refresh";
import ReactMarkdown from "react-markdown";

export const Action = styled.div`
  display: flex;

  @media only screen and (max-width: ${DV.breakpoints.smallDesktop}) {
    flex-direction: column;
  }
`;

const RafflesList = () => {
  const params = useSearchParams();
  const { rafflesList } = usePrizeTapContext();
  const [highlightedPrize, setHighlightedPrize] = useState("");

  const prizesSortListMemo = useMemo(
    () =>
      rafflesList.sort((a, b) => {
        const lowerHighlightChainName = highlightedPrize.toLowerCase();

        if (a.name.toLowerCase() === lowerHighlightChainName) return -1;
        if (b.name.toLowerCase() === lowerHighlightChainName) return 1;

        return 0;
      }),
    [rafflesList, highlightedPrize],
  );

  useEffect(() => {
    const highlightedPrize = params.get("icebox");

    setHighlightedPrize(highlightedPrize || "");
  }, [params, setHighlightedPrize]);

  return (
    <div className="wrap mb-4 grid w-full gap-4 md:flex-row">
      {!!prizesSortListMemo.length && (
        <div>
          <RaffleCardWrapper
            raffle={prizesSortListMemo[0]}
            isHighlighted={
              highlightedPrize.toLocaleLowerCase() ===
              rafflesList[0].name.toLocaleLowerCase()
            }
          />
        </div>
      )}

      {prizesSortListMemo.slice(1).map((rafflesList, index) => (
        <div key={index}>
          <RaffleCardWrapper key={rafflesList.pk} raffle={rafflesList} />
        </div>
      ))}
    </div>
  );
};

const RaffleCardWrapper: FC<{ raffle: Prize; isHighlighted?: boolean }> = (
  props,
) => {
  if (props.raffle.pk === LINEA_RAFFLE_PK)
    return <LineaRaffleCard {...props} />;

  return <RaffleCard {...props} />;
};

const RaffleCard: FC<{ raffle: Prize; isHighlighted?: boolean }> = ({
  raffle,
  isHighlighted,
}) => {
  const {
    imageUrl,
    tokenUri,
    creatorUrl,
    twitterUrl,
    discordUrl,
    creatorName,
    description,
    startAt,
    deadline,
    name,
    prizeName,
    chain,
    isExpired,
    numberOfOnchainEntries,
    maxNumberOfEntries,
    isPrizeNft,
    userEntry,
    prizeSymbol,
    decimals,
    prizeAmount,
    creatorProfile,
    winnerEntries: winnersEntry,

    winnersCount,
    status,
  } = raffle;

  const params = useMemo(
    () => JSON.parse(raffle.constraintParams),
    [raffle.constraintParams],
  );

  const creator = creatorName || creatorProfile?.username;

  const { openEnrollModal } = usePrizeTapContext();
  const { userProfile } = useUserProfileContext();
  const remainingPeople = maxNumberOfEntries - numberOfOnchainEntries;
  const isRemainingPercentLessThanTen =
    remainingPeople < (maxNumberOfEntries / 100) * 10;
  const start = new Date(startAt) < new Date();
  const [showAllPermissions, setShowAllPermissions] = useState(false);

  const userClaimEntry = useMemo(
    () => winnersEntry?.find((item) => item.userProfile.pk === userProfile?.pk),
    [userProfile, winnersEntry],
  );

  // let tokenImgLink: string | undefined = tokenUri
  //   ? `https://ipfs.io/ipfs/QmYmSSQMHaKBByB3PcZeTWesBbp3QYJswMFZYdXs1H3rgA/${
  //       Number(tokenUri.split("/")[3]) + 1
  //     }.png`
  //   : undefined;

  const prizeLink = getAssetUrl(chain, raffle.prizeAsset!);

  const onPrizeClick = () => {
    if (raffle.prizeAsset == zeroAddress) return;
    if (prizeLink) window.open(prizeLink, "_blank");
  };

  return (
    <div
      className={`${isPrizeNft ? "prize-card-bg-1" : "prize-card-bg-2"} ${
        isHighlighted ? "mb-20" : "mb-4"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-gray30 p-5 lg:flex-row lg:bg-inherit lg:p-0">
        <div className="prize-card__image relative mb-3 lg:mb-0">
          <div
            className={
              isHighlighted
                ? "gradient-outline-card p-[2px] before:!inset-[2px]"
                : ""
            }
          >
            <div
              className={`prize-card__container flex h-[212px] w-[212px] flex-col ${
                isHighlighted
                  ? "bg-g-primary-low "
                  : "border-2 border-gray40 bg-gray30"
              } items-center justify-center rounded-xl p-5`}
            >
              {imageUrl && (
                <img
                  onClick={onPrizeClick}
                  src={imageUrl}
                  alt={name}
                  width={!isPrizeNft ? "168px" : ""}
                  className={`${!isPrizeNft ? "ml-1" : ""} mb-2 cursor-pointer`}
                />
              )}
              {/* {!isPrizeNft && (
								<div className="prize__amount" data-amount={calculateClaimAmount + '   ' + prizeSymbol}>
									{calculateClaimAmount + '  ' + prizeSymbol}
								</div>
							)} */}
            </div>
          </div>
          <div className="absolute bottom-[-10px] left-[40px] flex min-w-[130px] items-center justify-center rounded-md border-2 border-gray70 bg-gray50">
            <p className="p-1 text-2xs text-gray100"> on {chain.chainName} </p>
            <Icon iconSrc={chain.logoUrl} width="20px" height="16px" />
          </div>
        </div>
        <div
          className={
            isHighlighted
              ? "gradient-outline-card w-full p-[2px] before:!inset-[3px]"
              : "w-full"
          }
        >
          <div
            className={`card prize-card__content relative z-10 h-full md:max-h-[225px] md:min-h-[212px] ${
              isHighlighted
                ? "bg-g-primary-low"
                : "border-2 border-gray40 bg-gray30"
            } flex h-full w-full flex-col rounded-xl p-4 pt-3`}
          >
            <span className="mb-1 flex w-full items-center">
              <p
                className="cursor-pointer text-sm text-white"
                onClick={onPrizeClick}
              >
                {prizeName}
              </p>
              {winnersCount > 1 && (
                <small className="ml-5 rounded-xl bg-gray10 p-1 px-2 text-xs font-semibold text-gray100">
                  {winnersCount}x Winners
                </small>
              )}
              <div className="ml-auto flex gap-4">
                {twitterUrl && (
                  <Icon
                    iconSrc="assets/images/prize-tap/twitter-logo.svg"
                    onClick={() => window.open(twitterUrl, "_blank")}
                    width="20px"
                    height="16px"
                    hoverable
                  />
                )}
                {discordUrl && (
                  <Icon
                    iconSrc="assets/images/prize-tap/discord-logo.svg"
                    onClick={() => window.open(discordUrl, "_blank")}
                    width="20px"
                    height="16px"
                    hoverable
                  />
                )}
              </div>
            </span>
            <span className="mb-4 flex w-full justify-between">
              <p className="prize-card__source text-xs text-gray90">
                {!isPrizeNft ? (
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => window.open(creatorUrl, "_blank")}
                  >
                    by {creator}
                  </span>
                ) : (
                  <span
                    className="hover:cursor-pointer"
                    onClick={() => window.open(creatorUrl, "_blank")}
                  >
                    by {creator}
                  </span>
                )}
              </p>
            </span>
            <ReactMarkdown
              className={`prize-card__description mb-2 shrink-0 grow basis-auto text-xs leading-5 text-gray100 ${
                isHighlighted ? "bg-g-primary-low" : "!bg-gray30"
              } text-justify`}
            >
              {description}
            </ReactMarkdown>

            {!winnersEntry.length &&
              !userEntry?.txHash &&
              !raffle.isExpired && (
                <span className="mb-3 text-xs">
                  <div
                    className={`flex flex-wrap items-center gap-2 text-xs text-white`}
                  >
                    {(showAllPermissions
                      ? raffle.constraints
                      : raffle.constraints
                          .filter((permission) => permission.type === "VER")
                          .slice(0, 6)
                    ).map((permission, key) => (
                      <Tooltip
                        onClick={openEnrollModal.bind(null, raffle, "Verify")}
                        className={
                          "rounded-lg border border-gray70 bg-gray50 px-3 py-2 transition-colors hover:bg-gray10 "
                        }
                        data-testid={`token-verification-${raffle.id}-${permission.name}`}
                        key={key}
                        text={replacePlaceholders(
                          (permission.isReversed
                            ? permission.negativeDescription
                            : permission.description)!,
                          params[permission.name],
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {permission.isReversed && "Not "}
                          {permission.title}
                        </div>
                      </Tooltip>
                    ))}

                    {raffle.constraints.length > 6 && (
                      <button
                        onClick={setShowAllPermissions.bind(
                          null,
                          !showAllPermissions,
                        )}
                        className="z-10 flex items-center rounded-lg border border-gray70 bg-gray60 px-3 py-2 transition-colors"
                      >
                        <span>
                          {showAllPermissions ? "Show less" : "Show more"}
                        </span>
                        <Image
                          width={12}
                          height={7}
                          alt="angle down"
                          src="/assets/images/token-tap/angle-down.svg"
                          className={`ml-2 ${
                            showAllPermissions ? "rotate-180" : ""
                          } transition-transform`}
                        />
                      </button>
                    )}
                  </div>
                </span>
              )}

            <Action className={"w-full items-center sm:w-auto sm:items-end "}>
              {(isExpired && !winnersEntry.length && !userEntry?.txHash) ||
              (!winnersEntry.length &&
                !userEntry?.txHash &&
                maxNumberOfEntries === numberOfOnchainEntries) ? (
                <span className="flex w-full flex-col items-center justify-between gap-4 md:flex-row ">
                  <div className="flex w-full flex-col justify-between gap-4 rounded-xl bg-gray40 px-5 py-1 sm:flex-row md:items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-2xs text-white">
                        {start ? "Winners Announced in:" : "Starts in:"}
                      </p>
                      <p className="text-2xs text-gray100">
                        {maxNumberOfEntries >= 1_000_000_000
                          ? `${numberWithCommas(
                              numberOfOnchainEntries,
                            )} people enrolled`
                          : !isRemainingPercentLessThanTen
                            ? `
											${numberOfOnchainEntries} / ${numberWithCommas(
                        maxNumberOfEntries,
                      )} people enrolled`
                            : remainingPeople > 0
                              ? `${remainingPeople} people remains`
                              : `${numberWithCommas(
                                  maxNumberOfEntries,
                                )} people enrolled`}
                      </p>
                    </div>
                    <RaffleCardTimer
                      startTime={startAt}
                      FinishTime={deadline}
                    />
                  </div>
                  <ClaimAndEnrollButton
                    disabled={true}
                    className="!w-full min-w-[552px] md:!w-[352px]"
                    height="48px"
                    $fontSize="14px"
                  >
                    {" "}
                    <div className="relative w-full">
                      {maxNumberOfEntries === numberOfOnchainEntries ? (
                        <p> Full</p>
                      ) : (
                        <p> Unavailable</p>
                      )}
                      <Icon
                        className="absolute right-0 top-[-2px]"
                        iconSrc="assets/images/prize-tap/header-prize-logo.svg"
                        width="27px"
                        height="24px"
                      />
                    </div>
                  </ClaimAndEnrollButton>
                </span>
              ) : !winnersEntry.length && !userEntry?.txHash ? (
                <span className="flex w-full flex-col items-center justify-between gap-4 md:flex-row ">
                  <div className="flex w-full flex-col justify-between gap-4 rounded-xl bg-gray40 px-5 py-1 sm:flex-row md:items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-2xs text-white">
                        {start ? "Winners Announced in:" : "Starts in:"}
                      </p>
                      <p className="text-2xs text-gray100">
                        {maxNumberOfEntries >= 1_000_000_000
                          ? `${numberWithCommas(
                              numberOfOnchainEntries,
                            )} people enrolled`
                          : !isRemainingPercentLessThanTen
                            ? `
													${numberOfOnchainEntries} / ${numberWithCommas(
                            maxNumberOfEntries,
                          )} people enrolled`
                            : remainingPeople > 0
                              ? `${remainingPeople} people remains`
                              : `${numberWithCommas(
                                  maxNumberOfEntries,
                                )} people enrolled`}
                      </p>
                    </div>
                    <RaffleCardTimer
                      startTime={startAt}
                      FinishTime={deadline}
                    />
                  </div>
                  <ClaimAndEnrollButton
                    height="48px"
                    $fontSize="14px"
                    disabled={!start}
                    className="!w-full min-w-[552px] md:!w-[352px]"
                    onClick={() => openEnrollModal(raffle, "Verify")}
                  >
                    {" "}
                    <div className="relative w-full">
                      <p className="bg-g-primary bg-clip-text text-transparent">
                        Enroll
                      </p>{" "}
                      <Icon
                        className="absolute right-0 top-[-2px]"
                        iconSrc="assets/images/prize-tap/header-prize-logo.svg"
                        width="27px"
                        height="24px"
                      />
                    </div>
                  </ClaimAndEnrollButton>
                </span>
              ) : !winnersEntry.length && userEntry?.txHash ? (
                <span className="flex w-full flex-col items-center justify-between gap-4 md:flex-row ">
                  <div className="flex w-full flex-col justify-between gap-4 rounded-xl bg-gray40 px-5 py-1 sm:flex-row md:items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-2xs text-white">
                        {start ? "Winners Announced in:" : "Starts in:"}
                      </p>
                      <p className="text-2xs text-gray100">
                        {maxNumberOfEntries >= 1_000_000_000
                          ? `${numberWithCommas(
                              numberOfOnchainEntries,
                            )} people enrolled`
                          : !isRemainingPercentLessThanTen
                            ? `
													${numberOfOnchainEntries} / ${numberWithCommas(
                            maxNumberOfEntries,
                          )} people enrolled`
                            : remainingPeople > 0
                              ? `${remainingPeople} people remains`
                              : `${numberWithCommas(
                                  maxNumberOfEntries,
                                )} people enrolled`}
                      </p>
                    </div>
                    <RaffleCardTimer
                      startTime={startAt}
                      FinishTime={deadline}
                    />
                  </div>
                  <EnrolledButton
                    disabled={true}
                    className="!w-full  min-w-[552px] md:!w-[352px]"
                    height="48px"
                    $fontSize="14px"
                  >
                    <div className="relative flex w-full">
                      <span
                        className={`${
                          !winnersEntry.length &&
                          new Date(deadline) < new Date()
                            ? "text-sm"
                            : ""
                        } bg-g-primary bg-clip-text text-transparent`}
                      >
                        {!winnersEntry.length && new Date(deadline) < new Date()
                          ? "Raffle is being processed"
                          : "Enrolled"}
                      </span>
                      <Icon
                        className="absolute right-0 top-[-2px]"
                        iconSrc="/assets/images/prize-tap/enrolled-ticket.svg"
                        width="27px"
                        height="24px"
                      />
                    </div>
                  </EnrolledButton>
                </span>
              ) : winnersEntry && !userClaimEntry ? (
                <div className="flex w-full flex-1 items-center gap-4">
                  <span className="align-center flex h-[70px] w-full items-center justify-between overflow-hidden rounded-xl bg-gray10 py-1 font-medium leading-[15px] md:h-[48px] md:leading-[normal]">
                    <p className="ml-4 text-2xs text-gray100">
                      {maxNumberOfEntries >= 1_000_000_000
                        ? `${numberWithCommas(
                            numberOfOnchainEntries,
                          )} people enrolled`
                        : !isRemainingPercentLessThanTen
                          ? `
													${numberOfOnchainEntries} / ${numberWithCommas(
                            maxNumberOfEntries,
                          )} people enrolled`
                          : `${numberWithCommas(
                              maxNumberOfEntries,
                            )} people enrolled`}
                    </p>
                    <Icon
                      className="mt-[-25px] opacity-[.3]  md:mt-[-10px] "
                      iconSrc="assets/images/prize-tap/winner_bg_diamond.svg"
                      width="215px"
                      height="215px"
                    />
                  </span>

                  <ClaimAndEnrollButton
                    height="48px"
                    $fontSize="14px"
                    className="!w-full  min-w-[552px] md:!w-[352px]"
                    onClick={() => openEnrollModal(raffle, "Winners")}
                  >
                    <div className="relative w-full">
                      <span className="bg-g-primary bg-clip-text text-transparent">
                        Check Winners
                      </span>
                    </div>
                  </ClaimAndEnrollButton>
                </div>
              ) : !!winnersEntry.length &&
                !!userClaimEntry &&
                !userClaimEntry.claimingPrizeTx ? (
                <span className="flex w-full flex-col items-center justify-between gap-4 md:flex-row ">
                  <div className="winner-box-bg flex h-[48px] w-full items-center justify-between gap-4 overflow-hidden rounded-xl  px-5 py-1">
                    <p className="text-2xs text-white">
                      Congratulations @
                      {userProfile?.username ||
                        shortenAddress(userProfile?.wallets?.[0].address)}{" "}
                      ! claim your prize now.
                    </p>
                    <Icon
                      className="mr-[-20px] mt-[-10px] opacity-[.3]"
                      iconSrc="assets/images/prize-tap/winner_bg_diamond.svg"
                      width="215px"
                      height="215px"
                    />
                  </div>

                  <ClaimPrizeButton
                    height="48px"
                    $fontSize="14px"
                    className="!w-full min-w-[552px] md:!w-[352px]"
                    onClick={() => openEnrollModal(raffle, "Claim")}
                  >
                    {" "}
                    <div className="relative w-full text-gray10">
                      <p> Claim Prize</p>{" "}
                    </div>
                  </ClaimPrizeButton>
                </span>
              ) : (
                <span className="flex w-full flex-col items-center justify-between gap-4 md:flex-row ">
                  <div className="winner-box-bg flex h-[48px] w-full items-center justify-between gap-4 overflow-hidden rounded-xl  py-1 pl-5">
                    <p className="text-2xs text-white">
                      Congratulations @
                      {userProfile?.username ||
                        shortenAddress(userProfile?.wallets?.[0].address)}
                      !
                    </p>
                    <Icon
                      className="mt-[-10px] opacity-[.3]"
                      iconSrc="assets/images/prize-tap/winner_bg_diamond.svg"
                      width="215px"
                      height="215px"
                    />
                  </div>
                  <div className="claimed-prize !w-full md:!w-[352px]">
                    <div className="relative">
                      <p className="!font-semibold">Claimed</p>
                      <Icon
                        className="absolute right-0 top-[-2px]"
                        iconSrc="assets/images/prize-tap/header-prize-logo.svg"
                        width="27px"
                        height="24px"
                      />
                    </div>
                  </div>
                </span>
              )}
            </Action>
          </div>
        </div>
      </div>
    </div>
  );
};

type RaffleCardTimerProps = {
  startTime: string;
  FinishTime: string;
};

export const RaffleCardTimer = ({
  startTime,
  FinishTime,
}: RaffleCardTimerProps) => {
  const [now, setNow] = useState(new Date());
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [start, setStarted] = useState<boolean>(true);

  const startTimeDate = useMemo(() => new Date(startTime), [startTime]);

  const FinishTimeDate = useMemo(
    () => new Date(start ? FinishTime : new Date()),
    [FinishTime, start],
  );

  const deadline = useMemo(
    () =>
      startTimeDate.getTime() > now.getTime() ? startTimeDate : FinishTimeDate,
    [startTimeDate, FinishTimeDate, now],
  );

  useEffect(() => {
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) {
      setDays("00");
      setHours("00");
      setMinutes("00");
      setSeconds("00");

      return;
    }
    // time calculations for days, hours, minutes and seconds
    const newDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setSeconds(seconds < 10 ? `0${seconds}` : seconds.toString());
    setMinutes(minutes < 10 ? `0${minutes}` : minutes.toString());
    setHours(hours < 10 ? `0${hours}` : hours.toString());
    setDays(newDays < 10 ? `0${newDays}` : newDays.toString());
  }, [now, deadline]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStarted(new Date(startTime) < new Date());
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [startTime]);

  return (
    <div className="prize-card__timer flex items-center justify-between gap-4 rounded-xl py-2 md:px-3">
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold text-white">
          {days}
        </p>
        <p className="prize-card__timer-item-label text-gray90">d</p>
      </div>
      <p className="text-sm text-white">:</p>
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold text-white">
          {hours}
        </p>
        <p className="prize-card__timer-item-label text-gray90">h</p>
      </div>
      <p className="text-sm text-white">:</p>
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold text-white">
          {minutes}
        </p>
        <p className="prize-card__timer-item-label text-gray90">m</p>
      </div>
      <p className="text-sm text-white">:</p>
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold text-white">
          {seconds}
        </p>
        <p className="prize-card__timer-item-label text-gray90">s</p>
      </div>
    </div>
  );
};

export const RaffleCardTimerLandingPage = ({
  startTime,
  FinishTime,
}: RaffleCardTimerProps) => {
  const [now, setNow] = useState(new Date());
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  let startTimeDate = useMemo(() => new Date(startTime), [startTime]);
  let FinishTimeDate = useMemo(() => new Date(FinishTime), [FinishTime]);

  let deadline = useMemo(
    () =>
      startTimeDate.getTime() > now.getTime() ? startTimeDate : FinishTimeDate,
    [startTimeDate, FinishTimeDate, now],
  );

  useEffect(() => {
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) {
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setSeconds(seconds < 10 ? `0${seconds}` : seconds.toString());
    setMinutes(minutes < 10 ? `0${minutes}` : minutes.toString());
    setHours(hours < 10 ? `0${hours}` : hours.toString());
    setDays(days < 10 ? `0${days}` : days.toString());
  }, [now, deadline]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="prize-card__timer mt-[-2px] flex items-center gap-1 text-gray100 md:px-1">
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold">{days}</p>
      </div>
      <p className="text-sm">:</p>
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold">{hours}</p>
      </div>
      <p className="text-sm">:</p>
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold">{minutes}</p>
      </div>
      <p className="text-sm">:</p>
      <div className="prize-card__timer-item flex flex-col items-center justify-between text-2xs">
        <p className="prize-card__timer-item-value font-semibold">{seconds}</p>
      </div>
    </div>
  );
};

export default RafflesList;
