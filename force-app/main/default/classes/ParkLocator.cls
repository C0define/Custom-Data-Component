public class ParkLocator {
    public static string[] country(string countryName){
        ParkService.ParksImplPort parkService = new ParkService.ParksImplPort();
        return parkService.byCountry(countryName);
    }
}