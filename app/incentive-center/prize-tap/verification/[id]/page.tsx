"use client";
import OfferPrizeForm from "../../components/OfferPrizeForm";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams();
  return (
    <div>
      <OfferPrizeForm verificationRafflePK={params.id as string} />
    </div>
  );
};

export default Page;
