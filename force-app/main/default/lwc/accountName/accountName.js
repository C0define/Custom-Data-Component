import { LightningElement, api, wire } from 'lwc';
//import { getContacts ,getContactById} from '@salesforce/apex/ContactController';
import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import {
    getRecord
    ,getFieldValue
} from 'lightning/uiRecordApi';

export default class ContactList extends LightningElement {

    @api recordId;

    @wire(getRecord, {recordId: "$recordId", fields: [ACCOUNT_NAME_FIELD]})
    aacount;

    get name() {
        return "My name is krishan";//getFieldValue(this.aacount.data, ACCOUNT_NAME_FIELD);
    }
}