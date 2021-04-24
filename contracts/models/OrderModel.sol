// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.3;

import "./OfferModel.sol";

abstract contract OrderModel is OfferModel {
    enum OrderStatus {
        AWAITING_PICK_UP,
        PICKED_UP,
        DELIVERED,
        DELIVERED_LATE,
        REFUSED,
        CLAIMED,
        RETURNED
    }

    struct Order {
        Offer offer;
        OrderStatus status;
        address courierAddress;
        uint256 timestamp;
    }
}
