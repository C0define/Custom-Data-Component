public with sharing class CustomObjectManager {

    @AuraEnabled(cacheable = false)
    public static List<SObject> queryCustomObject(String objectName, List<String> columns, String searchKey, Integer offset, Integer limitSize) {
        String query = 'SELECT ';
        for (String col : columns) {
            query += col + ', ';
        }

        query = query.removeEnd(', ');

        query += ' FROM ' + objectName ;

        if(searchKey != null && searchKey != ''){
            query += ' WHERE Name LIKE \'%' + searchKey +'%\'';
        }

        if(limitSize != null){
            query += ' LIMIT ' + limitSize + ' ';
        }

        if(offset != null){
            query += 'OFFSET ' + offset;
        }
        try {
            system.debug(query);
            return Database.query(query);
        } catch (Exception e) {
            System.debug('Error executing query: ' + e.getMessage());
            return new List<SObject>(); // Return an empty list on error
        }
    }

    @AuraEnabled(cacheable = false)
    public static List<SObject> queryCustomChildObjectByParentId(String childObject, String parentObject, String parentId, List<String> columns, Integer offset, Integer limitSize){
        String query = 'SELECT ';
        for (String col : columns) {
            query += col + ', ';
        }

        query = query.removeEnd(', ');

        system.debug(parentObject.contains('__c') ? ' ' : 'Id');
        query += ' FROM ' + childObject + ' WHERE ' + parentObject +
            (parentObject.contains('__c') ? ' ' : 'Id') +
            ' = \'' + parentId + '\'';

        if(limitSize != null){
            query += ' LIMIT ' + limitSize + ' ';
        }

        if(offset != null){
            query += 'OFFSET ' + offset + ';';
        }
        try {
            system.debug(query);
            return Database.query(query);
        } catch (Exception e) {
            System.debug('Error executing query: ' + e.getMessage());
            return new List<SObject>(); // Return an empty list on error
        }
    }

    @AuraEnabled
    public static SObject deleteCustomObject(String objectName, string objectId){
        try {
            String query = 'SELECT Id FROM ' + objectName + ' WHERE Id = \'' + objectId + '\'';
            system.debug(query);

            SObject objectToDelete = Database.query(query);
            delete objectToDelete;
            return objectToDelete;
        } catch (Exception e) {
            System.debug('Error executing query: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static boolean updateCustomObject(List<Map<string, string>> customObjects, string objectName){
        try {
            System.debug('Entered Apex Method');
            System.debug('Received Map: ' + customObjects);

            // Validate the incoming data
            if (customObjects == null || customObjects.isEmpty()) {
                throw new AuraHandledException('Received an empty or null map.');
            }

            List<SObject> sObjs = new List<SObject>();
            for(Map<String, String> customObject : customObjects)
            {
                Id recordId = (Id)customObject.get('Id');
                SObject sObj = Schema.getGlobalDescribe().get(objectName).newSObject(recordId);

                // System.debug('Field: ' + customObject.get('field'));
                // System.debug('Value: ' + customObject.get('value'));
                System.debug(customObject);
                Map<String, Schema.SObjectField> fieldMap = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap();
                for (String fieldName : customObject.keySet()) {
                    System.debug('Field: ' + fieldName);
                    if (fieldName != 'Id') {
                        Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
                        Schema.DisplayType fieldType = fieldDescribe.getType();  // Directly using DisplayType

                        Object fieldValue;
                        String value = customObject.get(fieldName);

                        if (value != null) {
                            // Convert based on field type
                            if (fieldType == Schema.DisplayType.INTEGER) {
                                fieldValue = Integer.valueOf(value);
                            } else if (fieldType == Schema.DisplayType.DOUBLE || fieldType == Schema.DisplayType.CURRENCY) {
                                fieldValue = Double.valueOf(value);
                            // } else if (fieldType == Schema.DisplayType.DECIMAL) {
                                // fieldValue = Decimal.valueOf(value);
                            } else if (fieldType == Schema.DisplayType.BOOLEAN) {
                                fieldValue = Boolean.valueOf(value);
                            } else if (fieldType == Schema.DisplayType.DATE) {
                                fieldValue = Date.valueOf(value);
                            } else if (fieldType == Schema.DisplayType.DATETIME) {
                                fieldValue = DateTime.valueOf(value);
                            } else {
                                fieldValue = value;  // Treat as String for other field types
                            }

                            sObj.put(fieldName, fieldValue);
                        }
                        // sObj.put(fieldName, customObject.get(fieldName));
                    }
                    System.debug('Field: ' + fieldName + ', Value: ' + customObject.get(fieldName));
                }
                System.debug(sObj);
                sObjs.Add(sObj);
            }

            // system.debug(sObj);
            // Perform the upsert operation
            upsert sObjs;
            System.debug('Upsert operation successful');

            return true;
        } catch (Exception e) {
            System.debug('Error in Apex Method: ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void updateDynamicObject(String objectName, String recordId, Map<String, Object> fieldValues) {
        SObject sObj = Database.query('SELECT Id FROM ' + objectName + ' WHERE Id = :recordId LIMIT 1');
        for (String fieldName : fieldValues.keySet()) {
            sObj.put(fieldName, fieldValues.get(fieldName));
        }
        update sObj;
    }

    @AuraEnabled(cacheable=false)
    public static Boolean isParentChild(String parentObjectName, String childObjectName) {
        return ObjectRelationshipHelper.isParentChild(parentObjectName, childObjectName);
    }

    @AuraEnabled(cacheable=false)
    public static Boolean doesFieldExist(String objectName, List<String> fieldNames){
        try {
            System.debug(objectName + ' ' + fieldNames);
            return ObjectRelationshipHelper.doesFieldExist(objectName, fieldNames);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled(cacheable=false)
    public static List<Map<String, Object>> getObjectFieldMetadata(String objectName) {
        List<Map<String, Object>> fieldDetails = new List<Map<String, Object>>();
        
        // Get the describe result for the object
        Schema.DescribeSObjectResult objDescribe = Schema.getGlobalDescribe().get(objectName).getDescribe();
        
        // Loop through each field in the object
        for (Schema.SObjectField field : objDescribe.fields.getMap().values()) {
            Schema.DescribeFieldResult fieldDescribe = field.getDescribe();
            Map<String, Object> fieldInfo = new Map<String, Object>();
            
            fieldInfo.put('label', fieldDescribe.getLabel());
            fieldInfo.put('fieldName', fieldDescribe.getName());
            fieldInfo.put('type', fieldDescribe.getType().name());
            
            // Check if the field is a picklist and get the picklist values
            if (fieldDescribe.getType() == Schema.DisplayType.Picklist) {
                List<String> picklistValues = new List<String>();
                for (Schema.PicklistEntry picklistEntry : fieldDescribe.getPicklistValues()) {
                    picklistValues.add(picklistEntry.getLabel());
                }
                fieldInfo.put('picklistValues', picklistValues);
            }
            
            fieldDetails.add(fieldInfo);
        }
        system.debug(fieldDetails);
        return fieldDetails;
    }
}