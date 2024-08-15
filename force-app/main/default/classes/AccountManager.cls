public with sharing class AccountManager {
    @AuraEnabled(cacheable = true)
    public static List<Account> getAccounts(String searchKey){
        try {
            String searchKeyPattern = '%' + searchKey + '%';
            system.debug('foundkeyPattern : '+searchKeyPattern);
            return [
                SELECT Id, Name, AccountNumber, Site, LastModifiedById, Rating, Type
                FROM Account
                WHERE Name LIKE :searchKeyPattern LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Account deleteAccount(string accountId){
        try {
            Account accountToDelete = [SELECT id, name FROM Account WHERE id = :accountId];
            delete accountToDelete;
            return accountToDelete;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static boolean updateAccount(List<Account> accounts){
        try {
            upsert accounts;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}