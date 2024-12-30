import { LightningElement, wire } from 'lwc';
import getMyLeaves from '@salesforce/apex/LeaveRequstController.getMyLeaves';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id'; 
import { refreshApex } from '@salesforce/apex';
const COLUMNS = [
    { label: 'Request Id', fieldName: 'Name', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'From Date', fieldName: 'From_Date__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'To Date', fieldName: 'To_Date__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Reason', fieldName: 'Reason__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Status', fieldName: 'Status__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Manager comment', fieldName: 'Manager_Comment__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    {
        type: "button",
        typeAttributes: {
            label: 'Edit',
            name: 'Edit',
            title: 'Edit',
            value: 'edit',
            disabled: { fieldName: 'isEditDisabled' }
        },
        cellAttributes: { class: { fieldName: 'cellClass' } }
    }
];

export default class MyLeaves extends LightningElement {
    columns = COLUMNS;
    MyLeaves = [];
    MyLeavesWireResult;
    showModalPopup = false; // Controls modal visibility
    objectApiName = 'LeaveRequest__c'; // API Name of your object
    recordId = ''; // Holds the record Id for editing
    currentUserId=Id;
    @wire(getMyLeaves)
    wiredMyLeaves(result) {
        this.MyLeavesWireResult = result;
        if (result.data) {
            this.MyLeaves = result.data.map(a => ({
                ...a,
                cellClass: a.Status__c === 'Approved' ? 'slds-theme_success' : a.Status__c === 'Rejected' ? 'slds-theme_warning' : '',
                isEditDisabled: a.Status__c !== 'Pending'
            }));
        } else if (result.error) {
            this.showToast('Error fetching leaves', 'Error', 'error');
            console.error(result.error);
        }
    }

    get noRecordsFound() {
        return this.MyLeaves.length === 0;
    }

    newRequestHandler() {
        this.showModalPopup = true;
        this.recordId = ''; // Clear recordId for new record creation
    }

    popupCloseHandler() {
        this.showModalPopup = false;
    }

    rowActionHandler(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        if (action.name === 'Edit') {
            this.showModalPopup = true;
            this.recordId = row.Id; // Set recordId for editing
        }
    }

    successHandler() {
        this.showModalPopup = false;
        this.showToast('Record saved successfully', 'Success', 'success');
        return refreshApex(this.MyLeavesWireResult); // Refresh the data table
    }

    submitHandler(event) {
        event.preventDefault();
        const fields = { ...event.detail.fields };
        fields.Status__c = 'Pending';
        if (new Date(fields.From_Date__c) > new Date(fields.To_Date__c)) {
            this.showToast('From date should not be grater then to date', 'Error', 'error');
        }
        else if (new Date() > new Date(fields.From_Date__c)) {
            this.showToast('From date should not be less then Today', 'Error', 'error');
        }
        else {
            this.refs.leaveReqeustFrom.submit(fields);
        }
    }
    showToast(message, title = 'Success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}
