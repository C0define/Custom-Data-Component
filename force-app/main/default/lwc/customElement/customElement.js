import { api, LightningElement, track, wire } from 'lwc';
import queryCustomObject from '@salesforce/apex/CustomObjectManager.queryCustomObject';
import deleteCustomObject from '@salesforce/apex/CustomObjectManager.deleteCustomObject';
import updateCustomObject from '@salesforce/apex/CustomObjectManager.updateCustomObject';
import isParentChild from '@salesforce/apex/CustomObjectManager.isParentChild';
import doesFieldExist from '@salesforce/apex/CustomObjectManager.doesFieldExist';
import getObjectFieldMetadata from '@salesforce/apex/CustomObjectManager.getObjectFieldMetadata';
import { NavigationMixin } from "lightning/navigation";

import NAME from '@salesforce/schema/Account.Name'

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomElement extends NavigationMixin(LightningElement) {
    @track searchKey = '';
    @track isRecordEditFormOpen = false;
    @track recordId;
    @track data = [];
    @track isRelatedListViewOpen = false;
    @track parentId;
    @track columns = [];
    @track loading = false;
    
    fieldNameArray = [];
    offset = 0;
    limit = 50;
    draftValues = new Map();
    nameField = NAME;
    initialized = false;
    selectedRows = [];
    get cardTitle() {
        return `${this.ObjectName} List View`;
    }

    get inputLable() {
        return `Search ${this.ObjectName} by name`;
    }
    get shouldRender() {
        return this.data && this.data.length > 0;
    }

    get ObjectName() {
        return this.objectApiName.replace('__c', '').replace('_', ' ');
    }

    _labels = '';
    _fieldNames = '';
    _types = '';
    _objectApiName = '';
    _childObjectApiName = '';

    get _action() {
        const actions = [];

        if (this.showSave) {
            actions.push({ label: 'Save', name: 'save' });
        }
        if (this.showEditForm) {
            actions.push({ label: 'Edit', name: 'show_edit_form' });
        }
        if (this.showDetails) {
            actions.push({ label: 'Show details', name: 'show_details' });
        }
        if (this.showChild) {
            actions.push({ label: 'Show child', name: 'show_child' });
        }
        if (this.showDelete) {
            actions.push({ label: 'Delete', name: 'delete' });
        }
        
        return {
            type: 'action',
            typeAttributes: { rowActions: actions },
        };
    }

    @api childColumnJson;
    @api showDelete;
    @api showSave;
    @api showEditForm;
    @api showDetails;
    @api showChild;
    @api showSearch;
    @api
    get columnsJson() {
        return this._columnsJson;
    }
    set columnsJson(value) {
        this._columnsJson = value;
        this.initializeColumns();
    }
    @api
    get objectApiName() {
        return this._objectApiName;
    }
    set objectApiName(value) {
        this._objectApiName = value;
        this.checkParentChildRelation();
    }
    @api
    get childObjectApiName() {
        return this._childObjectApiName;
    }
    set childObjectApiName(value) {
        this._childObjectApiName = value;
        this.checkParentChildRelation();
    }

    connectedCallback() {
        this.initializeColumns();
        this.checkFieldExist();
        this.loadCustomData();
    }

    initializeColumns() {
        try {
            this.fieldNameArray = this._columnsJson.split(',').map(column => { return column.trim() });
            // this.columns = this.fieldNameArray.map(column => { return { 'label': column.replace('__c', '').replace('_',' '), 'fieldName': column, 'editable': true } });
            // Validate that the parsed JSON is an array of objects
            if (!Array.isArray(this.columns) || !this.columns.every(col => typeof col === 'object')) {
                throw new Error('Invalid format: columnsJson must be a JSON array of objects.');
            }
        } catch (error) {
            console.error('Invalid JSON format:', error);
            this.showErrorMessage('Invalid JSON format for columns.');
            this.columns = [];
        }
    }

    checkParentChildRelation() {
        if (this.objectApiName != '' && this.childObjectApiName != '') {
            isParentChild({ parentObjectName: this.objectApiName, childObjectName: this.childObjectApiName })
            .then(result => {
                if (!result) {
                    this.showErrorMessage('Invalid parent child object. Parent and child are not related');
                }
            }).catch(error => {
                console.error('error while fetching', error.body.message);
            })
        }
    }

    showErrorMessage(message) {
        const event = new ShowToastEvent({
            title: 'Error',
            message: message,
            variant: 'error',
        });
        this.dispatchEvent(event);
    }

    checkFieldExist() {
        doesFieldExist({ objectName: this.objectApiName, fieldNames: this.fieldNameArray })
            .then(result => {
                if (!result) {
                    this.showErrorMessage('Invalid field name. Please check the field name.');
                    throw Error('Invalid field name. Please check the field name.');
                }
            }).catch(error => {
                console.error('error while fetching', error.body.message);
            })
        getObjectFieldMetadata({ objectName: this._objectApiName })
                .then(result => {
                    this.columns = result.filter(field => this.fieldNameArray.includes(field.fieldName));
                    this.columns = this.columns.map(col => {
                        return { ...col, editable: this.showSave };
                    });
                    this.columns.push(this._action);
                    console.log(this.columns);
                }).catch(error => {
                    console.error('error while fetching', error.body.message);
                });
    }

    loadCustomData() {
        this.loading = true;
        queryCustomObject({ objectName: this.objectApiName, columns: this.fieldNameArray, searchKey: this.searchKey, offset: this.offset, limitSize: this.limit })
            .then(result => {
                this.loading = false;
                if (result.length > 0) {
                    this.data = [...this.data, ...result];
                    this.offset += this.limit;
                }
                else {
                    this.allLoaded = true;
                    this.totalRecords = this.data.length;
                }
            })
            .catch(error => {
                this.loading = false;
                console.error('error while fetching', error.body.message);
            })
    }

    handleScroll(event) {
        console.log("line end");
        if (this.isLoading || this.allLoaded) return;

        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            this.loadCustomData();
        }
    }

    handleRowAction(event) {
        // fields = [];
        getObjectFieldMetadata({ objectName: this._objectApiName })
            .then(result => {
                // fields = result;
                console.log(result);
                console.log(result.data);
            }).catch(error => {
                console.error('error while fetching', error.body.message);
            });
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        console.log("action received");
        console.log(event.detail);
        switch (actionName) {
            case 'save':
                this.updateRows([this.draftValues.get(row.Id)]);
                break;
            case 'delete':
                this.deleteRow(row);
                break;
            case 'show_edit_form':
                this.showRowDetails(row);
                break;
            case 'show_details':
                this.viewDetials(row.Id);
            case 'show_child':
                this.showChildRows(row);
                break;
            default:
        }
    }

    updateRows(updatedObjects) {
        var resultToReturn = false;
        updateCustomObject({ customObjects : updatedObjects, objectName : this.objectApiName })
            .then(result => {
                resultToReturn = result;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'All ' + this.ObjectName + ' updated',
                        variant: 'success'
                    })
                );
                this.removeCellHighlight(updatedObjects);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error updating ' + this.ObjectName + error.body.message,
                        variant: 'error'
                    })
                );
            });
        
        //this.removeCellHighlight();
        return resultToReturn;
    }

    deleteRow(row) {
        const rowIdToDelete = row.Id;
        deleteCustomObject({ objectName : this.objectApiName, objectId: rowIdToDelete })
            .then(result => {
                this.data = this.data.filter(currentRow => currentRow.Id !== rowIdToDelete);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `${this.ObjectName} deleted `,
                        variant: 'success'
                    })
                );
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: `Error deleting ${this.ObjectName}` + error.body.message,
                        variant: 'error'
                    })
                )
            });
    }

    handleSaveAll() {
        const updatedObjects = [];
        if (this.draftValues == null || this.draftValues.size <= 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'No records to update',
                    variant: 'error'
                }))
            return;
        }
        this.draftValues.forEach((value, key) => {
            updatedObjects.push(value);
            console.log(updatedObjects);
        });
        this.updateRows(updatedObjects);
    }

    handleSaveSelected() {
        // save all elements from draftValues
        if (this.selectedRows == null || this.selectedRows.length == 0) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'No records selected',
                    variant: 'error'
                }))
            
            return;
        }
        this.draftValues.forEach(rowId => {
            this.selectedRows.forEach(row => {
                if (rowId == row.Id) {
                    this.updateRow(rowId);
                }
            })
        })
    }

    handleChange(event) {
        this.searchKey = event.target.value;
        if (this.searchKey == '') {
            this.offset = 0;
            this.allLoaded = false;
            this.data = [];
            this.loadCustomData();
            return;
        }
        queryCustomObject({ objectName: this.objectApiName, columns: this.fieldNameArray, searchKey: this.searchKey, offset: 0, limitSize: this.limit })
            .then(result => {
                this.loading = false;
                this.data = result;
                this.totalRecords = this.data.length + 1;
            })
            .catch(error => {
                this.loading = false;
                console.error('error while fetching', error.body.message);
            })
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
            if (field != 'id' && this.validateCellChange(field, draft[field])) {
                updatedField[field] = draft[field];
            }
            this.draftValues.set(rowId, updatedField);
        });
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

    handleClose() {
        this.isRecordEditFormOpen = false;
        this.searchKey = "";
    }

    handleCloseChildListView() {
        this.isRelatedListViewOpen = false;
    }

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
    }
    
    showRowDetails(row) {
        this.isRecordEditFormOpen = true;
        this.recordId = row.Id;
    }

    showChildRows(row) {
        this.parentId = row.Id;
        this.isRelatedListViewOpen = true;
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

    validateCellChange(field, value) {
        if (this.columns.filter(column => column.type == 'PICKLIST').map(column => {return column.fieldName}).includes(field)) {
            const something = this.columns.filter(column => column.fieldName == field);
            console.log(this.columns.filter(column => column.fieldName == field)[0].picklistValues.includes(value));
            if (!this.columns.filter(column => column.fieldName == field)[0].picklistValues.includes(value)) {
                // allowedValues = this.columns.filter(column => column.fieldName == field)[0].picklistValues.map(value => { return value.value });
                this.showErrorMessage(`Invalid value. Please check the Allowed values.`);
                return false;
            }
        }

        return true;
    }
}