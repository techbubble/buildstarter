
require.config({
    paths : {
        json: '../node_modules/requirejs-plugins/src/json',
        text: '../node_modules/requirejs-plugins/lib/text'
    }
});

requirejs(['../node_modules/bignumber.js/bignumber.min.js', 'json!../build/contracts/Buildstarter.json'], function (BigNumber, contract) {

    let featureArray = [];
    let features = {};
    let Buildstarter = null;
    let weiMultiple = (new BigNumber(10)).pow(18);

    let configs = {

        localhost: {
            url: 'http://localhost:8545',
            address: '0x9517356a4C2bF8d0F2B325Fc44Da08C76015bA2A'
        },
        ropsten: {
            url: 'https://ropsten.infura.io/hoaFrziApKtGNChupjGp',
            address: '0x91EE565eCb7A3Be7Bff5dB81CCf4cdC693aA4270'
        },
        mainnet: {
            url: '',
            address: ''
        }
    }

    
    // Load contract Application Binary Interface  
    initializeWeb3(contract.abi, configs.localhost);




    function initializeWeb3(abi, config) {

        let web3 = new Web3(new Web3.providers.HttpProvider(configs.localhost.url));
        web3.eth.defaultAccount = web3.eth.accounts[0];
        Buildstarter = web3.eth.contract(abi).at(config.address);

        let feature = Buildstarter.getFeature.call(1000);
        //console.log(feature);

        let filter = web3.eth.filter('latest');
        filter.watch(function (error, result) {
            var block = web3.eth.getBlock(result, true);
            //console.log('block #' + block.number);
            //console.dir(block.transactions);
        });

    }

    /* Basic UI code that can be swapped out with React, Vue, Angular etc. and back-end API  */

    initUI();

    function initUI() {
        document.getElementById('add-button').onclick = addButtonAction;
        document.getElementById('clear-button').onclick = clearButtonAction;
        refreshTable();
    }

    function addButtonAction() {
        let id = document.getElementById('field-id').value;
        let topic = document.getElementById('field-topic').value;
        let goal = document.getElementById('field-goal').value;
        addAndSaveItem(id, topic, goal);
    }

    function clearButtonAction() {
        localStorage.setItem('features', JSON.stringify([]));
        featureArray = [];
        createDictionary();
        refreshTable();
    }

    function registerButtonAction(el) {
        let id = parseInt(el.target.id.split('-')[2]);
        let feature = features[id];
        let fee = Buildstarter.getRegistrationFee.call();
        let params = {
            from: web3.eth.defaultAccount,
            gas: 400000,
            value: fee
        };
        
        let endTime = Math.round(new Date().getTime() / 1000) + 10;
        Buildstarter.register(id, web3.toWei(feature.goal, 'ether'), endTime, params, function(error, transaction) {
            console.log(error, transaction);
        });
    }


    function refreshTable() {
        document.getElementById('tbody').innerHTML = '';
        featureArray = JSON.parse(localStorage.getItem('features')) || [];
        createDictionary();
        featureArray.map((item) => {
            addRow(item.id, item.topic, item.goal, item.funding);
        });
    }

    function addAndSaveItem(id, topic, goal) {
        addRow(id, topic, goal, 0);
        let feature = {
            id: id,
            topic: topic,
            goal: goal,
            funding: 0
        };
        featureArray.push(feature);
        localStorage.setItem('features', JSON.stringify(featureArray));
        createDictionary();
    }

    function addRow(id, topic, goal, funding) {
        let buttons = `<a class="btn btn-primary" id="register-button-${id}">Register</a>`;
        document.getElementById('tbody').insertAdjacentHTML('beforeend', `<tr><th scope="row">${id}</th><td>${topic}</td><td>${goal}</td><td>${funding}</td><td>${buttons}</td></tr>`);
        document.getElementById(`register-button-${id}`).onclick = registerButtonAction;
    }

    function createDictionary() {
        features = {};
        featureArray.map((item) => {
            features[item.id] = item;
        });
    }

});













