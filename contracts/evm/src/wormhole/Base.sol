// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "wormhole-sdk/interfaces/IWormholeReceiver.sol";
import "wormhole-sdk/interfaces/IWormholeRelayer.sol";
import "wormhole-sdk/interfaces/IWormhole.sol";
import "wormhole-sdk/Utils.sol";

abstract contract Base {
    uint256 constant GAS_LIMIT = 50000;
    IWormholeRelayer public immutable wormholeRelayer;
    IWormhole public immutable wormhole;
    address public registrationOwner;
    
    // Mapping to store registered senders for each chain
    mapping(uint16 => bytes32) public registeredSenders;

    constructor(address _wormholeRelayer, address _wormhole) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        wormhole = IWormhole(_wormhole);
        registrationOwner = msg.sender;
    }

    modifier onlyWormholeRelayer() {
        require(
            msg.sender == address(wormholeRelayer),
            "Msg.sender is not Wormhole Relayer"
        );
        _;
    }

    modifier isRegisteredSender(uint16 sourceChain, bytes32 sourceAddress) {
        require(
            registeredSenders[sourceChain] == sourceAddress,
            "Not registered sender"
        );
        _;
    }

    /**
     * Sets the registered address for 'sourceChain' to 'sourceAddress'
     * So that for messages from 'sourceChain', only ones from 'sourceAddress' are valid
     *
     * Assumes only one sender per chain is valid
     * Sender is the address that called 'send' on the Wormhole Relayer contract on the source chain)
     */
    function setRegisteredSender(uint16 sourceChain, bytes32 sourceAddress)
        public
    {
        require(
            msg.sender == registrationOwner,
            "Not allowed to set registered sender"
        );
        registeredSenders[sourceChain] = sourceAddress;
    }

    function quoteCrossChainCost(uint16 targetChain)
        public
        view
        returns (uint256 cost)
    {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );
    }
}
