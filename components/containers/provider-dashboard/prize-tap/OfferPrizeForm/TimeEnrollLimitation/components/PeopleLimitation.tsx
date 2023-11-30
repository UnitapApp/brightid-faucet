import Icon from "@/components/ui/Icon";
import { usePrizeOfferFormContext } from "@/context/providerDashboardContext";
import { ErrorProps } from "@/types";

interface PeopleLimitationProp {
  showErrors: ErrorProps | null;
}

const PeopleLimitation = ({ showErrors }: PeopleLimitationProp) => {
  const {
    data,
    handleChange,
    handleSelectLimitEnrollPeopleCheck,
    isShowingDetails,
  } = usePrizeOfferFormContext();
  return (
    <div className="text-gray80 text-[12px] w-full max-w-[452px] relative mt-[-2px]">
      <div
        className="flex w-full gap-2 items-center cursor-pointer mb-[8px]"
        onClick={handleSelectLimitEnrollPeopleCheck}
      >
        <Icon
          iconSrc={
            !data.limitEnrollPeopleCheck
              ? "/assets/images/provider-dashboard/checkbox.svg"
              : "/assets/images/provider-dashboard/check-true.svg"
          }
          width="16px"
          height="16px"
          hoverable={true}
        />
        <p className="text-gray100 text-[14px]">
          Also use maximum number of enrolling people limitation.
        </p>
      </div>
      <div
        className={`border ${
          showErrors &&
          !showErrors.maximumLimitationStatus &&
          data.limitEnrollPeopleCheck &&
          !data.maxNumberOfEntries
            ? "border-error"
            : "border-gray50"
        }  ${
          data.limitEnrollPeopleCheck ? "bg-gray40" : "bg-gray30 opacity-[.5] "
        } h-[43px] rounded-xl px-3 `}
      >
        <input
          type="number"
          placeholder="Maximum Number of enrolling people"
          className="provider-dashboard-input"
          name="maxNumberOfEntries"
          min={0}
          onChange={handleChange}
          value={data.maxNumberOfEntries ? data.maxNumberOfEntries : ""}
          disabled={!data.limitEnrollPeopleCheck || isShowingDetails}
        />
      </div>
      {showErrors &&
        !showErrors.maximumLimitationStatus &&
        data.limitEnrollPeopleCheck &&
        !data.maxNumberOfEntries && (
          <p className="text-error text-[10px] m-0 p-0 absolute left-1">
            {showErrors?.maximumLimitationMessage}
          </p>
        )}
    </div>
  );
};

export default PeopleLimitation;
