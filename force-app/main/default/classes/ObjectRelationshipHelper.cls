public with sharing class ObjectRelationshipHelper {
    public static Boolean isParentChild(String parentObjectName, String childObjectName) {
        System.debug(parentObjectName);
        System.debug(childObjectName);
        
        // Describe the parent object
        Schema.SObjectType parentType = Schema.getGlobalDescribe().get(parentObjectName);
        if (parentType == null) {
            return false;
        }

        // Get child relationships for the parent object
        Schema.DescribeSObjectResult parentDescribe = parentType.getDescribe();
        List<Schema.ChildRelationship> childRelationships = parentDescribe.getChildRelationships();

        // Loop through the child relationships to check if the child object is related
        for (Schema.ChildRelationship relationship : childRelationships) {
            if (relationship.getChildSObject().getDescribe().getName().equalsIgnoreCase(childObjectName)) {
                return true; // The objects have a parent-child relationship
            }
        }

        return false; // No parent-child relationship found
    }

    public static Boolean doesFieldExist(String objectName, List<String> fieldNames) {
        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        if (sObjectType == null) {
            return false;
        }
        
        Schema.DescribeSObjectResult describeResult = sObjectType.getDescribe();
        Map<String, Schema.SObjectField> fields = describeResult.fields.getMap();
        Boolean isValidFields = true;
        for (String fieldName : fieldNames) {
            isValidFields = isValidFields && fields.containsKey(fieldName);
        }
        return isValidFields;
    }
}
