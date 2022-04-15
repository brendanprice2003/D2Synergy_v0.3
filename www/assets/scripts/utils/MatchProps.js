import { userStruct } from '../user.js';
import { bountyHashes } from './data/bounties.js';
import {
    ActivityMode,
    Destination,
    DamageType,
    AmmoType,
    ItemCategory,
    KillType } from './SynergyDefinitions.js';

    const log = console.log.bind(console);

    var propCount = {},
        bin = []; // Bounties that do not possess any indexes in the heuristics


// Push the props onto charBounties
const PushProps = async () => {

    // Clear counters
    propCount = {};

    // Loop over charBounties and append counters
    for (let i=0; i < userStruct.charBounties.length; i++) {

        var hash = userStruct.charBounties[i].hash,
            entry = bountyHashes[hash],
            counters = {};

        for (let prop in entry) {

            if (entry[prop].length !== 0) {

                var propNames = [];
                for (let foo of entry[prop]) {
                    var arr = prop==='Destination'?Destination:(prop==='ActivityMode'?ActivityMode:(prop==='DamageType'?DamageType:(prop==='ItemCategory'?ItemCategory:(prop==='AmmoType'?AmmoType:(prop==='KillType'?KillType:null)))));
                    propNames.push(arr[foo]);
                };

                for (let bar of propNames) {
                    propCount[bar] === undefined ? (propCount[bar] = 0, propCount[bar] += 1) : propCount[bar] += 1;
                    counters[bar] === undefined ? (counters[bar] = 0, counters[bar] += 1) : counters[bar] += 1;
                    userStruct.charBounties[i].props.push(bar);
                };
            };
        };
    };
};


export { propCount, bin, PushProps };