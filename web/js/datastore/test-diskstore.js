const fs = require('fs');
const assert = require('assert');
const diskstore = require("./diskstore");
const metadata = require("../metadata");

// FIXME: this just overwrites the pervious var becuase it's not a good module name.
var diskDatastore = new diskstore.DiskDatastore();
var userHome = diskDatastore.getUserHome();

// FIXME: test teh async write functions...

assert.equal(userHome, "/home/burton");

async function testBasicFileOperations() {

    let testFilePath = "/tmp/test.write";
    let testDirPath = "/tmp/test.dir";

    // test removing files
    await diskDatastore.unlinkAsync(testFilePath)
                       .catch(function (err) {})
    await diskDatastore.rmdirAsync(testDirPath)
                       .catch(function (err) {console.error(err)})

    // test access

    var canAccess =
        await diskDatastore.accessAsync(testFilePath, fs.constants.R_OK | fs.constants.W_OK)
                       .then(() => true)
                       .catch(() => false);

    assert.equal(canAccess, false);

    // test writing
    await diskDatastore.writeFileAsync(testFilePath, "asdf", {});

    // now see if the file exists.

    var canAccess =
        await diskDatastore.accessAsync(testFilePath, fs.constants.R_OK | fs.constants.W_OK)
                           .then(() => true)
                           .catch(() => false);

    assert.equal(canAccess, true);

    // test reading
    var result = await diskDatastore.readFileAsync(testFilePath);
    assert.equal("asdf", result);

    // test removing files
    await diskDatastore.unlinkAsync(testFilePath);

    await diskDatastore.mkdirAsync(testDirPath)

    // now stat() the dir to see that it's actuall a dir.
    var stat = await diskDatastore.statAsync(testDirPath);

    assert.equal(stat.isDirectory(), true);

    console.log("Worked");

}

async function testDiskDatastore() {

    diskDatastore.init();
    diskDatastore.init();
    diskDatastore.sync("0x0000", {});

}

testBasicFileOperations();

testDiskDatastore();
//
//  test2();
//
//
