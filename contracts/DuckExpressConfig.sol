// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.7.3;
pragma experimental ABIEncoderV2;

import "./DuckExpressStorage.sol";
import "./Ownable.sol";

abstract contract DuckExpressConfig is DuckExpressStorage, Ownable {
    using EnumerableMap for EnumerableMap.AddressToSupportStateMap;

    // uint256 _minDeliveryTime;
    // EnumerableMap.AddressToSupportStateMap _tokens;

    event MinDeliveryTimeSet(uint256 indexed time);
    event TokenSupported(address indexed tokenAddress);
    event TokenSupportStopped(address indexed tokenAddress);

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

    // GETERS

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
}
