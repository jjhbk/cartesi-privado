// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import {EmbeddedZKPVerifier} from "@iden3/contracts/verifiers/EmbeddedZKPVerifier.sol";


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
    ) external  returns (bytes32) ;

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
function addToWhiteList(address user)external  ;
}
contract CartesiVerifier is  EmbeddedZKPVerifier {
    uint64 public constant TRANSFER_REQUEST_ID = 1;
    address inputBoxAddr;

    function setinputBoxAddr(address _inputadd) public onlyOwner  {
       inputBoxAddr = _inputadd;
    }
    function whiteList(uint64 _requestID,address _dapp) external returns (bytes32) {
         require(
         getProofStatus(_msgSender(), _requestID).isVerified ,
         'only identities who provided sig or mtp proof for transfer requests are allowed to receive tokens'
      );
    return IInputBox(inputBoxAddr).addInput(_dapp,abi.encodeCall(IWhiteList.addToWhiteList,(_msgSender())));
    }

    
    /// @custom:storage-location erc7201:polygonid.storage.CartesiVerifier
    struct CartesiVerifierStorage {
        mapping(uint256 => address) idToAddress;
        mapping(address => uint256) addressToId;
    }

    // keccak256(abi.encode(uint256(keccak256("polygonid.storage.CartesiVerifier")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant CartesiVeriferStorageLocation =  0xbb3725baafcfd875061141e812f1074fc77dfe1893ec28908ec58d4f1995e100;
    
    function _getCartesiVeriferStorage() private pure returns (CartesiVerifierStorage storage $) {
        assembly {
            $.slot := CartesiVeriferStorageLocation
        }
    }

    function initialize() public initializer {
        CartesiVerifierStorage storage $ = _getCartesiVeriferStorage();
        super.__EmbeddedZKPVerifier_init(_msgSender());
    }

    function _afterProofSubmit(
        uint64 requestId,
        uint256[] memory inputs,
        ICircuitValidator /* validator */
    ) internal override {
        CartesiVerifierStorage storage $ = _getCartesiVeriferStorage();
        if (
            requestId == TRANSFER_REQUEST_ID
        ) {
            // if proof is given for transfer request id and it's a first time we mint tokens to sender
            uint256 id = inputs[1];
            if ($.idToAddress[id] == address(0) && $.addressToId[_msgSender()] == 0) {

                $.addressToId[_msgSender()] = id;
                $.idToAddress[id] = _msgSender();
            }
        }
    }



    function getIdByAddress(address addr) public view returns (uint256) {
        return _getCartesiVeriferStorage().addressToId[addr];
    }

    function getAddressById(uint256 id) public view returns (address) {
        return _getCartesiVeriferStorage().idToAddress[id];
    }

  

}
