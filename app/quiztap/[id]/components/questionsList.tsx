import { useQuizContext } from "@/context/quizProvider";
import { FC, useEffect, useRef } from "react";

const QuestionsList = () => {
  return (
    <div className="mt-10 flex rounded-xl border-2 border-gray50 bg-gray20 p-4">
      <QuestionItem index={1} />
      <Separator />
      <QuestionItem index={2} />
      <Separator />
      <QuestionItem index={3} />
      <Separator />
      <QuestionItem index={4} />
      <Separator />
      <QuestionItem index={5} />
      <Separator />
      <QuestionItem index={6} />
      <Separator />
      <QuestionItem index={7} />
      <Separator />
      <QuestionItem index={8} />
      <Separator />
      <QuestionItem index={9} />
      <Separator />
      <QuestionItem index={10} />
    </div>
  );
};

const Separator = () => {
  return <div className="mx-2 my-auto h-[2px] w-7 rounded-lg bg-gray100"></div>;
};

const QuestionItem: FC<{ index: number }> = ({ index }) => {
  const { stateIndex, timer, isRestTime } = useQuizContext();

  const ref = useRef<SVGRectElement>(null);

  useEffect(() => {
    var progress: any = ref.current;

    if (!progress) return;

    var borderLen = progress.getTotalLength() + 5,
      offset = borderLen;
    progress.style.strokeDashoffset = borderLen;
    progress.style.strokeDasharray = borderLen + "," + borderLen;
    let anim = window.requestAnimationFrame(progressBar);

    function progressBar() {
      offset -= 1;
      progress.style.strokeDashoffset = offset;
      anim = window.requestAnimationFrame(progressBar);
      if (offset < 0) window.cancelAnimationFrame(anim);
    }
  }, [stateIndex]);

  if (index === stateIndex || isRestTime)
    return (
      <div
        className={`relative grid h-9 w-9 place-content-center rounded-lg border-2 ${index > stateIndex ? "border-gray50" : "border-dark-space-green"} bg-gray20 text-gray100`}
      >
        {index}
      </div>
    );

  return (
    <div
      className={`progress relative  h-9 w-9  rounded-lg  ${index > stateIndex ? "border-2 border-gray50" : index === stateIndex ? "" : "border-2 border-dark-space-green"} bg-gray20 text-gray100`}
    >
      <div className="absolute inset-0 grid place-content-center text-sm">
        {index}
      </div>
      {index === stateIndex && (
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            ref={ref}
            x="1"
            y="1"
            width="34"
            height="34"
            rx="7"
            stroke="#b5b5c6"
            stroke-width="2"
          />
        </svg>
      )}
    </div>
  );
};

export default QuestionsList;
