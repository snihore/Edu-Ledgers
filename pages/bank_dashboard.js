import React, { Component } from 'react';
import GetInstance from '../instance';
import EducationLoan from '../ethereum/build/EducationLoan.json';
import { Menu, Card, Button, Divider, Form, Grid, Segment, Dimmer, Loader, List, Dropdown } from 'semantic-ui-react';

const DefaultLoader = (props) => (
    <Segment>
      <Dimmer
          active = {props.active}
          page={true}>
        <Loader />
      </Dimmer>
    </Segment>
  )

  const options = [
    { 
        key: '0x929fceD87459aCa903982f5c03056283EE0128cF', 
        text: 'OBC', 
        value: '0x929fceD87459aCa903982f5c03056283EE0128cF' 
    },
    {
        key: '0xb34CA1921ee11d80CeD69e1c037B26423e34d1C5',
        text: 'SBI',
        value: '0xb34CA1921ee11d80CeD69e1c037B26423e34d1C5'
    }
  ]


function removeDuplicates(array) {
    return array.filter((a, b) => array.indexOf(a) === b)
};

class CollegeDashboard extends Component {

    static getInitialProps({ query }) {
        return { query };
    }

    state = {
        account: '',
        loanAddress: '',
        loaderActive: false,
        web3: undefined,
        instance: undefined,
        eduLoanInstance: undefined,
        listItems: [],
        statusStack: [],
        banks: [],
        stuCourseName: '',
        stuCourseDuration: '',
        stuSessionType: '',
        stuTotalFee: '',
        stuAccName: '',
        stuAccNum: '',
        stuAccBalance: '',
        stuIdentityInfo: '',
        stuAddressInfo: '',
        stuFinancialInfo: '',
        stuDomicileInfo: '',
        stuPassBook: '',
        collegeAddr: '',
        studentAddr: '',
        bankAccNum: '',
        searchSessionIndex: '',
        sessionFeeNum: '',
        sessionFeeFromAcc: '',
        sessionFeeToAcc: '',
        sessionFeeAmount: ''
    }

    async componentDidMount() {
        this.setState({
            loanAddress: this.props.query.loanAddress
        });
        const { web3, instance } = await new GetInstance().get();

        const accounts = await web3.eth.getAccounts();

        const eduLoanInstance = await new web3.eth.Contract(JSON.parse(EducationLoan.interface), this.state.loanAddress);
        // console.log(`Edu-Loan Instance: ${eduLoanInstance.options.address}`);
        this.setState({
            web3,
            instance,
            eduLoanInstance,
            account: accounts[0],
            bankAddr: '',
            studentAddr: ''
        });
        this.getLoanHistory();
        this.getAddresses();
        this.getAdmissionInfo();
        this.getLoanAccInfo();
        this.getDocs();
    }

    getDocs = async ()=>{

        const docInfo  = await this.state.eduLoanInstance.methods.documentsInfo().call();
        const { identityInfo, addressInfo, financialInfo, domicileInfo, bankPassbook } = docInfo;
        this.setState({
            
            stuIdentityInfo: identityInfo,
            stuAddressInfo: addressInfo,
            stuFinancialInfo: financialInfo,
            stuDomicileInfo: domicileInfo,
            stuPassBook: bankPassbook
        });
    }

    getAdmissionInfo = async ()=>{
        const admissionInfo = await this.state.eduLoanInstance.methods.admissionInfo().call();
        const { courseName, courseDuration, sessionType, appxTotalFee } = admissionInfo;
        this.setState({
            stuCourseName: courseName,
            stuCourseDuration: courseDuration,
            stuSessionType: sessionType,
            stuTotalFee: appxTotalFee
        });
    }

    getLoanAccInfo = async ()=>{
        const loanAccDetails = await this.state.eduLoanInstance.methods.loanAccountdetails().call();
        const { accName, accNo, accBalance } = loanAccDetails;
        this.setState({
            stuAccName: accName,
            stuAccNum: accNo,
            stuAccBalance: accBalance
        });
    }

    getAddresses = async ()=>{

        const studentAddr =  await this.state.eduLoanInstance.methods.student().call();
        const collegeAddr = await this.state.eduLoanInstance.methods.college().call();

        this.setState({
            collegeAddr,
            studentAddr
        });
    }

