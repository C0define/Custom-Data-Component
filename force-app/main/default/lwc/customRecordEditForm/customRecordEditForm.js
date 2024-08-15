import { api, LightningElement, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomRecordEditForm extends LightningElement {
    @api objectApiName;
    @api columns;
    @api recordId;

    @track showSave = false;

    get formHeading() {
        return `${this.objectApiName.replace('__c', '')} Form`;
    }

    showSuccessMessage(event) {
        const evt = new ShowToastEvent({
            title: "Success",
            message: "Record updated successfully",
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.handleClose();
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    showSaveButton() {
        this.showSave = true;
    }
}