import React, { Component } from 'react';
import { Button, List, Card } from 'semantic-ui-react';
import GetInstance from '../instance';

class App extends Component {

    state = {
        account:''
    };
    async componentDidMount(){
        const { web3, instance } = await new GetInstance().get();

        const accounts = await web3.eth.getAccounts();

        this.setState({ account: accounts[0] });

    };

    render() {
        return (
            <div style={
                {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }
            }>
                <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />

                <div style={{
                    padding: 100,
                    backgroundColor: '#BDBDBD',
                    borderRadius: 10
                }}>
                    <List>
                        <List.Item><div style={{
                            width: 400, alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <h2>Edu-Ledger</h2>
                        </div>
                        </List.Item>
                        <List.Item><Button primary style={{ width: 400 }} href="/student">Student</Button></List.Item>
                        <List.Item><Button primary style={{ width: 400 }} href="/college">College</Button></List.Item>
                        <List.Item><Button primary style={{ width: 400 }} href="/bank">Bank</Button></List.Item>
                        <List.Item></List.Item>
                        <List.Item></List.Item>
                        <List.Item><div style={{
                            width: 400, alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <h4>Your MetaMask Address:</h4>
                        </div>
                        </List.Item>
                        <List.Item>
                            <Card style={{ width: 400 }}>
                                <Card.Content>
                                    <Card.Description style={{ color: '#4CAF50' }}>
                                    {this.state.account}
                                    </Card.Description>
                                </Card.Content>
                            </Card>
                        </List.Item>
                    </List>
                </div>
            </div>
        )
    };
}

export default App;