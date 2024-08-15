import { LightningElement, api, track } from 'lwc';
import saveContact from '@salesforce/apex/ContactManager.saveContact';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ContactForm extends LightningElement {
    @api contactId;
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track phone = '';

    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field === 'firstName') {
            this.firstName = event.target.value;
        } else if (field === 'lastName') {
            this.lastName = event.target.value;
        } else if (field === 'email') {
            this.email = event.target.value;
        } else if (field === 'phone') {
            this.phone = event.target.value;
        }
    }

    handleSave() {
        const contact = {
            Id: this.contactId,
            FirstName: this.firstName,
            LastName: this.lastName,
            Email: this.email,
            Phone: this.phone
        };
        saveContact({ contact })
            .then(result => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Contact saved',
                        variant: 'success'
                    })
                );
                this.dispatchEvent(new CustomEvent('close'));
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving contact',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}