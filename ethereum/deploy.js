const Web3 = require('web3');
const hdWalletProvider = require('@truffle/hdwallet-provider');
const CreateLoan = require('./build/CreateLoan.json');

const mnemonic = 'swamp vintage sunny speed saddle wild siege apart wash width sudden right';
const endPoint = 'https://rinkeby.infura.io/v3/744d8f9fc55945a59ad5c13651c25d51';

const provider = new hdWalletProvider(mnemonic, endPoint);

const web3 = new Web3(provider);

const deploy = async ()=>{

    const accounts = await web3.eth.getAccounts();
    
    console.log(`Contract is deployed by ${accounts[0]}`);

    const instance = await new web3.eth.Contract(JSON.parse(CreateLoan.interface))
        .deploy({ data: '0x'+CreateLoan.bytecode })
        .send({ from: accounts[0] });

    console.log(`"CreateLoan" contract is deployed at ${instance.options.address}`);
}
deploy();
/**
 * 
Contract is deployed by 0x929fceD87459aCa903982f5c03056283EE0128cF
"CreateLoan" contract is deployed at 0x7b2732C20B308C513305e3014cE4520a6580ac80
 * 
 */