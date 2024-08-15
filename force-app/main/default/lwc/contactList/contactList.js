import { LightningElement, api, wire } from 'lwc';
//import { getContacts ,getContactById} from '@salesforce/apex/ContactController';
import CONTACT_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import {
    getRecord
    ,getFieldValue
} from 'lightning/uiRecordApi';

export default class ContactList extends LightningElement {

    @api recordId;

    @wire(getRecord, {recordId: "$recordId", fields: [CONTACT_NAME_FIELD]})
    contact;

    get name() {
        return getFieldValue(this.contact.data, CONTACT_NAME_FIELD);
    }
}