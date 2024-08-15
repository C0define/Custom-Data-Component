import { api, LightningElement, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RecordEditForm extends LightningElement {
    @api objectApiName;
    @api recordId;

    @track showSave = false;

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