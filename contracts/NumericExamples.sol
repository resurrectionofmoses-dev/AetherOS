// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; // Using Solidity 0.8.0 or higher for built-in overflow/underflow checks

/**
 * @title NumericExamples
 * @dev A contract to demonstrate basic integer handling, constants,
 *      and explicit overflow/underflow scenarios on the EVM.
 */
contract NumericExamples {

    // 1. Storing the value '1' as a public constant
    // This is immutable and costs gas only once during deployment.
    uint256 public constant THE_NUMBER_ONE_CONSTANT = 1;

    // 2. Storing the value '1' as a public state variable
    // This can be changed later.
    uint256 public theNumberOneVariable;

    // A smaller integer type to easily demonstrate overflow/underflow
    uint8 public smallCounter; // Max value for uint8 is 255

    // Event to log results of overflow/underflow attempts
    event OperationResult(string description, uint256 oldValue, uint256 newValue);

    constructor() {
        theNumberOneVariable = 1; // Initialize the state variable to 1
        smallCounter = 255;       // Initialize smallCounter to its max value for overflow test
    }

    /**
     * @dev Returns the constant value 1. Trivial on-chain verification.
     * @return The integer 1.
     */
    function getTheNumberOne() public pure returns (uint256) {
        return 1;
    }

    /**
     * @dev Increments the smallCounter.
     *      In Solidity 0.8.0+, this will revert on overflow.
     *      In older versions (or 'unchecked' blocks), it would wrap around (255 -> 0).
     */
    function incrementSmallCounter() public {
        emit OperationResult("Before Increment", smallCounter, 0); // 0 is placeholder
        smallCounter++; // Attempt to increment 255
        emit OperationResult("After Increment", 255, smallCounter); // 255 is placeholder for old value
    }

    /**
     * @dev Decrements the smallCounter.
     *      In Solidity 0.8.0+, this will revert on underflow.
     *      In older versions (or 'unchecked' blocks), it would wrap around (0 -> 255).
     */
    function decrementSmallCounter() public {
        // First, set smallCounter to 0 to prepare for underflow test
        smallCounter = 0;
        emit OperationResult("Before Decrement", smallCounter, 0); // 0 is placeholder
        smallCounter--; // Attempt to decrement 0
        emit OperationResult("After Decrement", 0, smallCounter); // 0 is placeholder for old value
    }

    /**
     * @dev Shows how to explicitly allow overflow/underflow using 'unchecked' block
     *      (for demonstration purposes only, generally discouraged for critical logic).
     */
    function forceOverflowUnchecked() public {
        uint8 tempCounter = 255;
        emit OperationResult("Before Unchecked Overflow", tempCounter, 0); // 0 is placeholder
        unchecked {
            tempCounter++; // This will successfully wrap around to 0
        }
        emit OperationResult("After Unchecked Overflow", 255, tempCounter); // 255 is placeholder for old value
        smallCounter = tempCounter; // Update state for visibility
    }

    /**
     * @dev Shows how to explicitly allow underflow using 'unchecked' block.
     */
    function forceUnderflowUnchecked() public {
        uint8 tempCounter = 0;
        emit OperationResult("Before Unchecked Underflow", tempCounter, 0); // 0 is placeholder
        unchecked {
            tempCounter--; // This will successfully wrap around to 255
        }
        emit OperationResult("After Unchecked Underflow", 0, tempCounter); // 0 is placeholder for old value
        smallCounter = tempCounter; // Update state for visibility
    }
}
