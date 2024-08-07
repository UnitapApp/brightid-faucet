import { FC } from "react";

import "@/styles/gastap.scss";

const GasBalanceRenderer: FC<{ balance: number }> = ({ balance }) => {
  if (balance > 6) {
    return (
      <div className="ml-3 flex items-center gap-[2px]">
        {Array.from(new Array(balance)).map((_, key) => (
          <span className="gas-level-fine h-4 w-1" key={key} />
        ))}
        {Array.from(new Array(10 - balance)).map((_, key) => (
          <span className="h-4 w-1 bg-[#13131A]" key={key} />
        ))}
      </div>
    );
  }

  if (balance >= 4)
    return (
      <div className="ml-3 flex items-center gap-[2px]">
        {Array.from(new Array(balance)).map((_, key) => (
          <span className="gas-level-low h-4 w-1" key={key} />
        ))}
        {Array.from(new Array(10 - balance)).map((_, key) => (
          <span className="h-4 w-1 bg-[#13131A]" key={key} />
        ))}
      </div>
    );

  if (balance === 0)
    return (
      <div className="ml-3 flex items-center gap-[2px]">
        {Array.from(new Array(10)).map((_, key) => (
          <span className="gas-empty-danger h-4 w-1 bg-[#13131A]" key={key} />
        ))}
      </div>
    );

  return (
    <div className="ml-3 flex items-center gap-[2px]">
      {Array.from(new Array(balance < 0 ? 0 : balance)).map((_, key) => (
        <span className="gas-level-empty h-4 w-1" key={key} />
      ))}

      {Array.from(new Array(10 - balance)).map((_, key) => (
        <span className="h-4 w-1 bg-[#13131A]" key={key} />
      ))}
    </div>
  );
};

export default GasBalanceRenderer;
