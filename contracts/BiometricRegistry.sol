// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BiometricRegistry {
    struct Identity {
        uint256 keystrokeEntropy;
        uint256 mouseJitter;
        uint256 timestamp;
    }

    mapping(address => Identity) public identityProfiles;

    event ProfileUpdated(address indexed user, uint256 entropy, uint256 jitter);

    function recordIdentity(uint256 _entropy, uint256 _jitter) public {
        identityProfiles[msg.sender] = Identity({
            keystrokeEntropy: _entropy,
            mouseJitter: _jitter,
            timestamp: block.timestamp
        });
        emit ProfileUpdated(msg.sender, _entropy, _jitter);
    }
}
