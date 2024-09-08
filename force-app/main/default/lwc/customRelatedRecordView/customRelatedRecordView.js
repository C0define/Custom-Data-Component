import { api, LightningElement, track, wire } from 'lwc';
import queryCustomChildObjectByParentId from '@salesforce/apex/CustomObjectManager.queryCustomChildObjectByParentId';
import updateCustomObject from '@salesforce/apex/CustomObjectManager.updateCustomObject';
import deleteCustomObject from '@salesforce/apex/CustomObjectManager.deleteCustomObject';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";


const actions = [
    { label: 'Save', name: 'save' },
];
export default class CustomRelatedRecordView extends NavigationMixin(LightningElement) {
    @api parentId;
    @api objectApiName;
    @api parentObjectApiName;
    @api showDetails;
    @api showDelete;
    @api
    get showSave() {
        return this._showSave;
    }
    set showSave(value) {
        this._showSave = value;
        //if (value) this.columns.push(this._action);
    }
    @api
    get columnsJson() {
        return this._columnsJson;
    }
    set columnsJson(value) {
        this._columnsJson = value;
        this.initializeColumns();
    }

    @track data = [];

    columns;
    fieldNameArray;
    draftValues = new Map();
    _showSave;
    _showDetails;
    _showDelete;
    _columnsJson;
    get _action() {
        const actions = [];

        if (this.showSave) {
            actions.push({ label: 'Save', name: 'save' });
        }
        if (this.showDetails) {
            actions.push({ label: 'Show details', name: 'show_details' });
        }
        if (this.showDelete) {
            actions.push({ label: 'Delete', name: 'delete' });
        }
        
        return {
            type: 'action',
            typeAttributes: { rowActions: actions },
        };
    }

    get formHeading() {
        return `${this.objectName} Edit Form`
    }

    get objectName() {
        return this.objectApiName.replace('__c', '').replace('_', ' ');
    }

    get shouldShowTable() {
        return this.data != null && this.data.length > 0;
    }

    connectedCallback() {
        this.initializeColumns();
        queryCustomChildObjectByParentId({ childObject : this.objectApiName , parentObject : this.parentObjectApiName, parentId : this.parentId , columns : this.fieldNameArray})
            .then((response) => {
                this.data = response;
                console.log("got the response");
                console.log(response);
            })
            .catch((error) => {
                this.data = [];
                console.log("error occures while getting the data " + this.parentId);
                console.log(error.body);
            });
    }

    initializeColumns() {
        try {
            this.fieldNameArray = this._columnsJson.split(',')
            this.columns = this.fieldNameArray.map(column => { return { 'label': column.replace('__c', '').replace(' ', ' '), 'fieldName': column, 'editable': this.showSave } });
            this.columns.push(this._action);
            if (!Array.isArray(this.columns) || !this.columns.every(col => typeof col === 'object')) {
                throw new Error('Invalid format: columnsJson must be a JSON array of objects.');
            }
        } catch (error) {
            console.error('Invalid JSON format:', error);
            this.columns = [];
        }
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
                this.viewDetials(row.Id);
            default:
        }
    }

    updateRow(rowId) {
        if (this.draftValues.has(rowId)) {
            const updatedObjects = this.draftValues.get(rowId);
            updateCustomObject({ customObjects : [updatedObjects], objectName : this.objectApiName })
                .then(result => {
                    this.draftValues.delete(rowId);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: `All ${this.objectName} updated`, //correct
                            variant: 'success'
                        })
                    );
                    this.removeCellHighlight([updatedObjects]);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: `Error updating ${this.objectName} - ${error.message}`,
                            variant: 'error'
                        })
                    );
                });
        }
    }

    deleteRow(row) {
        const rowIdToDelete = row.Id;
        deleteCustomObject({ objectName : this.objectApiName, objectId: rowIdToDelete })
            .then(result => {
                this.data = this.data.filter(currentRow => currentRow.Id !== rowIdToDelete);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `${this.objectName} deleted ` + result.Name,
                        variant: 'success'
                    })
                );
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: `Error deleting ${this.objectName} - ${error.message}`,
                        variant: 'error'
                    })
                )
            });
    }

    viewDetials(recordId) {
        // Example: Navigate to a record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId, // Record Id you want to navigate to
                objectApiName: this.objectApiName, // Object API Name
                actionName: 'view' // Action (view, edit, etc.)
            }
        });
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
        this.dispatchEvent(new CustomEvent("close"));
    }
    
    removeCellHighlight(updatedObjects) {
        updatedObjects.forEach(object => {
            const id = object['Id'];
            const rowIndex = this.data.findIndex(row => row.Id === id);
            if (rowIndex !== -1) {
                // Update the row with the new values
                Object.keys(object).forEach(field => {
                    if (field !== 'Id') {
                        this.data[rowIndex][field] = object[field];
                    }
                });
            }
        });
        this.clearCellChange();
    }

    clearCellChange() {
        this.template.querySelector("lightning-datatable").draftValues = [];
    }
}