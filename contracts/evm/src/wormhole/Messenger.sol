// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Base.sol";

abstract contract MessageSender is Base {
    constructor(
        address _wormholeRelayer,
        address _wormhole
    ) Base(_wormholeRelayer, _wormhole) {}

    function sendMessage(
        bytes memory message,
        uint16 targetChain,
        address targetAddress
    ) external payable {
        uint256 cost = quoteCrossChainCost(targetChain);

        require(
            msg.value >= cost,
            "Insufficient funds for cross-chain delivery"
        );

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            targetAddress,
            abi.encode(message, msg.sender),
            0,
            GAS_LIMIT
        );
    }
}
