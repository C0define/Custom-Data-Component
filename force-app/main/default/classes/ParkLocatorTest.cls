@isTest
public class ParkLocatorTest {
    @isTest static void testCountryCallout(){
        Test.setMock(WebServiceMock.class, new ParkServiceMock());
        string[] parks = ParkLocator.country('India');
        system.debug(parks);
        Assert.areEqual(new string[]{'Anamudi Shola National Park', 'Anshi National Park', 'Bandipur National Park'}, parks);
    }
}