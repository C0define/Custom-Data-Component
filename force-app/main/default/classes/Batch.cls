global class Batch implements Schedulable{
    global void execute(SchedulableContext sc) {
        BatchExample conInstance = new BatchExample();
        database.executebatch(conInstance,100);
    }
}