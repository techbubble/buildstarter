requirejs(["node_modules/bignumber.js/bignumber.min.js"], function (BigNumber) {

    let featureArray = [];
    let features = {};
    let Buildstarter = null;
    let weiMultiple = (new BigNumber(10)).pow(18);

    let configs = {

        localhost: {
            url: 'http://localhost:8545',
            address: '0xc8A9040B56bF29EE8Cce4082f88B064aefa71250'
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
    fetch('build/contracts/BuildStarter.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            initializeWeb3(data.abi, configs.ropsten);
        });



    function initializeWeb3(abi, config) {

        web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        web3.eth.defaultAccount = web3.eth.accounts[0];
        Buildstarter = web3.eth.contract(abi).at(config.address);


        let feature = Buildstarter.getFeature.call(1000);
        console.log(feature);


        let filter = web3.eth.filter('latest');
        filter.watch(function (error, result) {
            var block = web3.eth.getBlock(result, true);
            console.log('block #' + block.number);
            console.dir(block.transactions);
        });

    }

    function registerButtonAction() {
        let id = $(this).attr('rel');
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






    /* Basic UI code that can be swapped out with React, Vue, Angular etc. and back-end API  */


    initUI();

    function initUI() {
        $('#save-button').on('click', saveButtonAction);
        $('#clear-button').on('click', clearButtonAction);
        refreshTable();
    }

    function saveButtonAction() {
        let id = $('#field-id').val();
        let topic = $('#field-topic').val();
        let goal = $('#field-goal').val();
        addAndSaveItem(id, topic, goal);
    }

    function clearButtonAction() {
        clearFeatures();
        refreshTable();
    }

    function refreshTable() {
        $('#tbody').html('');
        loadFeatures();
        featureArray.map((item) => {
            addRow(item.id, item.topic, item.goal, item.funding);
        });
    }

    function addRow(id, topic, goal, funding) {
        let buttons = `<a class="btn btn-primary" rel="${id}" id="register-button-${id}">Register</a>`;
        $('#tbody').append(`<tr><th scope="row">${id}</th><td>${topic}</td><td>${goal}</td><td>${funding}</td><td>${buttons}</td></tr>`);
        $('#register-button-' + id).on('click', registerButtonAction);
    }

    function addAndSaveItem(id, topic, goal) {
        addRow(id, topic, goal, 0);
        saveFeature({
            id: id,
            topic: topic,
            goal: goal,
            funding: 0
        });
    }

    function saveFeature(feature) {
        featureArray.push(feature);
        localStorage.setItem('features', JSON.stringify(featureArray));
        createDictionary();
    }

    function createDictionary() {
        features = {};
        featureArray.map((item) => {
            features[item.id] = item;
        });
    }

    function loadFeatures() {
        featureArray = JSON.parse(localStorage.getItem('features')) || [];
        createDictionary();
    }

    function clearFeatures() {
        localStorage.setItem('features', JSON.stringify([]));
        featureArray = [];
        createDictionary();
    }

});













