// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract RohrToken is ERC20, Ownable, ERC20Permit {
    constructor(
        address initialOwner
    )
        ERC20("ROHR Token", "ROHR")
        Ownable(initialOwner)
        ERC20Permit("ROHR Token")
    {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 8;
    }
}
