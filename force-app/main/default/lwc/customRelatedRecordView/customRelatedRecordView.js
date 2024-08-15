import { api, LightningElement, track, wire } from 'lwc';
import queryCustomChildObjectByParentId from '@salesforce/apex/CustomObjectManager.queryCustomChildObjectByParentId';
import updateCustomObject from '@salesforce/apex/CustomObjectManager.updateCustomObject';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const actions = [
    { label: 'Save', name: 'save' },
];
export default class CustomRelatedRecordView extends LightningElement {
    @api parentId;
    @api objectApiName;
    @api parentObjectApiName
    @api
    get columnsJson() {
        return this._columnsJson;
    }
    set columnsJson(value) {
        this._columnsJson = value;
        this.initializeColumns();
    }

    @track relatedCustomChildData = [];

    columns;
    fieldNameArray;
    draftValues = new Map();
    _columnsJson;
    _action = {
        type: 'action',
        typeAttributes: { rowActions: actions },
    };

    get formHeading() {
        return `${this.objectName} Edit Form`
    }

    get objectName() {
        return this.objectApiName.replace('__c', '').replace('_', ' ');
    }

    get shouldShowTable() {
        return this.relatedCustomChildData != null && this.relatedCustomChildData.length > 0;
    }

    renderedCallback(){
        queryCustomChildObjectByParentId({ childObject : this.objectApiName , parentObject : this.parentObjectApiName, parentId : this.parentId , columns : this.fieldNameArray})
            .then((response) => {
                this.relatedCustomChildData = response;
                console.log("got the response");
                console.log(response);
            })
            .catch((error) => {
                this.relatedCustomChildData = [];
                console.log("error occures while getting the data " + this.parentId);
                console.log(error.body);
            });
    }

    initializeColumns() {
        try {
            this.fieldNameArray = this._columnsJson.split(',')
            this.columns = this.fieldNameArray.map(column => { return { 'label': column.replace('__c', '').replace(' ',' '), 'fieldName': column, 'editable': true } });
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

    handleCellChange(event) {
        const draft = event.detail.draftValues[0];
        const rowNumber = draft.id.split("-")[1];
        const rowId = this.relatedCustomChildData[rowNumber].Id;
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
}