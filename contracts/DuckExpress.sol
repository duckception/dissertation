// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "./DuckExpressStorage.sol";
import "./Initializable.sol";
import "./Ownable.sol";
import "./models/OrderModel.sol";
import "./models/OfferModel.sol";

contract DuckExpress is OfferModel, OrderModel, DuckExpressStorage, Initializable, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using EnumerableMap for EnumerableMap.HashToOfferStatusMap;
    using EnumerableMap for EnumerableMap.AddressToSupportStateMap;

    // TODO: MOVE VARIABLES HERE
    // EnumerableMap.HashToOfferStatusMap internal _offerStatuses;
    // mapping (bytes32 => Offer) internal _offers;

    event MinDeliveryTimeSet(uint256 indexed time);
    event TokenSupported(address indexed tokenAddress);
    event TokenSupportStopped(address indexed tokenAddress);
    event DeliveryOfferCreated(address indexed customerAddress, bytes32 offerHash);
    event DeliveryOfferAccepted(address indexed courierAddress, bytes32 offerHash);

    // INITIALIZERS

    constructor(address initialOwner) {
        __Ownable_init_unchained(initialOwner);
    }

    function initialize(address initialOwner, uint256 minDeliveryTime) public initializer {
        __Ownable_init_unchained(initialOwner);
        __DuckExpress_init_unchained(minDeliveryTime);
    }

    // solhint-disable-next-line func-name-mixedcase
    function __DuckExpress_init_unchained(uint256 minDeliveryTime) internal {
        _setMinDeliveryTime(minDeliveryTime);
    }

    // MAIN METHODS

    function createDeliveryOffer(Offer calldata offer) external {
        require(isTokenSupported(offer.tokenAddress), "DuckExpress: the ERC20 loan token is not supported");
        require(_nonces[msg.sender] == offer.nonce, "DuckExpress: incorrect nonce");
        require(offer.customerAddress == msg.sender, "DuckExpress: customer address must be your address");
        require(offer.addresseeAddress != address(0), "DuckExpress: addressee address cannot be zero address");
        require(offer.pickupAddress != "", "DuckExpress: the pickup address must be set");
        require(offer.deliveryAddress != "", "DuckExpress: the delivery address must be set");
        require(offer.deliveryTime >= _minDeliveryTime, "DuckExpress: the delivery time cannot be lesser than the minimal delivery time");
        require(offer.reward > 0, "DuckExpress: the reward must be greater than 0");
        require(offer.collateral > 0, "DuckExpress: the collateral must be greater than 0");

        IERC20(offer.tokenAddress).safeTransferFrom(msg.sender, address(this), offer.reward);

        bytes32 offerHash = hashOffer(offer);

        _offerStatuses.set(offerHash, EnumerableMap.OfferStatus.AVAILABLE);
        _offers[offerHash] = offer;
        _nonces[msg.sender] += 1;

        emit DeliveryOfferCreated(msg.sender, offerHash);
    }

    function acceptDeliveryOffer(bytes32 offerHash) external {
        require(isOfferAvailable(offerHash), "DuckExpress: the offer is unavailable");

        Offer memory offer = _offers[offerHash];

        IERC20(offer.tokenAddress).safeTransferFrom(msg.sender, address(this), offer.collateral);

        _offerStatuses.set(offerHash, EnumerableMap.OfferStatus.UNAVAILABLE);

        _orders[offerHash] = Order({
            offer: offer,
            status: OrderStatus.AWAITING_PICK_UP,
            courierAddress: msg.sender,
            timestamp: block.timestamp
        });

        emit DeliveryOfferAccepted(msg.sender, offerHash);
    }

    function hashOffer(Offer calldata offer) public pure returns (bytes32) {
        return keccak256(abi.encode(
            offer.nonce,
            offer.customerAddress,
            offer.addresseeAddress,
            offer.pickupAddress,
            offer.deliveryAddress,
            offer.deliveryTime,
            offer.tokenAddress,
            offer.reward,
            offer.collateral
        ));
    }

    // cancel offer

    // accept delivery offer

    // confirm pick up

    // confirm delivery

    // refuse delivery

    // claim collateral

    // SETTERS

    function setMinDeliveryTime(uint256 time) external onlyOwner {
        _setMinDeliveryTime(time);
    }

    function _setMinDeliveryTime(uint256 time) internal {
        require(time > 0, "DuckExpress: the min expiration time must be greater than 0");
        _minDeliveryTime = time;
        emit MinDeliveryTimeSet(time);
    }

    function supportToken(address tokenAddress) external onlyOwner {
        require(!isTokenSupported(tokenAddress), "DuckExpress: the ERC20 token is already supported");
        _tokens.set(tokenAddress, EnumerableMap.SupportState.SUPPORTED);
        emit TokenSupported(tokenAddress);
    }

    function stopSupportingToken(address tokenAddress) external onlyOwner {
        require(isTokenSupported(tokenAddress), "DuckExpress: the ERC20 loan token is not supported");
        _tokens.set(tokenAddress, EnumerableMap.SupportState.SUPPORT_STOPPED);
        emit TokenSupportStopped(tokenAddress);
    }

    // GETTERS

    function minDeliveryTime() external view returns (uint256) {
        return _minDeliveryTime;
    }

    function isTokenSupported(address tokenAddress) public view returns (bool) {
        return _tokens.contains(tokenAddress) &&
            _tokens.get(tokenAddress) == EnumerableMap.SupportState.SUPPORTED;
    }

    function wasTokenEverSupported(address tokenAddress) public view returns (bool) {
        return _tokens.contains(tokenAddress);
    }

    function customerNonce(address customer) external view returns (uint256) {
        return _nonces[customer];
    }

    function isOfferAvailable(bytes32 offerHash) public view returns (bool) {
        return _offerStatuses.contains(offerHash) &&
            _offerStatuses.get(offerHash) == EnumerableMap.OfferStatus.AVAILABLE;
    }

    function offer(bytes32 offerHash) external view returns (Offer memory) {
        require(isOfferAvailable(offerHash), "DuckExpress: unavailable offer");

        return _offers[offerHash];
    }

    function order(bytes32 offerHash) external view returns (Order memory) {
        return _orders[offerHash];
    }
}
