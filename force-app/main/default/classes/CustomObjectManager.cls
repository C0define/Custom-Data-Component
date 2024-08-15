public with sharing class CustomObjectManager {

    @AuraEnabled(cacheable = true)
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

    @AuraEnabled(cacheable = true)
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
                Id recordId = customObject.get('Id');
                SObject sObj = Schema.getGlobalDescribe().get(objectName).newSObject(recordId);

                System.debug('Field: ' + customObject.get('field'));
                System.debug('Value: ' + customObject.get('value'));
                for (String fieldName : customObject.keySet()) {
                    if (fieldName != 'Id') {
                        sObj.put(fieldName, customObject.get(fieldName));
                    }
                    System.debug('Field: ' + fieldName + ', Value: ' + customObject.get(fieldName));
                }
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

    @AuraEnabled(cacheable=true)
    public static Boolean isParentChild(String parentObjectName, String childObjectName) {
        return ObjectRelationshipHelper.isParentChild(parentObjectName, childObjectName);
    }

    @AuraEnabled(cacheable=true)
    public static Boolean doesFieldExist(String objectName, List<String> fieldNames){
        try {
            System.debug(objectName + ' ' + fieldNames);
            return ObjectRelationshipHelper.doesFieldExist(objectName, fieldNames);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}