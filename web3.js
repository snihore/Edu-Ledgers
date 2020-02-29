import Web3 from 'web3';

const makeProvider = ()=>{
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/744d8f9fc55945a59ad5c13651c25d51'
    );

    return provider;
}

class GetMetamaskProvider{

    constructor(){
        if(typeof window !== 'undefined'){
            if(typeof window.ethereum !== 'undefined'){
                this.web3 = new Web3(window.ethereum);
            }else if(typeof window.web3 !== 'undefined'){
                this.web3 = new Web3(window.web3.currentProvider);
            }else{
                this.web3 = new Web3(makeProvider);
            }
        }else{
            this.web3 = new Web3(makeProvider);
        }
    }

    async enable(){

        if(typeof window !== 'undefined'){
            if(typeof window.ethereum !== 'undefined'){
                window.ethereum.autoRefreshOnNetworkChange = false;
                await window.ethereum.enable();
                return this.web3;
            }else{
                return this.web3;
            }
        }else{
            return this.web3;
        }
    }
}

export default GetMetamaskProvider;