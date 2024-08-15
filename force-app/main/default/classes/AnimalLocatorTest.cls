@isTest
public class AnimalLocatorTest {
    @isTest static void getAnimalLocatorTest(){
        Test.setMock(HttpCalloutMock.class, new AnimalLocatorMock());
        string response = AnimalLocator.getAnimalNameById(1);
        Assert.isTrue(response == 'chicken');
    }
}