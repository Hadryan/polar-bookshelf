import {assert} from 'chai';
import {Spectron} from '../../js/test/Spectron';
import {SpectronSpec} from '../../js/test/SpectronSpec';
import {FilePaths} from '../../js/util/FilePaths';
import {Files} from '../../js/util/Files';
import {PolarDataDir} from '../../js/test/PolarDataDir';
import {Directories} from '../../js/datastore/Directories';

PolarDataDir.useFreshDirectory('.polar-persistent-error-logger');

describe('persistent-error-logger', async function() {

    Spectron.setup(__dirname);
    this.timeout(10000);

    it('test writing errors', async function() {

        const directories = new Directories();
        await directories.init();

        assert.ok(await Files.existsAsync(directories.logsDir));

        await SpectronSpec.create(this.app).waitFor(true);

        // now make sure the data is in our file now that the app says they were
        // written

        // ok... readFileAsync doesn't seem to throw an error if the file does not exist...

        const data = await Files.readFileAsync(FilePaths.create(directories.logsDir, 'error.log'));

        assert.ok(data.indexOf('This is from the main process:') !== -1);
        assert.ok(data.indexOf('Fake error in main process') !== -1);
        assert.ok(data.indexOf('This is from the renderer process:') !== -1);
        assert.ok(data.indexOf('Fake error in the renderer process') !== -1);

    });

});
