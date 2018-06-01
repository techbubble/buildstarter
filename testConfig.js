
var Buildstarter = artifacts.require("Buildstarter");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    let testAddresses = [
        "0x427bfa1ebd65dd5a136ed3112fe5f72e7cebe43a",
        "0xa4c2f35340307e50b453ccd6574db054d2ef357a",
        "0x618c683268c1c2a75f28e158943977e81b7568a1",
        "0x060e9bb7211af94a13f2d09cec767d5d2ca4acc1",
        "0x558e33b4272da4b004470a4ada4e673cc972379a",
        "0x6b85cc8f612d5457d49775439335f83e12b8cfde",
        "0xcbd22ff1ded1423fbc24a7af2148745878800024",
        "0xc257274276a4e539741ca11b590b9447b26a8051",
        "0x2f2899d6d35b1a48a4fbdc93a37a72f264a9fca7"
    ];


    let owner = accounts[0];
    let buildstarter = await Buildstarter.new();

    return {
        owner: owner,
        featureId: 1000,
        weiMultiple:  (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        endTimestamp: Math.round(new Date().getTime() / 1000) + 10,
        fundingGoal: 5,
        buildstarter: buildstarter
    }
}


module.exports = {
    Config: Config
};