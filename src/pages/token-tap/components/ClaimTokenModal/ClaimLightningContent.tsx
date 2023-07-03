import React, { FC, useContext, useEffect, useMemo } from 'react';

import Icon from 'components/basic/Icon/Icon';
import { ClaimContext } from 'hooks/useChainList';
import { Chain, Permission, PermissionType } from 'types';
import lottie from 'lottie-web';
import { Text } from 'components/basic/Text/text.style';
import { ClaimButton, LightOutlinedButtonNew, SecondaryGreenColorButton } from 'components/basic/Button/button';
import { UserProfileContext } from '../../../../hooks/useUserProfile';
import { TokenTapContext } from 'hooks/token-tap/tokenTapContext';
import { DropIconWrapper } from 'pages/home/components/ClaimModal/claimModal.style';
import animation from '../../../../assets/animations/GasFee-delivery2.json';

const ClaimLightningContent: FC<{ chain: Chain }> = ({ chain }) => {
	const {
		selectedTokenForClaim,
		claimToken,
		claimTokenLoading,
		closeClaimModal,
		claimTokenSignatureLoading,
		claimError,
		claimedTokensList,
	} = useContext(TokenTapContext);

	const { openBrightIdModal } = useContext(ClaimContext);

	const token = useMemo(
		() => claimedTokensList.find((token) => token.tokenDistribution.id === selectedTokenForClaim!.id),
		[claimedTokensList, selectedTokenForClaim],
	);

	const { userProfile, nonEVMWalletAddress, setNonEVMWalletAddress } = useContext(UserProfileContext);

	useEffect(() => {
		if (!token?.status) return;

		const animationElement = document.querySelector('#animation');
		if (animationElement) {
			animationElement.innerHTML = '';
		}

		lottie.loadAnimation({
			container: document.querySelector('#animation') as HTMLInputElement,
			animationData: animation,
			loop: true,
			autoplay: true,
		});
	}, [token]);

	function renderBrightNotConnectedBody() {
		if (!selectedTokenForClaim) return null;

		return (
			<>
				<Icon
					data-testid="chain-logo"
					className="chain-logo z-10 mt-14 mb-10"
					iconSrc={selectedTokenForClaim!.imageUrl}
					width="auto"
					height="110px"
				/>
				<p className="text-white text-sm mb-5 mt-11">You need to connect your BrightID to claim your tokens</p>

				<ClaimButton
					onClick={openBrightIdModal}
					width="100%"
					className="!w-full"
					fontSize="16px"
					data-testid={`token-claim-action-${selectedTokenForClaim!.id}`}
				>
					<p>Connect BrightID</p>
				</ClaimButton>
			</>
		);
	}

	function renderInitialBody() {
		if (!selectedTokenForClaim) {
			return null;
		}

		return (
			<>
				<Icon
					data-testid="chain-logo"
					className="chain-logo z-10 mt-14 mb-10"
					iconSrc={selectedTokenForClaim!.imageUrl}
					width="auto"
					height="110px"
				/>
				<div className="mt-3 text-gray100 text-sm leading-5">
					You have to create an invoice with the amount of 100 satoshi and paste it here. you can use any Lightning
					wallet to do this. (Wallet of Satoshi, etc).
				</div>
				<div className="address-input flex w-full bg-gray30 rounded-xl my-6 p-2.5 items-center">
					<input
						className="address-input__input w-full placeholder:text-gray80 text-sm mx-1.5 bg-transparent text-white"
						type="text"
						placeholder="Paste your lightning invoice "
						value={nonEVMWalletAddress}
						onChange={(e) => setNonEVMWalletAddress(e.target.value)}
					/>
					<button
						className="address-input__paste-button btn btn--sm btn--primary-light font-semibold tracking-wide"
						onClick={() => navigator.clipboard.readText().then((text) => setNonEVMWalletAddress(text))}
					>
						PASTE
					</button>
				</div>

				<button
					className={`btn ${
						!selectedTokenForClaim || claimTokenSignatureLoading ? 'btn--disabled' : 'btn--primary-outlined'
					} w-full`}
					onClick={() => claimToken(selectedTokenForClaim, { lightningInvoice: nonEVMWalletAddress })}
				>
					{claimTokenSignatureLoading ? (
						<p>{`Claiming ${selectedTokenForClaim.amount} ${selectedTokenForClaim.token}`}</p>
					) : (
						<p>{`Claim ${selectedTokenForClaim.amount} ${selectedTokenForClaim.token}`}</p>
					)}
				</button>
			</>
		);
	}

	function renderPendingBody() {
		if (!selectedTokenForClaim) return null;

		return (
			<>
				<div data-testid={`chain-claim-pending-${chain.pk}`} id="animation" style={{ width: '200px' }}></div>
				<Text width="100%" fontSize="14" color="space_green" textAlign="center">
					Claim transaction submitted
				</Text>
				<Text width="100%" fontSize="14" color="second_gray_light" mb={3} textAlign="center">
					The claim transaction will be completed soon
				</Text>
				<SecondaryGreenColorButton onClick={closeClaimModal} width={'100%'}>
					Close
				</SecondaryGreenColorButton>
			</>
		);
	}

	function renderSuccessBody() {
		const token = claimedTokensList.find((token) => token.tokenDistribution.id === selectedTokenForClaim!.id);

		if (!token) return;

		return (
			<>
				<Icon
					data-testid="chain-logo"
					className="chain-logo z-10 mt-14 mb-10"
					iconSrc={selectedTokenForClaim!.imageUrl}
					width="auto"
					height="110px"
				/>
				<Text width="100%" fontSize="14" color="space_green" textAlign="center">
					{token.payload.amount + ' '} {selectedTokenForClaim!.token}Claimed
				</Text>
				<p className="text-space-green text-sm my-4 text-center px-3 mb-6">
					Your tokens have been claimed successfully. <br />{' '}
					<span
						onClick={() => window.open('https://gnosisscan.io/tx/' + token.payload.token)}
						className="text-white mt-10 text-md hover:cursor-pointer hover:underline break-words break-all"
					>
						{token.payload.token}
					</span>
				</p>
			</>
		);
	}

	function renderFailedBody() {
		if (!selectedTokenForClaim) return null;

		return (
			<>
				<Icon
					data-testid="chain-logo"
					className="chain-logo z-10 mt-14 mb-10"
					iconSrc={selectedTokenForClaim!.imageUrl}
					width="auto"
					height="110px"
				/>
				<span className="flex justify-center items-center font-medium mb-3">
					<Text className="!mb-0" width="100%" fontSize="14" color="warningRed" textAlign="center">
						Claim Failed!
					</Text>
					<Icon iconSrc="assets/images/modal/failed-state-x.svg" width="22px" height="auto" className="ml-2" />
				</span>
				<Text width="100%" fontSize="14" color="second_gray_light" mb={3} textAlign="center">
					An error occurred while processing your request
				</Text>

				<p className="text-white text-sm my-4 text-center px-3 mb-6">{claimError}</p>
				<div className="address-input flex w-full bg-gray30 rounded-xl my-6 p-2.5 items-center">
					<input
						className="address-input__input w-full placeholder:text-gray80 text-sm mx-1.5 bg-transparent text-white"
						type="text"
						placeholder="Paste your lightning invoice "
						value={nonEVMWalletAddress}
						onChange={(e) => setNonEVMWalletAddress(e.target.value)}
					/>
					<button
						className="address-input__paste-button btn btn--sm btn--primary-light font-semibold tracking-wide"
						onClick={() => navigator.clipboard.readText().then((text) => setNonEVMWalletAddress(text))}
					>
						PASTE
					</button>
				</div>
				<ClaimButton
					fontSize="16px"
					onClick={() => claimToken(selectedTokenForClaim, { lightningInvoice: nonEVMWalletAddress })}
					width={'100%'}
					className="!w-full"
					data-testid={`chain-claim-action-${chain.pk}`}
				>
					{claimTokenLoading ? <p> Claiming... </p> : <p>Try Again</p>}
				</ClaimButton>
			</>
		);
	}

	function renderVerifyPermission(permission: Permission) {
		function getPermissionTitle(permission: Permission) {
			if (permission.name === PermissionType.BRIGHTID) {
				return 'You are not verified on BrightID';
			} else if (permission.name === PermissionType.AURA) {
				return 'You are not verified on Aura';
			}

			return '';
		}

		function getPermissionButtonText(permission: Permission) {
			if (permission.name === PermissionType.BRIGHTID) {
				return 'Verified on BrightID';
			} else if (permission.name === PermissionType.AURA) {
				return 'Verified on Aura';
			}

			return '';
		}

		function getPermissionCheckButtonText(permission: Permission) {
			if (permission.name === PermissionType.BRIGHTID) {
				return 'If you verified your BrightID click here.';
			} else if (permission.name === PermissionType.AURA) {
				return 'If you verified your Aura click here.';
			}

			return '';
		}

		function verifyPermission() {
			if (permission.name === PermissionType.BRIGHTID) {
				window.open('https://meet.brightid.org/', '_blank');
			} else if (permission.name === PermissionType.AURA) {
				window.open('https://brightid.gitbook.io/aura/how-to-play/verification-levels', '_blank');
			}
		}

		return (
			<>
				<div
					className="bright-connection-modal flex flex-col items-center justify-center pt-2"
					data-testid="brightid-modal"
				>
					<Icon
						data-testid="brightid-logo"
						className="bright-logo !w-4/12 z-10 mb-5"
						iconSrc={selectedTokenForClaim!.imageUrl}
					/>
					<p className="text-sm font-bold text-error mb-2">{getPermissionTitle(permission)}</p>
					<p className="text-xs font-medium text-gray100 mb-12 text-center px-4 leading-6">{permission.description}</p>

					<span className="w-full relative">
						<LightOutlinedButtonNew className="!w-full" onClick={() => verifyPermission()}>
							{getPermissionButtonText(permission)}
							<Icon className="cursor-pointer arrow-icon mt-0.5 ml-1.5 w-2" iconSrc="assets/images/arrow-icon.svg" />
						</LightOutlinedButtonNew>
						<Icon
							iconSrc="assets/images/modal/bright-id-check.svg"
							className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2"
						/>
					</span>

					{/* eslint-disable-next-line no-restricted-globals */}
					<p className="text-white mt-4 text-xs hover:underline cursor-pointer" onClick={() => location.reload()}>
						{getPermissionCheckButtonText(permission)}
					</p>
				</div>
			</>
		);
	}

	const renderNotAvailableBody = () => {
		return (
			<>
				<DropIconWrapper>
					<Icon
						className="chain-logo z-10 mt-14 mb-10"
						width="auto"
						height="110px"
						iconSrc={selectedTokenForClaim!.imageUrl}
						alt=""
					/>
				</DropIconWrapper>
				<Text width="100%" fontSize="14" color="second_gray_light" mb={3} textAlign="center">
					{selectedTokenForClaim?.isMaxedOut
						? "Unfortunately, there are no more tokens to claim. Make sure you're following us on Twitter to be notified when more tokens are available."
						: "Unfortunately, you missed the deadline to claim your tokens. Make sure you're following us on Twitter to be notified when more tokens are available."}
				</Text>
				<ClaimButton
					onClick={closeClaimModal}
					width={'100%'}
					fontSize="16px"
					className="!w-full"
					data-testid={`chain-claim-action-${chain.pk}`}
					color="space_green"
				>
					<p>Close</p>
				</ClaimButton>
			</>
		);
	};

	const getLightningClaimBody = () => {
		if (!userProfile) return renderBrightNotConnectedBody();

		for (const permission of selectedTokenForClaim?.permissions ?? []) {
			if (permission.name === PermissionType.BRIGHTID) {
				if (!userProfile.isMeetVerified) return renderVerifyPermission(permission);
			} else if (permission.name === PermissionType.AURA) {
				if (!userProfile.isAuraVerified) return renderVerifyPermission(permission);
			}
		}

		if (token?.status === 'Done') return renderSuccessBody();
		if (token?.status === 'Pending') return renderPendingBody();

		if (!selectedTokenForClaim?.isMaxedOut && !selectedTokenForClaim?.isExpired) return renderInitialBody();

		if (claimError) return renderFailedBody();

		return renderNotAvailableBody();
	};

	return (
		<div
			className="claim-non-evm-modal flex flex-col items-center justify-center pt-2"
			data-testid="claim-non-evm-modal"
		>
			{getLightningClaimBody()}
		</div>
	);
};

export default ClaimLightningContent;
