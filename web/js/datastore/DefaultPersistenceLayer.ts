import {Datastore} from './Datastore';
import {DocMeta} from '../metadata/DocMeta';
import {DocMetas} from '../metadata/DocMetas';
import {isPresent, Preconditions} from '../Preconditions';
import {Logger} from '../logger/Logger';
import {Dictionaries} from '../util/Dictionaries';
import {DocMetaFileRef, DocMetaRef} from './DocMetaRef';
import {DeleteResult} from './DiskDatastore';
import {IPersistenceLayer} from './IPersistenceLayer';
import {ISODateTimeStrings} from '../metadata/ISODateTimeStrings';

const log = Logger.create();

/**
 * First layer before the raw datastore. At one point we allowed the datastore
 * to perform all the data manipulation / serialization but we ran into problems
 * with node+chrome behaving differently so now we just make node work with raw
 * strings.
 */
export class DefaultPersistenceLayer implements IPersistenceLayer {

    public readonly stashDir: string;

    public readonly logsDir: string;

    public readonly datastore: Datastore;

    constructor(datastore: Datastore) {
        this.datastore = datastore;
        this.stashDir = this.datastore.stashDir;
        this.logsDir = this.datastore.logsDir;
    }

    public async init() {
        await this.datastore.init();
    }

    public contains(fingerprint: string): Promise<boolean> {
        return this.datastore.contains(fingerprint);
    }

    public delete(docMetaFileRef: DocMetaFileRef): Promise<DeleteResult> {
        return this.datastore.delete(docMetaFileRef);
    }

    /**
     * Get the DocMeta object we currently in the datastore for this given
     * fingerprint or null if it does not exist.
     */
    public async getDocMeta(fingerprint: string): Promise<DocMeta | undefined> {

        const data = await this.datastore.getDocMeta(fingerprint);

        if (!isPresent(data)) {
            return undefined;
        }

        if (! (typeof data === "string")) {
            throw new Error("Expected string and received: " + typeof data);
        }

        return DocMetas.deserialize(data);
    }

    /**
     * Convenience method to not require the fingerprint.
     */
    public async syncDocMeta(docMeta: DocMeta) {
        return this.sync(docMeta.docInfo.fingerprint, docMeta);
    }

    /**
     * Write the datastore to disk.
     */
    public async sync(fingerprint: string, docMeta: DocMeta) {

        Preconditions.assertNotNull(fingerprint, "fingerprint");
        Preconditions.assertNotNull(docMeta, "docMeta");

        if (! (docMeta instanceof DocMeta)) {
            // check to make sure nothing from JS-land can call this incorrectly.
            throw new Error("Can not sync anything other than DocMeta.");
        }

        // create a copy of docMeta so we can mutate it without the risk of
        // firing event listeners via proxies and then we can update the
        // lastUpdated time.  We're also going to have to fire and advertisement
        // that it's been updated.

        docMeta = Dictionaries.copyOf(docMeta);

        // now update the lastUpdated times before we commit to disk.
        docMeta.docInfo.lastUpdated = ISODateTimeStrings.create();

        if (docMeta.docInfo.added === undefined) {
            docMeta.docInfo.added = ISODateTimeStrings.create();
        }

        log.info("Sync of docMeta with fingerprint: ", fingerprint);

        // NOTE that we always write the state with JSON pretty printing.
        // Otherwise tools like git diff , etc will be impossible to deal with
        // in practice.
        const data = DocMetas.serialize(docMeta, "  ");

        await this.datastore.sync(fingerprint, data);

    }

    public getDocMetaFiles(): Promise<DocMetaRef[]> {
        return this.datastore.getDocMetaFiles();
    }

}

