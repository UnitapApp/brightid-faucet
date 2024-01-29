import ClaimNonEVMModal from "./components/Modals/claimNonEVMModal";
import ClaimModal from "./components/Modals/ClaimModal";
import Header from "./components/header";
import { Metadata } from "next";
import GasTapMainContent from "./components";
import FundContextProvider from "./components/Modals/FundGasModal";
import ProvideGasCard from "./components/Cards/ProvideGasCard/provideGasCard";

export const metadata: Metadata = {
  title: "Unitap | Gas Tap ⛽",
  description: "Enjoy surfing Web3 without the worry of gas fees",
};

const GasTap = () => {
  return (
    <FundContextProvider>
      <Header />
      <GasTapMainContent />

      <ProvideGasCard />
      <ClaimModal />
      <ClaimNonEVMModal />
    </FundContextProvider>
  );
};

export default GasTap;
