// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.3;

import "./models/OrderModel.sol";
import "./models/OfferModel.sol";
import "./utils/EnumerableMap.sol";

abstract contract DuckExpressStorage is OfferModel, OrderModel {
    // Initializable.sol
    bool internal _initialized;
    bool internal _initializing;

    // Ownable.sol
    address internal _owner;

    // DuckExpress.sol
    uint256 internal _minDeliveryTime;
    EnumerableMap.AddressToSupportStateMap internal _tokens;
    mapping (address => uint256) internal _nonces;
    EnumerableMap.HashToOfferStatusMap internal _offerStatuses;
    mapping (bytes32 => Offer) internal _offers;
    mapping (bytes32 => Order) internal _orders;

}
