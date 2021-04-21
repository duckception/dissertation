// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.3;

abstract contract OfferModel {
    struct Offer {
        uint256 nonce;
        uint256 deliveryTime;
        address tokenAddress;
        uint256 reward;
        uint256 collateral;
    }
}
