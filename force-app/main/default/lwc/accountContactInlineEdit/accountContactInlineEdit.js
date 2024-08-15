import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountManager.getAccounts';
import deleteAccount from '@salesforce/apex/AccountManager.deleteAccount';
import updateAccount from '@salesforce/apex/AccountManager.updateAccount';
import NAME from '@salesforce/schema/Account.Name'

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'Save', name: 'save' },
    { label: 'Show details', name: 'show_details' },
    { label: 'Show contacts', name: 'show_contacts' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    { label: 'Name', fieldName: 'Name', type:'text', editable: true },
    { label: 'Account Number', fieldName: 'AccountNumber', editable: true },
    { label: 'Site', fieldName: 'Site', type: 'url', editable: true },
    { label: 'Rating', fieldName: 'Rating', editable: true },
    { label: 'Type', fieldName: 'Type', editable: true },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class AccountContactInlineEdit extends LightningElement {
    @track searchKey = '';
    @track isRecordEditFormOpen = false;
    @track recordId;
    @track data = [];
    @track columnsToDisplay = [
        { id: 1, name: 'name' },
        { id: 2, name: 'accountNumber' }
    ];
    @track isContactListViewOpen = false;
    @track accountId;

    columns = columns;
    rowOffset = 0;
    draftValues = new Map();
    objectApiName = 'Account';
    nameField = NAME;

    @wire(getAccounts, { searchKey: "$searchKey" })
    wiredAccounts({ error, data }) {
        if (data) {
            this.data = data;
            console.log("got some data");
            console.log(this.data);
        }
        if (error) {
            console.log("got some error");
            console.log(error);
        }
    }

    get columnsDisplay() {
        return this.columnsToDisplay;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log("action received");
        console.log(event.detail);
        switch (actionName) {
            case 'save':
                this.updateRow(row.Id);
                break;
            case 'delete':
                this.deleteRow(row);
                break;
            case 'show_details':
                this.showRowDetails(row);
                break;
            case 'show_contacts':
                this.showContacts(row);
                break;
            default:
        }
    }

    updateRow(rowId) {
        // const rowId = oldrow.Id;
        if (this.draftValues.has(rowId)) {
            const updatedAccount = this.draftValues.get(rowId);
            updateAccount({ accounts : [updatedAccount] })
                .then(result => {
                    this.draftValues.delete(rowId);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'All Contacts updated',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Error updating Contact',
                            variant: 'error'
                        })
                    );
                });
        }
    }

    deleteRow(row) {
        const rowIdToDelete = row.Id;
        deleteAccount({ accountId: rowIdToDelete })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Account deleted ' + result.Name,
                        variant: 'success'
                    })
                );
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error deleting Account',
                        variant: 'error'
                    })
                )
            });
    }

    handleSaveAll() {
        // TODO
        // save all elements from draftValues
        this.draftValues.forEach(rowId => {
            this.updateRow(rowId);
        })
    }

    handleChange(event) {
        this.searchKey = event.target.value;
    }
    
    handleCellChange(event) {
        const draft = event.detail.draftValues[0];
        const rowNumber = draft.id.split("-")[1];
        const rowId = this.data[rowNumber].Id;
        console.log(rowId);
        if (!this.draftValues.has(rowId)) {
            this.draftValues.set(rowId, {'Id' : rowId})
        }
        Object.keys(draft).forEach(field => {
            console.log("in for each loop" + field);
            const updatedField = this.draftValues.get(rowId);
            if (field != 'id') {
                updatedField[field] = draft[field];
            }
            this.draftValues.set(rowId, updatedField);
        });
    }

    handleClose() {
        this.isRecordEditFormOpen = false;
        this.searchKey = "";
    }

    handleCloseContactListView() {
        this.isContactListViewOpen = false;
    }
    
    showRowDetails(row) {
        this.isRecordEditFormOpen = true;
        this.recordId = row.Id;
    }

    showContacts(row) {
        this.accountId = row.Id;
        this.isContactListViewOpen = true;
    }
}