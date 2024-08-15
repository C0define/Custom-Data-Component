public class AnimalLocator {
    public static string getAnimalNameById(Integer id){
        string result = '';
        string url = 'https://th-apex-http-callout.herokuapp.com/animals/' + id;
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndPoint(url);
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        if(response.getStatusCode() == 200){
            Map<string, Object> results = (Map<string, Object>) JSON.DeserializeUntyped(response.getBody());
            Map<string, Object> animal = (Map<string, Object>) results.get('animal');
            result = (string) animal.get('name');
        }
        return result;
    }
}