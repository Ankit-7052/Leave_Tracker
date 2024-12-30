import { LightningElement, wire } from 'lwc';
import getLeaveRequests from '@salesforce/apex/LeaveRequstController.getLeaveRequests';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id'; 
import { refreshApex } from '@salesforce/apex';

const COLUMNS = [
    { label: 'Request Id', fieldName: 'Name', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'From Date', fieldName: 'From_Date__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'To Date', fieldName: 'To_Date__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Reason', fieldName: 'Reason__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Status', fieldName: 'Status__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    { label: 'Manager Comment', fieldName: 'Manager_Comment__c', cellAttributes: { class: { fieldName: 'cellClass' } } },
    {
        type: 'button',
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

export default class LeaveRequest extends LightningElement {
    columns = COLUMNS;
    leavesRequest = [];
    leavesRequestWireResult;
    showModalPopup = false;
    objectApiName = 'LeaveRequest__c';
    recordId = '';
    currentUserId = Id;

    @wire(getLeaveRequests)
    wiredLeavesRequests(result) {
        this.leavesRequestWireResult = result;
        if (result.data) {
            this.leavesRequest = result.data.map(request => ({
                ...request,
                cellClass: request.Status__c === 'Approved' ? 'slds-theme_success' : request.Status__c === 'Rejected' ? 'slds-theme_warning' : '',
                isEditDisabled: request.Status__c !== 'Pending'
            }));
        } else if (result.error) {
            this.showToast('Error fetching leaves', 'Error', 'error');
            console.error(result.error);
        }
    }

    get noRecordsFound() {
        return this.leavesRequest.length === 0;
    }

    newRequestHandler() {
        this.showModalPopup = true;
        this.recordId = '';
    }

    popupCloseHandler() {
        this.showModalPopup = false;
    }

    rowActionHandler(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        if (action.name === 'Edit') {
            this.showModalPopup = true;
            this.recordId = row.Id;
        }
    }

    successHandler() {
        this.showModalPopup = false;
        this.showToast('Record saved successfully', 'Success', 'success');
        refreshApex(this.leavesRequestWireResult);
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
