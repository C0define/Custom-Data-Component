public with sharing class ContactTriggerHandler {
    public ContactTriggerHandler() {

    }

    public static void limitContactNumber(List<Contact> newContacts){
        Set<Id> accIds = new Set<Id>();
        for (Contact conObj : newContacts) {
            if (conObj.AccountId != null) {
                accIds.add(conObj.AccountId);
            }
        }
        if (!accIds.isEmpty()) {
            Map<Id, Integer> contactCountMap = new Map<Id, Integer>();
            List<AggregateResult> aggrList = [SELECT AccountId, COUNT(Id) contactCount FROM Contact WHERE AccountId IN :accIds GROUP BY AccountId];
            if (!aggrList.isEmpty()) {
                for (AggregateResult aggr : aggrList) {
                    contactCountMap.put((Id)aggr.get('AccountId'), (Integer)aggr.get('contactCount'));
                }
            }
            if (!newContacts.isEmpty()) {
                for (Contact con : newContacts) {
                    if (con.AccountId != null && contactCountMap.containsKey(con.AccountId) && contactCountMap.get(con.AccountId) >= 2) {
                        con.addError('You cannot insert this contact as there are already 2 contacts present on this account');
                    }
                }
            }
        }
    }
}