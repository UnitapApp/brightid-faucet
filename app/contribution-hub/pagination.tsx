"use client";

import {
  ProviderDashboardButtonNext,
  ProviderDashboardButtonSubmit,
} from "./Buttons";

interface PagInationProp {
  handleChangeFormPagePrev: () => void;
  handleNextPage: () => void;
  page: number;
  func?: string | null | boolean;
  isDisabled?: boolean;
}

const Pagination = ({
  handleNextPage,
  func,
  isDisabled = false,
}: PagInationProp) => {
  return (
    <section className="flex flex-col lg:flex-row w-full max-w-[452px] items-center ">
      <div className="flex flex-col-reverse sm:flex-row w-full gap-5">
        {func === "submit" ? (
          <ProviderDashboardButtonSubmit
            $width="100%"
            onClick={handleNextPage}
            className="text-[14px] md:text-[12px] lg:text-[14px] mt-[2px]"
          >
            <p>Submit Contribution</p>
          </ProviderDashboardButtonSubmit>
        ) : (
          <ProviderDashboardButtonNext
            disabled={isDisabled}
            onClick={handleNextPage}
          >
            NEXT
          </ProviderDashboardButtonNext>
        )}
      </div>
    </section>
  );
};

export default Pagination;
