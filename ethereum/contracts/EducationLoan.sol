pragma solidity ^0.4.17;

contract CreateLoan{
    
    mapping(string=>address) loanRecord;
    mapping(string=>bool) isExist;
    
    function createEducationLoan(string email) public{
        require(!isExist[email]);
        loanRecord[email] = new EducationLoan(msg.sender);
        isExist[email] = true;
    }
    function getLoanAddress(string email) public view returns (address){
        return loanRecord[email];
    }
}

contract EducationLoan{
    
    struct AdmissionInfo{
        string courseName;
        string courseDuration;
        string sessionType;
        uint appxTotalFee;
    }
    
    struct DocumentsInfo{
        string identityInfo; // like ADHAAR & DRIVING LICENSE
        string addressInfo; // ELECTRICITY BILL, WATER BILL, LPG BILL, PASSPORT, VOTER ID, CURRENT HOUSE LEASE
        string financialInfo; // PAN CARD
        string domicileInfo; // DOMICILE CERTIFICATE, PERMANENT RESIDENCE CERTIFICATE
        string bankPassbook;
    }
    
    struct LoanAccountDetails{
        string accName;
        string accNo;
        uint accBalance;
    }
    
    struct SessionFeeDetail{
        string fromAcc;
        string toAcc;
        uint session;
        uint amount;
    }
    
    address public student;
    address public college;
    address public bank;
    string public admissionRecipt;
    address[] public banks;
    uint prev;
    string public errorMessage;
    AdmissionInfo public admissionInfo;
    DocumentsInfo public documentsInfo;
    LoanAccountDetails public loanAccountdetails;
    SessionFeeDetail[] public feeDetails;
    mapping(string=>bool) checkPoints;
    uint[] public statusStack;
    mapping(uint=>string) public history;
    /**
    *1. admissionReceiptAccepted
    *2. bankSelected
    *3. documentsVarified
    *4. sessionProcessing
    */
    
    
    function EducationLoan(address stu) public{
        student = stu;
        
    }
    
    function applyForLoan(address collegeAddr, string confirmedAdmissionReceipt) public{
        require(msg.sender == student);
        require(!checkPoints["admissionReceiptAccepted"]);
        
        college = collegeAddr;
        admissionRecipt = confirmedAdmissionReceipt;
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Admission receipt uploaded by STUDENT";
        
    }
    
    function varifyAdmission(
        string courseName,
        string courseDuration,
        string sessionType,
        uint appxTotalFee,
        address[] bankList
        ) public{
        require(msg.sender == college);
        //"BE", "4", "semester", 400000
        
        //1. Varifying Admission Receipt 
        require(!checkPoints["admissionReceiptAccepted"]);
        checkPoints["admissionReceiptAccepted"] = true;
        errorMessage = "";
        
        //2. fetch details
        admissionInfo = AdmissionInfo({
            courseName: courseName,
            courseDuration: courseDuration,
            sessionType: sessionType,
            appxTotalFee: appxTotalFee
        });
        
        //3. connected banks
        banks = bankList;
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Admission receipt accepted by COLLEGE";
        
    }
    
    function rejectAdmissionReceipt() public{
        require(msg.sender == college);
        require(!checkPoints["admissionReceiptAccepted"]);
        
        errorMessage = "Admission Receipt Invalid, please re-upload the correct one ...";
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Admission receipt rejected by COLLEGE, Re-upload";
    }
    
    function selectBank(uint index) public{
        require(msg.sender == student);
        require(checkPoints["admissionReceiptAccepted"]);
        require(!checkPoints["bankSelected"]);
        
        require(banks.length > 0);
        require(index < banks.length);
        bank = banks[index];
        banks = new address[](0);
        checkPoints["bankSelected"] = true;
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Bank is selected by STUDENT";
        
    }
    
    function enterDocumentsInfo(
        string identityInfo,
        string addressInfo,
        string financialInfo,
        string domicileInfo,
        string bankPassbook
        ) public{
        //"ADHAAR_ID", "VOTER_ID", "PAN_ID", "DOMICILE", "PASSBOOK"
        require(msg.sender == student);
        require(checkPoints["admissionReceiptAccepted"]);
        require(checkPoints["bankSelected"]);
        require(!checkPoints["documentsVarified"]);
        
        documentsInfo = DocumentsInfo({
            identityInfo: identityInfo,
            addressInfo: addressInfo,
            financialInfo: financialInfo,
            domicileInfo: domicileInfo,
            bankPassbook: bankPassbook
        });
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Documents are uploaded by STUDENT";
    }
    
    function varifyDocumentsInfo(
        string accName,
        string accNo,
        uint accBalance
        ) public{
        
        require(msg.sender == bank);
        require(checkPoints["admissionReceiptAccepted"]);
        require(checkPoints["bankSelected"]);
        require(!checkPoints["documentsVarified"]);
        
        checkPoints["documentsVarified"] = true;
        errorMessage = "";
        
        // create a loan account by bank ...
        loanAccountdetails = LoanAccountDetails({
            accName: accName,
            accBalance: accBalance,
            accNo: accNo
        });
        prev = 0;
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Documents varified by BANK";
    }
    
    function rejectDocumentsInfo() public{
        
        require(msg.sender == bank);
        require(checkPoints["admissionReceiptAccepted"]);
        require(checkPoints["bankSelected"]);
        require(!checkPoints["documentsVarified"]);
        
        errorMessage = "Documents uploaded by you are not varified, please re-upload or contact with respective bank-branch ...";
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Documents rejected by BANK, Re-uploaded";
    }
    
    function applyForSessionFee(uint session) public{
        
        require(msg.sender == student);
        require(session == prev+1);
        require(checkPoints["admissionReceiptAccepted"]);
        require(checkPoints["bankSelected"]);
        require(checkPoints["documentsVarified"]);
        require(!checkPoints["sessionProcessing"]);
        
        checkPoints["sessionProcessing"] = true;
        
        SessionFeeDetail memory detail = SessionFeeDetail({
            fromAcc: "",
            toAcc: "",
            session: session,
            amount: 0
        });
        
        feeDetails.push(detail);
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Apply for the session by STUDENT";
    }
    
    function enterSessionFeeAmount(uint amount, string acc) public{
        
        require(msg.sender == college);
        require(feeDetails.length == prev+1);
        require(checkPoints["admissionReceiptAccepted"]);
        require(checkPoints["bankSelected"]);
        require(checkPoints["documentsVarified"]);
        require(checkPoints["sessionProcessing"]);
        
        feeDetails[feeDetails.length-1].amount = amount;
        feeDetails[feeDetails.length-1].toAcc = acc;
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Session amount entered by COLLEGE";
    }
    
    function paySessionFee(string acc) public{
        
        require(msg.sender == bank);
        require(feeDetails.length == prev+1);
        require(checkPoints["admissionReceiptAccepted"]);
        require(checkPoints["bankSelected"]);
        require(checkPoints["documentsVarified"]);
        require(checkPoints["sessionProcessing"]);
        
        feeDetails[feeDetails.length-1].fromAcc = acc;
        loanAccountdetails.accBalance += feeDetails[feeDetails.length-1].amount;
        prev = prev + 1;
        checkPoints["sessionProcessing"] = false;
        
        statusStack.push(now);
        history[statusStack[statusStack.length-1]] = "Session fee is sectioned by BANK";
        
    }
    
    function getStatusStack() public view returns (uint[]){
        return statusStack;
    }
    
    function getFeeDetails() public view returns (SessionFeeDetail[]){
        return feeDetails;
    }
}