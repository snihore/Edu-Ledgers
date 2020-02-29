import React, { Component } from 'react';
import Router from 'next/router';
import { Menu, Button, Divider, Form, Grid, Segment, Dimmer, Loader } from 'semantic-ui-react';
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

class Student extends Component {

    state = {
        account: '',
        loaderActive: false,
        web3: undefined,
        instance: undefined,
        showStatus: '',
        value1:'',
        value2:''
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

   createLoan = async event =>{
    event.preventDefault();
        let myAddress;

        try{
            
            if(this.state.value1 === ''){
                window.alert("Enter Valid Email Address ...");
                return;
            }
            this.setState({ loaderActive: true });
            myAddress = `Something wrong in Ethereum Network ...`;
            await this.state.instance.methods.createEducationLoan(this.state.value1).send({
                from: this.state.account
            });
            
            myAddress = await this.state.instance.methods.getLoanAddress(this.state.value1).call();
            console.log(`Loan Address: ${myAddress}`);
            if(myAddress === '0x0000000000000000000000000000000000000000'){
                myAddress = `Address not available ...`
            }

        }catch(err){
            window.alert(err.message);
        }
        this.setState({
            loaderActive: false,
            showStatus: myAddress
        });
    }

    getLoan = async event =>{
        event.preventDefault();
    
            try{
                
                if(this.state.value2 === ''){
                    window.alert("Enter Valid Email Address ...");
                    return;
                }
                this.setState({ loaderActive: true });
    
                let myAddress = await this.state.instance.methods.getLoanAddress(this.state.value2).call();
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
                    Router.push(`/student_dashboard?loanAddress=${myAddress}`);
                }
                
                
            }catch(err){
                window.alert(err.message);
            }
        }

    render() {

        return (
            <div style={{
                marginLeft: 100,
                marginRight: 100,
                marginTop: 50
            }}>
                <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
                
                <Menu style={{marginBottom:50}}>
                    <Menu.Item header>
                        Edu-Ledger
                    </Menu.Item>

                    <Menu.Menu position='right'>
                        <Menu.Item>
                            {this.state.account}
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <div>
                    <Segment placeholder>
                        <Grid columns={2} relaxed='very' stackable>
                        <Grid.Column>
                            <Form>
                            <Form.Input
                                iconPosition='left'
                                label='Enter Email Address'
                                placeholder='Email'
                                value={this.state.value2} 
                                onChange={event => this.setState({ value2: event.target.value })}
                            />
                            <Button content='Go' primary onClick={this.getLoan}/>
                            </Form>
                        </Grid.Column>

                        <Grid.Column verticalAlign='middle'>
                        <Form>
                            <Form.Input
                                iconPosition='left'
                                label='Enter Email Address'
                                placeholder='Email'
                                value={this.state.value1} 
                                onChange={event => this.setState({ value1: event.target.value })}
                            />
                            <Button content='Create Loan' size='big' onClick={this.createLoan}/>
                            </Form>  
                        </Grid.Column>
                        </Grid>

                        <Divider vertical>Or</Divider>
                    </Segment>
                </div>
                <div style={{
                    marginTop: 50,
                    color: 'grey'
                }}>
                    <h1 style={{color:'green'}}>{this.state.showStatus}</h1>
                    <DefaultLoader active={this.state.loaderActive} />
                </div>
            </div>
        );
    }
}

export default Student;