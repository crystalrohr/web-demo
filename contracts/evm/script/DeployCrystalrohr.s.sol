// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {RohrToken} from "../src/Token.sol";
import {CrystalrohrStaking} from "../src/Staking.sol";
import {CrystalrohrProtocol} from "../src/Protocol.sol";

contract DeployCrystalrohr is Script {
    RohrToken public token;
    CrystalrohrStaking public staking;
    CrystalrohrProtocol public protocol;

    function run() external {
        // Load deployer key from env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Start recording transactions
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Token
        token = new RohrToken(deployer);
        console.log("Token deployed at:", address(token));

        // 2. Deploy Staking
        staking = new CrystalrohrStaking(address(token), deployer);
        console.log("Staking deployed at:", address(staking));

        // 3. Deploy Protocol
        protocol = new CrystalrohrProtocol(address(token), address(staking));
        console.log("Protocol deployed at:", address(protocol));

        // 6. Transfer ownerships to final owner
        token.transferOwnership(address(protocol));
        staking.transferOwnership(address(protocol));

        vm.stopBroadcast();

        // Log final configuration
        console.log("Deployment completed!");
        console.log("-------------------");
        console.log("Token:", address(token));
        console.log("Staking:", address(staking));
        console.log("Protocol:", address(protocol));

        uint256 balance = deployer.balance;

        console.log("Deployer balance:", balance);
    }

    function verify() public view {
        require(
            token.owner() == address(protocol),
            "Token ownership not transferred"
        );
        require(
            staking.owner() == address(protocol),
            "Staking ownership not transferred"
        );
    }
}
