import axios from 'axios';
import { FetchPrimaryUserMembership } from './FetchPrimaryUserMembership.js';
import { ReturnSeasonPassLevel } from './ReturnSeasonPassLevel.js';

const log = console.log.bind(console);
const requestHeaders = { headers: { "X-API-Key": import.meta.env.API_KEY } };

export async function LoadPartialProfile(memship, definitions) {

    // Parse defs
    const {
        seasonDefinitions,
        seasonPassDefinitions,
        commendationsNodeDefinitions,
        recordDefinitions
    } = definitions;

    // Get correct memship type
    let memshipType = await FetchPrimaryUserMembership(memship)
    .then((res) => {
        return res.membershipType;
    }).catch(e => console.error(e));


    // Get user clan name
    let clan = await axios.get(`https://www.bungie.net/Platform/GroupV2/User/${memshipType}/${memship}/0/1/`, requestHeaders)
    .then((res) => {
        return res.data.Response.results[0].group;
    }).catch(e => console.error(e));

    // Get user info
    let user = await axios.get(`https://www.bungie.net/Platform/Destiny2/${memshipType}/Profile/${memship}/?components=100,1400,900,202,200,104`, requestHeaders)
    .then((res) => {
        return res.data.Response;
    }).catch(e => console.error(e));

    log(user);
    // Get current season/season pass -> Get user season rank
    let pchar = Object.values(user.characters.data).sort((a,b) => new Date(b.dateLastPlayed) - new Date(a.dateLastPlayed))[0]; // Get primary character by date last played
    let season = seasonDefinitions[user.profile.data.currentSeasonHash];
    let seasonpass = seasonPassDefinitions[season.seasonPassHash];

    let seasonProgressionHash = season.seasonPassProgressionHash; // Get required progression hashes
    let prestigeSeasonProgressionHash = seasonpass.prestigeProgressionHash;

    // Check if profile is private by proxy
    let seasonProgression = null;
    let prestigeSeasonProgression = null;
    if (user.characterProgressions.data) {
        seasonProgression = Object.values(user.characterProgressions.data)[0].progressions[seasonProgressionHash]; // Get progression data
        prestigeSeasonProgression = Object.values(user.characterProgressions.data)[0].progressions[prestigeSeasonProgressionHash];
    };


    // Check if profile is private by proxy
    // Get all commendation node values -> sent/received and total
    const { totalScore, scoreDetailValues: [sent, received] } = user.profileCommendations.data
    let objs = user.profileCommendations.data.commendationNodePercentagesByHash;
    let nodesArr = [];
    for (let nodeHash in objs) {
        
        let commendationPercent = objs[nodeHash];
        let def = commendationsNodeDefinitions[nodeHash];
        nodesArr.push([ def.displayProperties.name, commendationPercent ]);
    };


    
    // Check if a title is equipped
    let title = false;
    let gild = false;
    if (pchar.titleRecordHash) {

        // Get title and title hash
        let titleHash = pchar.titleRecordHash;
        title = recordDefinitions[titleHash];

        // Check if title can be gilded
        if (title.titleInfo.gildingTrackingRecordHash) {
            
            // Check if gild is complete
            let gildRecord = user.profileRecords.data.records[title.titleInfo.gildingTrackingRecordHash];
            if (gildRecord.objectives[0].complete) {

                // log(gildRecord);
                // log(!!(gildRecord.state & 1));

                // Check if gild has been claimed
                // let state = Boolean(gildRecord.state & 1);
                // log(gildRecord.state);
                // if (state) {
                //     gild = true;
                // };
            };
        };

        // Get title name (fix gender)
        title = title.titleInfo.titlesByGender.Male;
    };


    // Return all required profile info
    return {
        memship: memship,
        uname: user.profile.data.userInfo.bungieGlobalDisplayName,
        displayCode: user.profile.data.userInfo.bungieGlobalDisplayNameCode,
        light: pchar.light,
        emblemPath: pchar.emblemPath,
        emblemBackgroundPath: pchar.emblemBackgroundPath,
        guardianRank: user.profile.data.currentGuardianRank,
        tscore: user.profileRecords.data.activeScore,
        splevel: await ReturnSeasonPassLevel(seasonProgression, prestigeSeasonProgression),
        cname: clan.name,
        comms: {
            totalScore: totalScore,
            nodes: nodesArr,
            details: {
                sent: sent,
                received: received
            }
        },
        titleName: title, // If no title, return false
        isTitleGilded: gild // If no gild, return false
    };

};