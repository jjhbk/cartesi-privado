// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import {UniversalVerifier} from "@iden3/contracts/verifiers/UniversalVerifier.sol";

interface IInputBox {
    /// @notice Emitted when an input is added to a DApp's input box.
    /// @param dapp The address of the DApp
    /// @param inputIndex The index of the input in the input box
    /// @param sender The address that sent the input
    /// @param input The contents of the input
    /// @dev MUST be triggered on a successful call to `addInput`.
    event InputAdded(
        address indexed dapp,
        uint256 indexed inputIndex,
        address sender,
        bytes input
    );

    /// @notice Add an input to a DApp's input box.
    /// @param _dapp The address of the DApp
    /// @param _input The contents of the input
    /// @return The hash of the input plus some extra metadata
    /// @dev MUST fire an `InputAdded` event accordingly.
    ///      Input larger than machine limit will raise `InputSizeExceedsLimit` error.
    function addInput(
        address _dapp,
        bytes calldata _input
    ) external returns (bytes32);

    /// @notice Get the number of inputs in a DApp's input box.
    /// @param _dapp The address of the DApp
    /// @return Number of inputs in the DApp's input box
    function getNumberOfInputs(address _dapp) external view returns (uint256);

    /// @notice Get the hash of an input in a DApp's input box.
    /// @param _dapp The address of the DApp
    /// @param _index The index of the input in the DApp's input box
    /// @return The hash of the input at the provided index in the DApp's input box
    /// @dev `_index` MUST be in the interval `[0,n)` where `n` is the number of
    ///      inputs in the DApp's input box. See the `getNumberOfInputs` function.
    function getInputHash(
        address _dapp,
        uint256 _index
    ) external view returns (bytes32);
}

interface IWhiteList {
    function addToWhiteList(address user) external;
}

contract CartesiUVerifier {
    uint64 public constant REQUEST_ID = 1717138697;

    UniversalVerifier public verifier;
    address public constant INPUT_BOX_ADDRESS =
        0x59b22D57D4f067708AB0c00552767405926dc768;

    constructor(UniversalVerifier verifier_) {
        verifier = verifier_;
    }

    function whiteList(
        uint64 _requestID,
        address _dapp
    ) external returns (bytes32) {
        require(
            verifier.getProofStatus(msg.sender, _requestID).isVerified,
            "only identities who provided sig or mtp proof for transfer requests are allowed to receive tokens"
        );

        return
            IInputBox(INPUT_BOX_ADDRESS).addInput(
                _dapp,
                abi.encodeCall(IWhiteList.addToWhiteList, (msg.sender))
            );
    }
}
