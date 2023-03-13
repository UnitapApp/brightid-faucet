import React, { useContext } from 'react';
import styled from 'styled-components/';
import Icon from 'components/basic/Icon/Icon';
import Timer from '../Timer/timer';
import { UserProfileContext } from 'hooks/useUserProfile';
import { ClaimContext } from 'hooks/useChainList';
import { range } from 'utils';

// ###### Local Styled Components

const Spaceship = styled.img`
  position: absolute;
  left: 0;
  transform: translate(-35%, -37%) scale(1);
`;

const Header = () => {
  const { userProfile, weeklyChainClaimLimit, remainingClaims } = useContext(UserProfileContext);

  return (
    <div className="header h-[152px] bg-gray20 rounded-2xl flex justify-between overflow-hidden relative p-4 mb-6">
      <Spaceship className="z-0" src="assets/images/gas-tap/header-spaceship.svg" />
      <div className="header-left z-10 flex flex-col justify-end items-start h-[100%]">
        <Icon className="gas-tap h-12 w-[140px] mb-1" iconSrc="assets/images/gas-tap/gas-tap-text-logo.png" />
        <Timer />
      </div>
      <div className="header-right h-[100%] flex flex-col justify-end">
        <div className="claim-stat z-10">
          {userProfile?.profile && weeklyChainClaimLimit && remainingClaims ? (
            weeklyChainClaimLimit === remainingClaims ? (
              <div className="claim-stat__not-claimed rounded-lg bg-gray30 border-2 border-gray50">
                <p className="claim-stat__not-claimed__text px-6 py-4 text-white text-xs">
                  You can claim <span className="claimed-left text-space-green">{remainingClaims}</span> gas fees in
                  this round
                </p>
              </div>
            ) : (
              <Dabes />
            )
          ) : (
            <></>
          )}
        </div>
        <div className="spaceman absolute bottom-2 right-0">
          <Icon className="z-0" iconSrc={'assets/images/claim/header-spaceman.svg'} width="120px" height="auto" />
        </div>
      </div>
    </div>
  );
};

const Dabes = () => {
  const { chainList, activeClaimHistory } = useContext(ClaimContext);
  const { remainingClaims } = useContext(UserProfileContext);

  return (
    <div className="claim-stat__claimed rounded-lg border-2 border-gray80 bg-primaryGradient py-[2px] px-3 flex gap-x-3">
      <>
        {chainList?.map((chain) => {
          if (activeClaimHistory.find((claim) => claim.pk.toString() === chain.chainId)) {
            return <Icon key={chain.chainId} iconSrc={chain.gasImageUrl} width="36px" height="40px" />;
          }
          return null;
        })}
        {range(0, remainingClaims!).map((i) => {
          return <Icon key={i} iconSrc="assets/images/gas-tap/empty-dabe.svg" width="36px" height="auto" />;
        })}
      </>
    </div>
  );
};

export default Header;
