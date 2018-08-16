import assert from 'assert';
import {SyncQueue} from './SyncQueue';
import {Abortable} from './Abortable';
import {SyncProgressListener} from './SyncProgressListener';


describe('SyncQueueTest', function() {

    let abortable: Abortable = {
        aborted: false
    };

    let syncProgressListener: SyncProgressListener = syncProgress => {
        console.log(syncProgress);
    };

    let syncQueue = new SyncQueue(abortable, syncProgressListener);

    it("basic test", async function () {

        let results: number[] = [];

        syncQueue.add(async() => {
            results.push(0);
        });

        await syncQueue.execute();

        assert.deepEqual(results, [0]);

    });


    it("with one level of generators", async function () {

        let results: number[] = [];

        syncQueue.add(async() => {
            results.push(0);

            syncQueue.add(async() => {
                results.push(1);
            });

        });

        await syncQueue.execute();

        assert.deepEqual(results, [0, 1]);

    });


});