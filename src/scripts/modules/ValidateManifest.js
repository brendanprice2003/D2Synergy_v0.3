import axios from 'axios';
import { get, set } from 'idb-keyval';
import { GenerateRandomString } from './ModuleScript.js';

const requiredTables = [
    'DestinySeasonDefinition',
    'DestinyInventoryItemDefinition',
    'DestinyObjectiveDefinition',
    'DestinyProgressionDefinition',
    'DestinySeasonPassDefinition',
    'DestinyRecordDefinition',
    'DestinyPresentationNodeDefinition'
];

var log = console.log.bind(console),
    manifest;



// Return manifest components
var ReturnComponentSuffix = async (entry) => {

    if (!manifest) {
        manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    };
    let components = manifest.data.Response.jsonWorldComponentContentPaths[window.navigator.language.split('-')[0]];
    log(components);

    return components[entry];
};



// Check if each (required) table exists
var FixTables = async () => {

    log(requiredTables);
    for (let table of requiredTables) {
        
        let entry = await get(table);
        if (!entry) {

            // Omit API key from request
            delete axios.defaults.headers.common['X-API-Key'];

            // Request/Set new table
            let suffix = await ReturnComponentSuffix(table),
                newTable;

            newTable = await axios.get(`https://www.bungie.net${suffix}`)
                .then((res) => {
                    return res;
                })
                .catch((error) => {
                    console.error(error);
                    // Retry request with random query to bypass cache
                    return axios.get(`https://www.bungie.net${suffix}?${GenerateRandomString(4)}=${GenerateRandomString(4)}`);
                });

            log(newTable);
            set(table, newTable.data);
        };
    };
};



// Check manifest version
export var ValidateManifest = async () => {

    log('ValidateManifest START')

    // Change notification label content
    document.getElementById('notificationTitle').innerHTML = 'Loading Definitions';
    document.getElementById('notificationMessage').innerHTML = 'Parsing definitions..';

    // Fetch manifest
    let localStorageManifestVersion = window.localStorage.getItem('destinyManifestVersion');
    
    // Validate the current existing tables
    manifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`);
    await FixTables();

    // Check manifest version
    if (localStorageManifestVersion !== manifest.data.Response.version) {
        window.localStorage.setItem('destinyManifestVersion', manifest.data.Response.version);
    };

    // Remove timeout, just in the case overlapping instructions
    log('ValidateManifest END');
};



// Return passed component
export var ReturnEntry = async (entry) => {

    let res = await get(entry);
    if (!res) {
        await FixTables();
        return await get(entry);
    };

    return res;
};
