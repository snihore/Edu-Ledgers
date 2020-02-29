import GetMetamaskProvider from './web3';
import CreateLoan from './ethereum/build/CreateLoan.json';

const abi = JSON.parse(CreateLoan.interface);

const address = '0x7b2732C20B308C513305e3014cE4520a6580ac80';

const getMetamaskProvider = new GetMetamaskProvider();

class GetInstance{

    async get(){
        const web3 = await getMetamaskProvider.enable();

        const instance = await new web3.eth.Contract(abi, address);

        return { web3, instance };
    }
}

export default GetInstance;