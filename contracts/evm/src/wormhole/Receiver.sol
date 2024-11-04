// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Base.sol";

contract MessageReceiver is Base {
    constructor(
        address _wormholeRelayer,
        address _wormhole
    ) Base(_wormholeRelayer, _wormhole) {}

    event MessageSender(address sender);
    event MessageReceived(string message);
    event SourceChainLogged(uint16 sourceChain);

    // Update receiveWormholeMessages to include the source address check
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable isRegisteredSender(sourceChain, sourceAddress) {
        require(
            msg.sender == address(wormholeRelayer),
            "Only the Wormhole relayer can call this function"
        );

        // Decode the payload to extract the message and sender
        string memory message;
        address sender;
        (message, sender) = abi.decode(payload, (string, address));

        // Example use of sourceChain for logging
        if (sourceChain != 0) {
            emit SourceChainLogged(sourceChain);
        }

        // Emit an event with the received message
        emit MessageReceived(message);
        emit MessageSender(sender);
    }
}