    getLoanHistory = async ()=>{
        this.setState({
            statusStack: [],
            listItems: []
        });
        let statusStack = await this.state.eduLoanInstance.methods.getStatusStack().call();
        statusStack.sort();
        statusStack = removeDuplicates(statusStack);
        this.setState({ statusStack });
        // console.log(`STATUS STACK: ${statusStack}`);
        
        for(var i=0; i<statusStack.length; i++){

            const status = statusStack[i];

            let item = await this.state.eduLoanInstance.methods.history(status).call();
            item += `\t[ ${this.state.listItems.length+1} ]`;
            const localListItems = this.state.listItems;
            localListItems.push(item);
            this.setState({
                listItems: localListItems
            });
        }
        
    }

    rejectDocsInfo = async event =>{
        event.preventDefault();

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.rejectDocumentsInfo().send({
                from: this.state.account
            });
            
            this.getLoanHistory();
           

        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
        }
    }

    varifyDocsInfo = async event =>{
        event.preventDefault();

        if(
            this.state.stuAccName === '' ||
            this.state.stuAccNum === '' ||
            this.state.stuAccBalance === ''
        ){
            window.alert('Please fill all the input fields ...');
            return;
        }

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.varifyDocumentsInfo(
                this.state.stuAccName,
                this.state.stuAccNum,
                Number(this.state.stuAccBalance)
            ).send({
                from: this.state.account
            });
            
            this.setState({ loaderActive: false });
            this.getLoanHistory();
            this.getLoanAccInfo();

        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
        }
    }

    paySessionFee = async event =>{
        event.preventDefault();

        if(this.state.bankAccNum === ''){
            window.alert("Please fill input correctly ...");
            return;
        }

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.paySessionFee(
                this.state.bankAccNum
            ).send({
                from: this.state.account
            });
            
            this.setState({ loaderActive: false });
            this.getLoanHistory();
            this.getLoanAccInfo();

        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
        }
    }

    getFeeDetails = async event =>{
        event.preventDefault();

        if(this.state.searchSessionIndex === ''){
            window.alert('Please fill input correctly...');
            return;
        }

        try{
            this.setState({ loaderActive: true });

            const feeDetails = await this.state.eduLoanInstance.methods.feeDetails(Number(this.state.searchSessionIndex)-1).call();
        
            const { fromAcc, toAcc, session, amount } = feeDetails;

            this.setState({
                loaderActive: false,
                sessionFeeFromAcc: fromAcc,
                sessionFeeToAcc: toAcc,
                sessionFeeNum: session,
                sessionFeeAmount: amount
            });
        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
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

                <div>
                    <Menu style={{ marginBottom: 50 }}>
                        <Menu.Item header>
                            Edu-Ledger [Bank]
                    </Menu.Item>

                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <h4 style={{
                                    marginRight: 10,
                                    color: 'green'
                                }}>Bank Address:</h4>{this.state.account}
                            </Menu.Item>
                            <Menu.Item>
                                <h4 style={{
                                    marginRight: 10,
                                    color: 'green'
                                }}>Loan Address:</h4>{this.state.loanAddress}
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </div>
                <div>
                    <Grid columns={2}>
                        <Grid.Row>
                            <Grid.Column>
                                <div style={{marginBottom:20}}>
                                    <h3>Documents uploaded by Student</h3>
                                    <List selection verticalAlign='middle'>
                                    <List.Item>
                                    <List.Content>
                                    <List.Header>{ this.state.stuIdentityInfo }</List.Header>
                                    </List.Content>
                                    </List.Item>
                                    <List.Item>
                                    <List.Content>
                                    <List.Header>{ this.state.stuAddressInfo }</List.Header>
                                    </List.Content>
                                    </List.Item>
                                    <List.Item>
                                    <List.Content>
                                    <List.Header>{ this.state.stuFinancialInfo }</List.Header>
                                    </List.Content>
                                    </List.Item>
                                    <List.Item>
                                    <List.Content>
                                    <List.Header>{ this.state.stuDomicileInfo }</List.Header>
                                    </List.Content>
                                    </List.Item>
                                    <List.Item>
                                    <List.Content>
                                    <List.Header>{ this.state.stuPassBook }</List.Header>
                                    </List.Content>
                                    </List.Item>
                                    </List>
                                </div>
                                <div>
                                    <Card.Group>
                                        <Card>
                                            <Card.Content header='Varify Documents' />
                                            <Card.Content>
                                                <Form>
                                                    <Form.Input
                                                        placeholder='Account Name'
                                                        value={this.state.stuAccName} 
                                                        onChange={event => this.setState({ stuAccName: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Account Number'
                                                        value={this.state.stuAccNum} 
                                                        onChange={event => this.setState({ stuAccNum: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Balance'
                                                        value={this.state.stuAccBalance} 
                                                        onChange={event => this.setState({ stuAccBalance: event.target.value })}
                                                    />
                                                    <Button content='Varify' primary onClick={this.varifyDocsInfo}/>
                                                    <Button content='Reject' primary onClick={this.rejectDocsInfo}/>
                                                </Form>
                                            </Card.Content>
                                        </Card>
                                        <Card>
                                            <Card.Content header='Confirm Session (Pay Fee)' />
                                            <Card.Content>
                                                <Form>
                                                    <Form.Input
                                                        placeholder='Bank Account Number'
                                                        value={this.state.bankAccNum} 
                                                        onChange={event => this.setState({ bankAccNum: event.target.value })}
                                                    />
                                                    <Button content='Confirm' primary onClick={this.paySessionFee}/>
                                                </Form>
                                            </Card.Content>
                                        </Card>
                                        
                                    </Card.Group>
                                </div>
                            </Grid.Column>
                            <Grid.Column>
                                <div style={{ marginBottom: 20 }}>
                                    <h3>Loan Participants</h3>
                                    <Segment inverted style={{backgroundColor: '#EEEEEE'}}>
                                        <List divided inverted relaxed>
                                        <List.Item>
                                            <List.Header style={{color:'black'}}>STUDENT ADDRESS:</List.Header>
                                            <List.Content style={{color:'green'}}>
                                            { this.state.studentAddr }
                                            </List.Content>
                                        </List.Item>
                                        <List.Item>
                                            <List.Header style={{color:'black'}}>COLLEGE ADDRESS:</List.Header>
                                            <List.Content style={{color:'green'}}>
                                            { this.state.collegeAddr }
                                            </List.Content>
                                        </List.Item>
                                        </List>
                                    </Segment>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                <h3>Loan Account Details</h3>
                                <Segment inverted style={{backgroundColor: '#EEEEEE'}}>
                                    <List divided inverted relaxed>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>ACCOUNT NAME:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuAccName }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>ACCOUNT NUMBER:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuAccNum }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>BALANCE:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuAccBalance }
                                        </List.Content>
                                    </List.Item>
                                    </List>
                                </Segment>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                <h3>Course Details</h3>
                                <Segment inverted style={{backgroundColor: '#EEEEEE'}}>
                                    <List divided inverted relaxed>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Course Name:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuCourseName }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Course Duration:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuCourseDuration }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Session Type:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuSessionType }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Total Fee (approx.):</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.stuTotalFee }
                                        </List.Content>
                                    </List.Item>
                                    </List>
                                </Segment>
                                </div>
                                <div>
                                <h3>History</h3>
                                <List divided relaxed>
                                   {
                                       this.state.listItems.map((item)=>{
                                           const key = this.state.statusStack[this.state.listItems.indexOf(item)];
                                        
                                           return (
                                            <List.Item key={key}>
                                                <List.Icon name='check circle' size='large' verticalAlign='middle' style={{color:'green'}} />
                                                <List.Content>
                                                <List.Header style={{color:'blue'}}>{item}</List.Header>
                                                </List.Content>
                                            </List.Item>
                                           )
                                       })
                                   }
                                </List>
                                </div>
                                <div style={{marginTop:20}}>
                                <h3>Fee History</h3>
                                <Segment inverted style={{backgroundColor: '#EEEEEE'}}>
                                    <List divided inverted relaxed>

                                    <List.Item>
                                    <Form.Input
                                        placeholder='Enter Session'
                                        value={this.state.searchSessionIndex} 
                                        onChange={event => this.setState({ searchSessionIndex: event.target.value })}
                                        style={{marginBottom:10}}
                                    />
                                    <Button 
                                        content='Search' 
                                        primary onClick={this.getFeeDetails}
                                        style={{marginBottom:10}} />
                                    <List.Header style={{color:'black'}}>Session:</List.Header>
                                    <List.Content style={{color:'green'}}>
                                    {this.state.sessionFeeNum}
                                    </List.Content>
                                    <List.Header style={{color:'black'}}>From:</List.Header>
                                    <List.Content style={{color:'green'}}>
                                    {this.state.sessionFeeFromAcc}
                                    </List.Content>
                                    <List.Header style={{color:'black'}}>To:</List.Header>
                                    <List.Content style={{color:'green'}}>
                                    {this.state.sessionFeeToAcc}
                                    </List.Content>
                                    <List.Header style={{color:'black'}}>Amount:</List.Header>
                                    <List.Content style={{color:'green'}}>
                                    {this.state.sessionFeeAmount}
                                    </List.Content>
                                    </List.Item>
                                    
                                    </List>
                                </Segment>
                                </div>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>

                </div>
                <DefaultLoader active={this.state.loaderActive} />
            </div>
        );
    }
}

export default CollegeDashboard;