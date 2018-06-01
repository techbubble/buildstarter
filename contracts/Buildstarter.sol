pragma solidity ^0.4.18;

/************************************************** */
/* Buildstarter Smart Contract                 */
/************************************************** */
contract Buildstarter {
    using SafeMath for uint256;

    bool private testingMode = false;
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    address private contractOwner;                                      // Account used to deploy contract

    uint256 private constant weiMultiplier = 10 ** uint256(18);  
    uint256 public registrationFee = 173726833183400000;                // Approximately $100


    struct Feature {
        bool registered;
        address creator;
        uint256 goal;
        uint256 endTimestamp;
        uint256 funding;
        uint256 payout;
        mapping(address => uint256) amounts;
        address[] funders;
    }

    mapping(uint256 => Feature) features; 


    event Register          // Fired when a new feature is registered
                            (
                                uint256 indexed id, 
                                address indexed account,
                                uint256 fee,
                                uint256 goal,
                                uint256 endTimestamp
                            );

    event Transfer          // Fired when tokens are transferred from one account to another
                            (
                                address indexed from, 
                                address indexed to, 
                                uint256 value
                            );

    event Funding
                            (
                                address indexed from,
                                uint256 value,
                                uint256 funding
                            );

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational);
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner);
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    function Buildstarter
                            ( 
                                
                            ) 
                            public
    {
        contractOwner = msg.sender;
    }    


   /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }

   /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    * @return A bool that is the new operational mode
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    function setTestingMode
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        testingMode = mode;
    }

    /**
    * @dev Sets registration fee
    */    
    function setRegistrationFee
                            (
                                uint256 fee
                            ) 
                            external
                            requireIsOperational
                            requireContractOwner 
    {
        require(fee >= 0);
        registrationFee = fee;
    }

    function register
                            (   
                                uint256 id,
                                uint256 goal,
                                uint256 endTimestamp
                            )
                            external
                            payable
                            requireIsOperational 
    {
        require(id > 0);
        require(!features[id].registered);
        require(goal > 0);
        require(msg.value >= registrationFee);
        if (!testingMode) {
            require(endTimestamp > now);        
        }

        contractOwner.transfer(msg.value);

        features[id] = Feature({
                                    registered: true,
                                    creator: msg.sender,
                                    goal: goal,
                                    endTimestamp: endTimestamp,
                                    funding: 0,
                                    payout: 0,
                                    funders: new address[](0)
                              });

        emit Register(id, msg.sender, msg.value, goal, endTimestamp);
        emit Transfer(msg.sender, contractOwner, msg.value);
    }


    function getFeature
                            (
                                uint256 id
                            )
                            external
                            view
                            returns(address, uint256, uint256, uint256, uint256, address[])
    {
        require(id > 0);
        require(features[id].registered);  

        Feature memory feature = features[id];

        return (feature.creator, feature.goal, feature.endTimestamp, feature.funding, feature.payout, feature.funders);     
    }


    function fund
                            (
                                uint256 id
                            )
                            external
                            payable
                            requireIsOperational
    {
        require(id > 0);
        require(features[id].registered);
        require(msg.value > 0);
        if (!testingMode) {
            require(features[id].endTimestamp >= now);
        }

        features[id].funding = features[id].funding.add(msg.value);
        if (features[id].amounts[msg.sender] > 0) {
            features[id].amounts[msg.sender] = features[id].amounts[msg.sender].add(msg.value);
        } else {
            features[id].amounts[msg.sender] = msg.value;
            features[id].funders.push(msg.sender);
        }

        emit Funding(msg.sender, msg.value, features[id].funding);

    }


    function settle
                            (
                                uint256 id
                            )
                            external
                            requireIsOperational
    {
        require(id > 0);
        require(features[id].registered);
        require(features[id].funding >= features[id].goal);
        if (!testingMode) {
            require(features[id].endTimestamp < now);
        }

        features[id].payout = features[id].funding;
        features[id].funding = 0;
        features[id].creator.transfer(features[id].payout);
        emit Transfer(address(this), features[id].creator, features[id].payout);
    }



    function refund
                            (
                                uint256 id
                            )
                            external
                            requireIsOperational
    {
        require(id > 0);
        require(features[id].registered);
        require(features[id].funding > 0);
        require(features[id].funding < features[id].goal);
        require(features[id].amounts[msg.sender] > 0);
        if (!testingMode) {
            require(features[id].endTimestamp < now);
        }

        uint256 refundAmount = features[id].amounts[msg.sender];
        features[id].amounts[msg.sender] = 0;
        features[id].funding = features[id].funding.sub(refundAmount);
        msg.sender.transfer(refundAmount);
        emit Transfer(address(this), msg.sender, refundAmount);

    }

    /**
    * @dev Fallback function 
    *
    */
    function() 
                            external 
                            payable 
    {
        donate();
    }

    /**
    * @dev Donate funds
    */
    function donate
                            (
                            ) 
                            public 
                            payable 
    {
        contractOwner.transfer(msg.value);
    }


}   

/*
LICENSE FOR SafeMath

The MIT License (MIT)

Copyright (c) 2016 Smart Contract Solutions, Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


library SafeMath {
/* Copyright (c) 2016 Smart Contract Solutions, Inc. */
/* See License at end of file                        */

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
        return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}
