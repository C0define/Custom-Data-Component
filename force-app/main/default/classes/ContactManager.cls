public with sharing class ContactManager {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(String searchKey) {
        String searchKeyPattern = '%' + searchKey + '%';
        return [
            SELECT Id, FirstName, LastName, Email, Phone 
            FROM Contact 
            WHERE FirstName LIKE :searchKeyPattern 
            OR LastName LIKE :searchKeyPattern
        ];
    }

    @AuraEnabled
    public static Contact saveContact(Contact contact) {
        upsert contact;
        return contact;
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getRelatedContacts(String accountId){
        try {
            system.debug('Got accountid '+accountId);
            system.debug([SELECT FirstName FROM Contact WHERE AccountId = :accountId]);
            return [
                SELECT FirstName, LastName, Email, Phone
                FROM Contact
                WHERE AccountId = :accountId
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}