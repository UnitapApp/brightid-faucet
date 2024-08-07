"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import "react-multi-date-picker/styles/layouts/mobile.css";
import { ErrorProps } from "@/types";
import { useTokenTapFromContext } from "@/context/providerDashboardTokenTapContext";

interface EndDateCompProp {
  showErrors: ErrorProps | null;
}

const EndDateComp = ({ showErrors }: EndDateCompProp) => {
  const {
    data,
    handleSetDate,
    isShowingDetails,
    handleSetEnrollDuration,
    endDateState,
    setEndDateState,
    enrollmentDurations,
  } = useTokenTapFromContext();
  const [endDate, setEndDate] = useState<any>();
  const [minDate, setMinDate] = useState<any>();

  useEffect(() => {
    if (endDateState) {
      setEndDate(endDateState);
    }
    // setMinDate(Date.now() + 7 * 24 * 60 * 59 * 1000);
    setMinDate(Date.now());
  }, []);

  const changeTime = (e: any) => {
    if (e?.unix) {
      handleSetDate(
        Math.round(new Date(e.unix * 1000).setSeconds(0) / 1000),
        "endTime",
      );
    }
    setEndDateState(e);
    setEndDate(e);
  };

  useEffect(() => {
    const checkList = enrollmentDurations.find((item) => item.selected);
    if (checkList) {
      setEndDateState(null);
      setEndDate(null);
    }
  }, [enrollmentDurations]);

  const timePickerClick = (openCalendar: any) => {
    if (isShowingDetails) return;
    openCalendar();
    handleSetEnrollDuration(-1);
  };

  return (
    <div className="relative w-full">
      <div className={`flex`}>
        <DatePicker
          disabled={!data.startTimeStamp || isShowingDetails}
          style={{
            border: "none",
            width: "100%",
            background: "none",
            color: "#b5b5c6",
            display: "none",
          }}
          containerStyle={{
            width: "100%",
          }}
          name="endTime"
          format="DD/MM/YYYY - hh:mm A"
          plugins={[<TimePicker key={0} position="bottom" hideSeconds />]}
          render={(value, openCalendar) => {
            return (
              <p
                className="select-none"
                onClick={() => timePickerClick(openCalendar)}
              >
                or Select Date & Time Manually
              </p>
            );
          }}
          onChange={changeTime}
          value={endDate}
          minDate={minDate}
          className="rmdp-mobile animate-fadeIn"
        />
      </div>
      <p className="absolute m-0 -mt-[.5px] p-0 text-[11px] text-error ">
        {showErrors && !data.endTimeStamp && showErrors.endDateStatusMessage}
      </p>
    </div>
  );
};

export default EndDateComp;
