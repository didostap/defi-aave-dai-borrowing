// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.4.19;

interface IWeth {
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);

    function approve(address _spender, uint256 _value) external returns (bool success);

    function balanceOf(address _owner) external view returns (uint256 balance);

    function decimals() external view returns (uint8 decimalsPlaces);

    function name() external view returns (string memory tokenName);

    function symbol() external view returns (string memory tokenSymbol);

    function totalSupply() external view returns (uint256 totalTokenIssued);

    function transfer(address _to, uint256 _value) external returns (bool success);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool success);

    function deposit() external payable;

    function withdraw(uint256 wad) external;
}
