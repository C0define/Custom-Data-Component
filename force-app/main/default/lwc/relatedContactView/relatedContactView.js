import { api, LightningElement, track, wire } from 'lwc';
import getRelatedContacts from '@salesforce/apex/ContactManager.getRelatedContacts';
    
export default class RelatedContactView extends LightningElement {
    @api accountId;
    @track relatedContacts = [];
    columns = [
        //FirstName, LastName, Email, Phone
        { label: 'First Name', fieldName: 'FirstName', type: 'text' },
        { label: 'Last Name', fieldName: 'LastName', type: 'text' },
        { label: 'Email', fieldName: 'Email', type: 'email' },
        { label: 'Phone', fieldName: 'Phone', type: 'phone' }
    ]

    renderedCallback(){
        getRelatedContacts({ accountId : this.accountId })
            .then((response) => {
                this.relatedContacts = response;
                console.log("got the response");
                console.log(response);
            })
            .catch((error) => {
                this.relatedContacts = [];
                console.log("error occures while getting the data " + this.accountId);
                console.log(error.body);
            });
    }
    
    handleClose() {
        this.dispatchEvent(new CustomEvent("close"));
    }
}