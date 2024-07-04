"use client";

import { usePrizeTapContext } from "@/context/prizeTapProvider";
import { useUserProfileContext } from "@/context/userProfile";
import { getRaffleConstraintsVerifications } from "@/utils/api";
import { ClaimAndEnrollButton } from "@/components/ui/Button/button";
import Tooltip from "@/components/ui/Tooltip";
import { FC, useEffect, useMemo, useState } from "react";
import { Permission, Prize } from "@/types";
import { replacePlaceholders } from "@/utils";
import Icon from "@/components/ui/Icon";

// const tokenImgLink = (tokenUri: string) =>
//   tokenUri
//     ? `https://ipfs.io/ipfs/QmYmSSQMHaKBByB3PcZeTWesBbp3QYJswMFZYdXs1H3rgA/${
//         Number(tokenUri.split("/")[3]) + 1
//       }.png`
//     : undefined;

const RafflePermissions: FC<{ raffle: Prize }> = ({ raffle }) => {
  const { userToken, userProfile } = useUserProfileContext();
  const [loading, setLoading] = useState(false);
  const { openEnrollModal, selectedRaffleForEnroll } = usePrizeTapContext();
  // const [userTickets, setUserTickets] = useState<number[]>([]);
  const [permissions, SetPermissions] = useState<
    (Permission & { isVerified: boolean })[]
  >([]);

  // useEffect(() => {
  //   if (userProfile) {
  //     const items = Array.from({ length: 10 }, (_, index) => index + 1);
  //     setUserTickets(items);
  //     // const items = Array.from({ length: userProfile.prizetapWinningChanceNumber }, (_, index) => index + 1);
  //     // setUserTickets(items);
  //   }
  // }, [userProfile]);

  // const handleSelectTicket = () => {}

  const params = useMemo(
    () => JSON.parse(raffle.constraintParams),
    [raffle.constraintParams],
  );

  useEffect(() => {
    setLoading(true);
    if (!userToken) {
      setLoading(false);
      return;
    }

    getRaffleConstraintsVerifications(raffle.pk, userToken)
      .then((res) => {
        console.log(res.constraints);
        SetPermissions(res.constraints);
      })
      .catch(() => {
        SetPermissions(
          raffle.constraints.map((constraint) => ({
            ...constraint,
            isVerified: false,
          })),
        );
      })
      .finally(() => setLoading(false));
  }, [userToken, raffle.constraints, raffle.pk, SetPermissions]);

  return (
    <div className="w-full">
      <div className="relative mb-20 text-center">
        <div
          className={`${
            raffle.isPrizeNft
              ? "bg-[url('/assets/images/prize-tap/nft-cover.svg')]"
              : "bg-[url('/assets/images/prize-tap/cover.svg')]"
          } mx-auto h-40 w-64 rounded-lg bg-cover`}
        />
        <img
          src={raffle.imageUrl}
          className="absolute left-1/2 top-5 max-w-[120px] -translate-x-1/2"
          alt={raffle.name}
          width={168}
        />
      </div>

      {/* {userProfile && (
        <div className="flex h-[126px] w-full flex-col overflow-hidden rounded-xl border border-gray70 bg-gray60">
          <div className="flex h-8 items-center bg-gray50 pl-2 text-xs font-medium text-gray100">
            Drag & Drop more tickets to increase your chance to win!
          </div>
          <div
            className="relative flex h-[62px] w-full"
            onClick={() => handleSelectTicket()}
          >
            {userTickets.map((item) => (
              <Icon
                iconSrc="/assets/images/prize-tap/userTicket.svg"
                className="-mr-10 cursor-pointer"
              />
            ))}
          </div>
          <div className="flex h-8 items-center justify-between bg-gray50 px-2 text-xs font-bold text-gray100">
            <div className="">
              You have{" "}
              <span className="text-[#a69fe5]">
                {userProfile.prizetapWinningChanceNumber}
              </span>{" "}
              tickets
            </div>
            <div>1x chance</div>
          </div>
        </div>
      )} */}

      {loading ? (
        <div className="relative mt-10 animate-pulse">
          <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden text-xs">
            {Array.from(new Array(5)).map((_, index) => (
              <div
                key={index}
                className="relative inline-block h-7 w-20 flex-1 rounded-lg border border-gray70 bg-gray50 px-2 py-2"
              />
            ))}
          </div>

          <div className="relative mt-5 h-14 w-full rounded-xl border-2 border-solid border-gray70 bg-gray50 py-3 text-center"></div>
        </div>
      ) : (
        <>
          <div
            className={`flex flex-wrap items-center gap-2 text-xs text-white`}
          >
            {permissions.map((permission, key) => (
              <Tooltip
                className={
                  "rounded-lg border border-gray70 bg-gray50 px-2 py-2 transition-colors hover:bg-gray10 " +
                  (permission.isVerified ? "text-space-green" : "text-warn")
                }
                data-testid={`token-verification-modal-${raffle.pk}-${permission.name}`}
                key={key}
                text={replacePlaceholders(
                  (permission.isReversed
                    ? permission.negativeDescription
                    : permission.description)!,
                  params[permission.name],
                )}
              >
                <div className="flex items-center gap-1">
                  <img
                    src={
                      permission.isVerified
                        ? "/assets/images/token-tap/check.svg"
                        : "/assets/images/token-tap/not-verified.svg"
                    }
                  />
                  {permission.isReversed && "Not "}
                  {permission.title}
                </div>
              </Tooltip>
            ))}
          </div>

          {permissions.some((item) => !item.isVerified) ? (
            <button
              disabled
              className="mt-5 w-full rounded-xl border-2 border-solid border-warn bg-[#392821] py-3 text-center text-warn"
            >
              Complete requirements first!
            </button>
          ) : (
            <ClaimAndEnrollButton
              height="48px"
              $fontSize="14px"
              disabled={new Date(raffle.startAt) > new Date()}
              className="mt-5 !w-full"
              onClick={() => openEnrollModal(raffle, "Enroll")}
            >
              <div className="relative w-full">
                <p>Enroll</p>
              </div>
            </ClaimAndEnrollButton>
          )}
        </>
      )}
    </div>
  );
};

export default RafflePermissions;
