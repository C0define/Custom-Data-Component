public with sharing class AccountTriggerHelper {
    public AccountTriggerHelper() {

    }

    public static void AddOpportunity(List<Account> accounts){
        List<Opportunity> oppList = new List<Opportunity>();
        // Get the related opportunities for the accounts in this trigger
        Map<Id,Account> acctsWithOpps = new Map<Id,Account>(
            [SELECT Id,(SELECT Id FROM Opportunities) FROM Account WHERE Id IN :accounts]);
        // Add an opportunity for each account if it doesn't already have one.
        // Iterate through each account.
        for(Account a : accounts) {
            System.debug('acctsWithOpps.get(a.Id).Opportunities.size()=' + acctsWithOpps.get(a.Id).Opportunities.size());
            // Check if the account already has a related opportunity.
            if (acctsWithOpps.get(a.Id).Opportunities.size() == 0) {
                // If it doesn't, add a default opportunity
                oppList.add(new Opportunity(Name=a.Name + ' Opportunity',
                                        StageName='Prospecting',
                                        CloseDate=System.today().addMonths(1),
                                        AccountId=a.Id));
            }
        }
        if (oppList.size() > 0) {
            insert oppList;
        }
    }

    public static void UpdateRelatedContactBillingAddressQ2(Map<Id, Account> accountMap, List<Contact> contacts){
        List<Contact> contactToUpdate = new List<Contact>();
        for(Contact contact : contacts){
            Account account = accountMap.get(contact.AccountId);
            if(account != null){
                contact.Billing_Address__CountryCode__s = account.BillingCountry;
                contactToUpdate.add(contact);
            }
        }

        update contactToUpdate;
    }

    public static void UpdateRelatedContactIndustryQ1(Map<Id, Account> accountMap, List<Contact> contacts){
        List<Contact> contactToUpdate = new List<Contact>();
        for(Contact contact : contacts){
            Account account = accountMap.get(contact.AccountId);
            if(account != null){
                contact.Last_Industry__c = account.Industry;
                contactToUpdate.add(contact);
            }
        }

        update contactToUpdate;
    }

    public static void ModifyName(List<Account> accounts){
        for(Account account : accounts){
            account.name = account.name + 'Modified';
        }
    }

    public static void UpdateShippingAddress(List<Account> accounts){
        for(Account account : accounts){
            if(account.Match_Billing_Address__c){
                account.ShippingPostalCode = account.BillingPostalCode;
            }
        }
    }
}