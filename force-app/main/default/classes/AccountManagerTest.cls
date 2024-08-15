@isTest
private class AccountManagerTest {
    @isTest static void testGetContact(){
        Id recordId = createTestRecord();
        RestRequest request = new RestRequest();
        request.requestUri =
            'https://cunning-bear-qlvpom-dev-ed.trailblaze.my.salesforce.com/services/apexrest/Accounts/'
            + recordId + '/contacts';
        request.httpMethod = 'GET';
        RestContext.request = request;
        Account response = AccountManager.getAccount();
        Assert.isTrue(response != null);
    }
    
    private static Id createTestRecord(){
        Account account = new Account();
        account.Name = 'Krishan-Test account';
        insert account;
        Id id = account.Id;
        List<Contact> contactToAdd = new List<Contact>();
        Contact contactPhone = new Contact(LastName = 'Krishan Phone');
        contactPhone.AccountId = id;
        contactToAdd.add(contactPhone);
        Contact contact = new Contact(LastName = 'Krishan');
        contact.AccountId = id;
        contactToAdd.add(contact);
        insert contactToAdd;
        return id;
    }
}