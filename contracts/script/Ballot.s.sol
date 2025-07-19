// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Ballot} from "../src/Ballot.sol";

contract BallotScript is Script {
    Ballot public ballot;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        ballot = new Ballot();

        vm.stopBroadcast();
    }
}
