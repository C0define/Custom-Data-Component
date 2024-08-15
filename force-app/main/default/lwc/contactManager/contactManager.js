import { LightningElement, track, wire } from 'lwc';
import getContacts from '@salesforce/apex/ContactManager.getContacts';

export default class ContactManager extends LightningElement {
    @track contacts;
    @track searchKey = '';
    @track isModalOpen = false;
    @track selectedContactId;

    @wire(getContacts, { searchKey: '$searchKey' })
    wiredContacts({ error, data }) {
        if (data) {
            this.contacts = data;
        } else if (error) {
            this.contacts = undefined;
            console.error('Error fetching contacts:', error);
        }
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.target.value;
    }

    handleNewContact() {
        this.selectedContactId = null;
        this.isModalOpen = true;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.selectedContactId = row.Id;
                this.isModalOpen = true;
                break;
            case 'delete':
                // Logic to delete the contact
                break;
            default:
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.selectedContactId = null;
    }

    get columns() {
        return [
            { label: 'First Name', fieldName: 'FirstName', type: 'text' },
            { label: 'Last Name', fieldName: 'LastName', type: 'text' },
            { label: 'Email', fieldName: 'Email', type: 'email' },
            { label: 'Phone', fieldName: 'Phone', type: 'phone' },
            {
                type: 'action',
                typeAttributes: {
                    rowActions: [
                        { label: 'Edit', name: 'edit' },
                        { label: 'Delete', name: 'delete' }
                    ]
                }
            }
        ];
    }
}