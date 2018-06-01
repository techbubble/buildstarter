var HDWalletProvider = require("truffle-hdwallet-provider");

// Only for testing...not actual production values
var mnemonic = "motor tuna throw pupil put where rule defense nothing impulse tag input";

module.exports = {
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/hoaFrziApKtGNChupjGp");
      },
      network_id: '3',
      gas: 2900000
    },
    development: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://localhost:8545/", 0, 10);
      },
      network_id: '*',
      gas: 9999999
    }
  }
};