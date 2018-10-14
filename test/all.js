
var BigNumber = require('bignumber.js');
var Test = require('../testConfig.js');

contract('All Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.buildstarter.setTestingMode(true);
  });


  it('can register a Feature using feature() and fetch it using getFeature()', async () => {
    
    // ARRANGE
    let creator = accounts[1];
    let goal = config.weiMultiple.mul(config.fundingGoal);
    let fee = await config.buildstarter.getRegistrationFee.call();

    // ACT
    await config.buildstarter.register(config.featureId, goal, config.endTimestamp, { from: creator, value: fee });
    let feature = await config.buildstarter.getFeature.call(config.featureId); 

    // ASSERT
    assert.equal(feature[0], creator, "Incorrect Creator value");
    assert.equal(feature[1].toNumber(), goal.toNumber(), "Incorrect Goal value");
    assert.equal(feature[2].toNumber(), config.endTimestamp, "Incorrect EndTimestamp value");
    assert.equal(feature[3].toNumber(), 0, "Incorrect Funding value");
    assert.equal(feature[4].toNumber(), 0, "Incorrect Payout value");

  });

  it('can fund a feature using fund()', async() => {

    // ARRANGE
    let funder = accounts[2];
    let funding = config.weiMultiple.mul(config.fundingGoal); 

    // ACT
    await config.buildstarter.fund(config.featureId,  { from: funder, value: funding });
    let feature = await config.buildstarter.getFeature.call(config.featureId); 

    // ASSERT
    assert.equal(feature[3].toNumber(), funding, "Incorrect Funding value");
    assert.equal(feature[4].toNumber(), 0, "Incorrect Payout value");
    assert.equal(feature[5][0], funder, "Incorrect Funder value");

  });

  it('can settle a feature using settle()', async function() {

    // ARRANGE
    let creator =  accounts[1];
    let funding = config.weiMultiple.mul(config.fundingGoal); 

    // ACT
    await web3.eth.getBalance(creator, async (error, result) => {

      let balanceAcctOld = result;

      await config.buildstarter.settle(config.featureId);
      let feature = await config.buildstarter.getFeature.call(config.featureId); 
  
      // ASSERT
      assert.equal(feature[3].toNumber(), 0, "Incorrect Funding value");
      assert.equal(feature[4].toNumber(), funding, "Incorrect Payout value");

      await web3.eth.getBalance(creator, (error, result) => {
 
        let balanceAcctNew = result;

        // ASSERT
        assert.isAbove(balanceAcctNew.toNumber(), (balanceAcctOld).add(feature[4]).toNumber() - 500000, "Incorrect account balance value");

      });

    });


  });

  

  // it('can donate 1 ETH of tokens using donate()', async () => {

  //   // ARRANGE
  //   let wei = config.weiMultiple.mul(10); 
  
  //   // ACT
  //   await web3.eth.getBalance(config.owner, async (error, result) => {
      
  //      let balanceAcctOld = result;
  //      await config.buildstarter.donate({ from: accounts[5], value: wei });
 
  //      await web3.eth.getBalance(config.owner, (error, result) => {
 
  //        let balanceAcctNew = result;

  //        // ASSERT
  //        assert.equal(balanceAcctNew.sub(balanceAcctOld).toNumber(), wei.toNumber(), "Incorrect account balance value");
 
  //      });
  //    });
 
  //  });
 
 
});
