import Icon from "@/components/ui/Icon";
import { useWalletAccount, useWalletConnection } from "@/utils/wallet";
import Link from "next/link";
import { FC, MouseEventHandler, useEffect } from "react";
import { ConnectionProvider, WalletState } from ".";
import { checkUserExists } from "@/utils/api";

export const WalletProviderButton: FC<{
  className?: string;
  backgroundImage: string;
  imageIcon: string;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}> = ({ backgroundImage, imageIcon, label, className, onClick }) => {
  return (
    <button
      data-testid={`wallet-connect-method-${label}`}
      onClick={onClick}
      className={`w-full rounded-[14px] bg-gradient-to-r p-[2px] ${className} to-gray60 to-30%`}
    >
      <div className="flex items-center overflow-hidden rounded-xl bg-gray30">
        <Icon
          iconSrc={imageIcon}
          width="28px"
          height="28px"
          className="my-3 ml-3"
        />
        <span className="ml-5 text-sm font-bold">{label}</span>

        <Icon className="ml-auto" iconSrc={backgroundImage} />
      </div>
    </button>
  );
};

const WalletPrompt: FC<{
  setIsNewUser: (isNewUser: boolean) => void;
  setWalletProvider: (provider: ConnectionProvider) => void;
  setWalletState: (state: WalletState) => void;
}> = ({ setWalletProvider, setWalletState, setIsNewUser }) => {
  const { connect, connectors, disconnect, isSuccess, isLoading } =
    useWalletConnection();

  const { address } = useWalletAccount();

  useEffect(() => {
    if (!address) return;

    checkUserExists(address).then((exists) => {
      setIsNewUser(!exists);
      setWalletState(
        exists ? WalletState.SignMessage : WalletState.UnknownWallet,
      );
    });
  }, [address, setIsNewUser, setWalletState, isSuccess, disconnect]);

  return (
    <>
      <Icon iconSrc="/assets/images/wallets.svg" alt="wallets" />

      <p className="mt-5 text-sm text-gray100">
        Select what wallet you want to connect below:
      </p>

      <WalletProviderButton
        className="mt-8 from-[#F5841F33]"
        label="MetaMask"
        imageIcon="/assets/images/modal/metamask-icon.svg"
        backgroundImage="/assets/images/modal/metamask-bg.svg"
        onClick={() => {
          setWalletProvider(ConnectionProvider.Metamask);
          connect({
            connector: connectors.find(
              (connector) => connector.id === "injected",
            )!,
          });
        }}
      />
      <WalletProviderButton
        className="mt-3 from-[#16436f]"
        label="WalletConnect"
        backgroundImage="/assets/images/modal/walletconnect-bg.svg"
        imageIcon="/assets/images/modal/walletconnect-icon.svg"
        onClick={() => {
          setWalletProvider(ConnectionProvider.Walletconnect);
          connect({
            connector: connectors.find(
              (connector) => connector.id === "walletConnect",
            )!,
          });
        }}
      />
      <div className="mt-10">
        <p className="text-xs text-gray100">
          Lost your account? Recover with{" "}
          <button
            onClick={() => {
              setWalletState(WalletState.RecoverPrompt);
            }}
            className="font-semibold text-orange"
          >
            Bright ID
          </button>
        </p>
      </div>
      <div className="mt-5 flex items-center text-sm text-gray100">
        <p>New to Ethereum wallets?</p>
        <Link
          className="ml-1 text-white underline"
          href="https://ethereum.org/en/wallets/"
          target="_blank"
        >
          Learn more
        </Link>
        <Icon
          iconSrc="/assets/images/prize-tap/ic_link_white.svg"
          className="ml-1"
        />
      </div>
      <div className="mt-2 text-xs text-gray90">
        By continuing, you agree to our{" "}
        <Link
          target="_blank"
          href="https://guild.xyz/privacy-policy"
          className="underline"
        >
          Privacy Policy
        </Link>
      </div>
    </>
  );
};

export default WalletPrompt;
