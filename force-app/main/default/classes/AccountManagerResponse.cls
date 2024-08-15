global class AccountManagerResponse {
    global Id id;
    global string name;
    global List<Contact> contacts;
    
    global AccountManagerResponse(Id id, string name, List<Contact> contacts){
        this.id = id;
        this.name = name;
        this.contacts = contacts;
    }
}