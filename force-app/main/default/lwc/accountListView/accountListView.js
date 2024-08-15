import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountManager.getAccounts';

const actions = [
    { label: 'Show contact', name: 'load_contacts' },
    { label: 'Delete', name: 'delete' },
];

const columns = [
    //Name, AccountNumber, Site, LastModifiedById, Rating, Type
        { label: 'Name', fieldName: 'Name' },
        { label: 'AccountNumber', fieldName: 'AccountNumber' },
        { label: 'Site', fieldName: 'Site', type: 'url' },
        { label: 'Rating', fieldName: 'Rating' },
        { label: 'Type', fieldName: 'Type' },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        },
    ];

export default class AccountListView extends LightningElement {
    @track isContactLoaded;
    @track isAccountLoaded;
    @track accounts;
    @track searchKey = '';
    @track accountId;

    data = [];
    columns = columns;

    @wire(getAccounts, { searchKey: "$searchKey" })
    wiredAccounts({error, data}) {
        if (data) {
            this.accounts = data;
            this.data = data;
            this.isAccountLoaded = true;
            console.log("got the data");
            console.log(data);
        }
        else if (error) {
            this.accounts = [];
            console.log("error occured while getting the data");
            console.log(error);
        }
    }

    handleChange(event) {
        this.searchKey = event.target.value;
    }

    loadContacts(row) {
        this.accountId = row.Id;
        this.isContactLoaded = true;
    }

    handleClose() {
        this.isContactLoaded = false;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                this.deleteRow(row);
                break;
            case 'load_contacts':
                this.loadContacts(row);
                break;
            default:
        }
    }
}