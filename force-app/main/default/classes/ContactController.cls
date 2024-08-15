public with sharing class ContactController {
    public ContactController() {
    }

    @AuraEnabled
    public static List<Contact> getContacts(){
        try {
            return [SELECT Id, Name FROM Contact];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Contact getContactById(string id){
        try {
            return [SELECT id, Name FROM Contact WHERE Id = :id];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}