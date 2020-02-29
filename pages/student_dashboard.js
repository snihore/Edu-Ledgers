import React, { Component } from 'react';
import GetInstance from '../instance';
import EducationLoan from '../ethereum/build/EducationLoan.json';
import { Menu, Card, Button, Divider, Form, Grid, Segment, Dimmer, Loader, List } from 'semantic-ui-react';

const DefaultLoader = (props) => (
    <Segment>
      <Dimmer
          active = {props.active}
          page={true}>
        <Loader />
      </Dimmer>
    </Segment>
  )

function removeDuplicates(array) {
    return array.filter((a, b) => array.indexOf(a) === b)
};

class StudentDashboard extends Component {

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
        yourCollegeAddr: '',
        yourBankAddr: '',
        yourAccName: '',
        yourAccNum: '',
        yourAccBalance: '',
        yourCourseName: '',
        yourCourseDuration: '',
        yourSessionType: '',
        yourTotalFee: '',
        collegeAddr: '',
        receiptAddr: '',
        selectBankIndex: '',
        stuIdentityInfo: '',
        stuAddressInfo: '',
        stuFinancialInfo: '',
        stuDomicileInfo: '',
        stuPassBook: '',
        sessionFeeNum: '',
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
            account: accounts[0]
        });
        this.getLoanHistory();
        this.getDocs();
        this.getAddresses();
        this.getAdmissionInfo();
        this.getLoanAccInfo();
        
        
    }

    getDocs = async ()=>{
        const receiptAddr = await this.state.eduLoanInstance.methods.admissionRecipt().call();

        const docInfo  = await this.state.eduLoanInstance.methods.documentsInfo().call();
        const { identityInfo, addressInfo, financialInfo, domicileInfo, bankPassbook } = docInfo;
        this.setState({
            receiptAddr,
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
            yourCourseName: courseName,
            yourCourseDuration: courseDuration,
            yourSessionType: sessionType,
            yourTotalFee: appxTotalFee
        });
    }

    getLoanAccInfo = async ()=>{
        const loanAccDetails = await this.state.eduLoanInstance.methods.loanAccountdetails().call();
        const { accName, accNo, accBalance } = loanAccDetails;
        this.setState({
            yourAccName: accName,
            yourAccNum: accNo,
            yourAccBalance: accBalance
        });
    }

    getAddresses = async ()=>{

        const yourCollegeAddr =  await this.state.eduLoanInstance.methods.college().call();
        const yourBankAddr = await this.state.eduLoanInstance.methods.bank().call();

        this.setState({
            yourBankAddr,
            yourCollegeAddr
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

    applySessionFee = async event =>{
        event.preventDefault();

        if(this.state.sessionFeeNum === ''){
            window.alert("Please fill input fields correctly ...");
            return;
        }

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.applyForSessionFee(Number(this.state.sessionFeeNum)).send({
                from: this.state.account
            });
            
            this.setState({ loaderActive: false });
            this.getLoanHistory();
            

        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
        }
    }

    uploadAdmissionReceipt = async event =>{
        event.preventDefault();
        
        if(this.state.collegeAddr === '' || this.state.receiptAddr === ''){
            window.alert('Please fill all the input fields ...');
            return;
        }

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.applyForLoan(this.state.collegeAddr, this.state.receiptAddr).send({
                from: this.state.account
            });
            
            this.setState({ loaderActive: false });
            this.getLoanHistory();
            this.getAddresses();

        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
        }
    }

    selectBank = async event =>{
        event.preventDefault();

        if(this.state.selectBankIndex === ''){
            window.alert('Please fill all the input fields ...');
            return;
        }

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.selectBank(Number(this.state.selectBankIndex)).send({
                from: this.state.account
            });
            
            this.setState({ loaderActive: false });
            this.getLoanHistory();
            this.getAddresses();

        }catch(err){
            window.alert(err.message);
            this.setState({ loaderActive: false });
        }
    }
    uploadDocuments = async event =>{
        event.preventDefault();

        if(
            this.state.stuAddressInfo === '' ||
            this.state.stuDomicileInfo === '' ||
            this.state.stuFinancialInfo === '' ||
            this.state.stuIdentityInfo === '' ||
            this.state.stuPassBook === ''
        ){
            window.alert("Please fill all the input fields ...");
            return;
        }

        try{
            this.setState({ loaderActive: true });
            
            await this.state.eduLoanInstance.methods.enterDocumentsInfo(
                this.state.stuAddressInfo,
                this.state.stuDomicileInfo,
                this.state.stuFinancialInfo,
                this.state.stuIdentityInfo,
                this.state.stuPassBook
            ).send({
                from: this.state.account
            });
            
            this.setState({ loaderActive: false });
            this.getLoanHistory();

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
                            Edu-Ledger
                    </Menu.Item>

                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <h4 style={{
                                    marginRight: 10,
                                    color: 'green'
                                }}>Your Address:</h4>{this.state.account}
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
                                <h3>Uploaded Documents</h3>
                                <List selection verticalAlign='middle'>
                                    <List.Item>
                                    <List.Content>
                                    <List.Header>{ this.state.receiptAddr }</List.Header>
                                    </List.Content>
                                    </List.Item>
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
                                            <Card.Content header='Upload Admission Receipt' />
                                            <Card.Content>
                                                <Form>
                                                    <Form.Input
                                                        placeholder='College Address'
                                                        value={this.state.collegeAddr} 
                                                        onChange={event => this.setState({ collegeAddr: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Confirmed Admission Receipt'
                                                        value={this.state.receiptAddr} 
                                                        onChange={event => this.setState({ receiptAddr: event.target.value })}
                                                    />
                                                    <Button content='Upload' primary onClick={this.uploadAdmissionReceipt}/>
                                                </Form>
                                            </Card.Content>
                                        </Card>
                                        <Card>
                                            <Card.Content header='Select Bank' />
                                            <Card.Content>
                                                <Form>
                                                    <Form.Input
                                                        placeholder='Index'
                                                        value={this.state.selectBankIndex} 
                                                        onChange={event => this.setState({ selectBankIndex: event.target.value })}
                                                    />
                                                    <Button content='Select' primary onClick={this.selectBank}/>
                                                </Form>
                                            </Card.Content>
                                        </Card>
                                        <Card>
                                            <Card.Content header='Upload Documents' />
                                            <Card.Content>
                                                <Form>
                                                    <Form.Input
                                                        placeholder='Identity Info.'
                                                        value={this.state.stuIdentityInfo} 
                                                        onChange={event => this.setState({ stuIdentityInfo: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Address Info.'
                                                        value={this.state.stuAddressInfo} 
                                                        onChange={event => this.setState({ stuAddressInfo: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Financial Info.'
                                                        value={this.state.stuFinancialInfo} 
                                                        onChange={event => this.setState({ stuFinancialInfo: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Domicile Info.'
                                                        value={this.state.stuDomicileInfo} 
                                                        onChange={event => this.setState({ stuDomicileInfo: event.target.value })}
                                                    />
                                                    <Form.Input
                                                        placeholder='Bank Passbook'
                                                        value={this.state.stuPassBook} 
                                                        onChange={event => this.setState({ stuPassBook: event.target.value })}
                                                    />
                                                    <Button content='Upload' primary onClick={this.uploadDocuments}/>
                                                </Form>
                                            </Card.Content>
                                        </Card>
                                        <Card>
                                            <Card.Content header='Apply for Session Fee' />
                                            <Card.Content>
                                                <Form>
                                                    <Form.Input
                                                        placeholder='Session (Number)'
                                                        value={this.state.sessionFeeNum} 
                                                        onChange={event => this.setState({ sessionFeeNum: event.target.value })}
                                                    />
                                                    <Button content='Apply' primary onClick={this.applySessionFee}/>
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
                                        <List.Header style={{color:'black'}}>YOUR COLLEGE ADDRESS:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourCollegeAddr }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>BANK ADDRESS:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourBankAddr }
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
                                        { this.state.yourAccName }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>ACCOUNT NUMBER:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourAccNum }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>BALANCE:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourAccBalance }
                                        </List.Content>
                                    </List.Item>
                                    </List>
                                </Segment>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                <h3>Your Course Details</h3>
                                <Segment inverted style={{backgroundColor: '#EEEEEE'}}>
                                    <List divided inverted relaxed>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Course Name:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourCourseName }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Course Duration:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourCourseDuration }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Session Type:</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourSessionType }
                                        </List.Content>
                                    </List.Item>
                                    <List.Item>
                                        <List.Header style={{color:'black'}}>Total Fee (approx.):</List.Header>
                                        <List.Content style={{color:'green'}}>
                                        { this.state.yourTotalFee }
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

export default StudentDashboard;