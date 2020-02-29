import React, { Component } from 'react';
import Router from 'next/router';
import { Menu, Button, Divider, Form, Grid, Segment, Dimmer, Loader, Card } from 'semantic-ui-react';
import GetInstance from '../instance';

const DefaultLoader = (props) => (
    <Segment>
      <Dimmer
          active = {props.active}
          page={true}>
        <Loader />
      </Dimmer>
    </Segment>
  )

class Bank extends Component{

    state = {
        account: '',
        loaderActive: false,
        web3: undefined,
        instance: undefined,
        showStatus: '',
        value:''
    };
    
    async componentDidMount() {
        const { web3, instance } = await new GetInstance().get();

        const accounts = await web3.eth.getAccounts();

        this.setState({
            web3,
            instance,
            account: accounts[0]
        });

    };

    getLoan = async event =>{
        event.preventDefault();
    
            try{
                
                if(this.state.value === ''){
                    window.alert("Enter Valid Email Address ...");
                    return;
                }
                this.setState({ loaderActive: true });
    
                let myAddress = await this.state.instance.methods.getLoanAddress(this.state.value).call();
                let isRoute = false;
                if(myAddress === '0x0000000000000000000000000000000000000000'){
                    myAddress = `Address not available ...`;
                }else{
                    isRoute = true;
                }
                this.setState({
                    loaderActive: false,
                    showStatus: myAddress
                });
                if(isRoute){
                    Router.push(`/bank_dashboard?loanAddress=${myAddress}`);
                }
                
                
            }catch(err){
                window.alert(err.message);
            }
        }

    render(){

        return(
            <div style={{
                marginLeft: 100,
                marginRight: 100,
                marginTop: 50
            }}>
                <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
                
                <Menu style={{marginBottom:50}}>
                    <Menu.Item header>
                        Edu-Ledger [Bank]
                    </Menu.Item>

                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {this.state.account}
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <div style={
                {
                    display:'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            }>
                    <Card>
                        <Card.Content header="Go to Student's Loan Contract" />
                        <Card.Content>
                            <Form>
                                <Form.Input
                                    iconPosition='left'
                                    label='Enter Email Address'
                                    placeholder='Email'
                                    value={this.state.value} 
                                    onChange={event => this.setState({ value: event.target.value })}
                                />
                                <Button content='Go' primary onClick={this.getLoan}/>
                            </Form>
                        </Card.Content>
                    </Card>
                </div>
                <div>
                    <h1 style={{color:'green'}}>{this.state.showStatus}</h1>
                    <DefaultLoader active={this.state.loaderActive} />
                </div>
            </div>
        );
    }
}

export default Bank;