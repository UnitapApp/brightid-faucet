import { useEffect, useState } from "react";
import { ErrorProps, ProviderFormPaginationProp } from "@/types";
import StartDateComp from "./components/StartDateComp";
import ManualDuration from "./components/ManualDuration";
import PeopleLimitation from "./components/PeopleLimitation";
import Pagination from "../../pagination";
import { usePrizeOfferFormContext } from "@/context/providerDashboardContext";

export const TimeEnrollLimitationDescription = {
  id: 1,
  prevIcon: "/assets/images/provider-dashboard/step-1-green.svg",
  activeIcon: "/assets/images/provider-dashboard/step-1-active.svg",
  nextIcon: "/assets/images/provider-dashboard/step-1-off.svg",
  title: "Time/Enrollment Limitation",
  description: "Information of time and enrollment ",
};

const TimeEnrollLimitation = ({
  handleChangeFormPagePrev,
  handleChangeFormPageNext,
}: ProviderFormPaginationProp) => {
  const { page, canGoStepThree, isShowingDetails } = usePrizeOfferFormContext();
  const [showErrors, setShowErrors] = useState<ErrorProps | null>(null);
  const [fadeClass, setFadeClass] = useState("");

  useEffect(() => {
    setFadeClass(page == 1 ? "animate-fadeIn" : "animate-fadeOut");
  }, [page]);

  const handleNextPage = () => {
    if (isShowingDetails) {
      setShowErrors(null);
      handleChangeFormPageNext();
      return;
    }
    const res: any = canGoStepThree();
    if (
      res.endDateStatus &&
      res.startDateStatus &&
      res.numberOfDurationStatus &&
      res.maximumLimitationStatus &&
      res.numberOfWinnersStatus
    ) {
      setShowErrors(null);
      handleChangeFormPageNext();
    } else {
      setShowErrors(res);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full animate-fadeIn ${fadeClass}`}
    >
      <div
        className={`flex flex-col min-h-[340px] gap-5 w-full items-center max-w-[452px] mb-[84px]`}
      >
        <StartDateComp showErrors={showErrors} />
        <ManualDuration showErrors={showErrors} />
        <PeopleLimitation showErrors={showErrors} />
      </div>
      <Pagination
        handleChangeFormPagePrev={handleChangeFormPagePrev}
        handleNextPage={handleNextPage}
        page={page}
      />
    </div>
  );
};

export default TimeEnrollLimitation;
