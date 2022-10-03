import { itemTypeKeys } from "./SynergyDefinitions.js";
import { LoadCharacter, userStruct, itemDisplaySize } from "../user.js";

const log = console.log.bind(console),
      localStorage = window.localStorage,
      sessionStorage = window.sessionStorage;

// Check if state query parameter exists in URL
async function VerifyState() {

    let urlParams = new URLSearchParams(window.location.search), state = urlParams.get('state');

    if (state != window.localStorage.getItem('stateCode')) {
        window.localStorage.clear();
        window.sessionStorage.clear();
        window.location.reload();
    }
    else {
        window.localStorage.removeItem('stateCode');
    };
};

// Redirect user back to specified url
// @string {url}, @string {param}
function RedirUser(url, param) {
    window.location.href = `${url}?${param ? param : ''}`;
};


// Returns corresponding class name using classType
// @int {classType}
function ParseChar(classType) {

    let returnCharString;
    switch (classType) {
        case 0:
            returnCharString = 'Titan';
            break;
        case 1:
            returnCharString = 'Hunter';
            break;
        case 2:
            returnCharString = 'Warlock';
            break;
        default:
            console.error('Could not parse character, parseChar() @function');
    };
    return returnCharString;
};


// Make element for entry data when hash is found in itemDefinitions
// @obj {param}
async function MakeBountyElement(param) {

    let itemOverlay = document.createElement('div'), itemStatus = document.createElement('img'), itemTitle = document.createElement('div'), itemType = document.createElement('div'), itemDesc = document.createElement('div'), item = document.createElement('img'), hr = document.createElement('hr');


    // Create bottom element
    item.className = `bounty`;
    item.id = `${param.hash}`;
    item.src = `https://www.bungie.net${param.displayProperties.icon}`;
    item.style.width = `${itemDisplaySize}px`;
    document.querySelector('#bountyItems').appendChild(item);

    // Create overlay element
    itemOverlay.className = `itemContainer`;
    itemOverlay.id = `item_${param.hash}`;
    itemOverlay.style.display = 'none';
    document.querySelector('#overlays').appendChild(itemOverlay);

    // Prop content of item
    itemTitle.id = 'itemTitle';
    itemType.id = 'itemType';
    itemDesc.id = 'itemDesc';
    itemTitle.innerHTML = param.displayProperties.name;
    itemType.innerHTML = param.itemTypeDisplayName;
    itemDesc.innerHTML = param.displayProperties.description;

    // Assign content to parent
    document.querySelector(`#item_${param.hash}`).append(itemTitle, itemType, hr, itemDesc);

    // Create item progress and push to DOM
    let rootIndex = param.objectiveDefinitions, completionCounter = 0;

    for (let indexCount = 0; indexCount < rootIndex.length; indexCount++) {

        let itemPrgCounter = document.createElement('div'), itemPrgDesc = document.createElement('div');

        // Check if progess string exceeds char limit
        if (rootIndex[indexCount].progressDescription.length >= 24) {

            let rt = rootIndex[indexCount].progressDescription.slice(0, 24);
            if (rt.charAt(rt.length - 1) === ' ') {
                rt = rt.slice(0, rt.length - 1); // Remove deadspaces at the end of strings
            };
            rootIndex[indexCount].progressDescription = rt + '..';
        };

        itemPrgCounter.className = 'itemPrgCounter';
        itemPrgDesc.className = 'itemPrgDesc';
        itemPrgCounter.id = `prgCounter_${rootIndex[indexCount].hash}`;
        itemPrgDesc.id = `prgDesc_${rootIndex[indexCount].hash}`;

        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgCounter);
        document.querySelector(`#item_${param.hash}`).appendChild(itemPrgDesc);

        // Render item objective progress
        itemPrgDesc.innerHTML = rootIndex[indexCount].progressDescription;
        param.progress.forEach(h => {
            if (h.objectiveHash === rootIndex[indexCount].hash) {

                // Render objective progress
                if (rootIndex[indexCount].completionValue === 100) {
                    itemPrgCounter.innerHTML = `${h.progress}%`;
                }
                else if (rootIndex[indexCount].completionValue !== 100) {
                    itemPrgCounter.innerHTML = `${h.progress}/${h.completionValue}`;
                };

                // Check if objective is completed
                if (h.complete) {
                    completionCounter++;
                };
            };
        });

        // Calculate the nth term for seperating objectives
        let paddingStepAmount = 40 / (rootIndex.length) === Infinity ? (0) : (40 / (rootIndex.length));
        itemPrgCounter.style.paddingBottom = '21px';
        itemPrgDesc.style.paddingBottom = '20px';

        for (let padC = 1; padC < rootIndex.length; padC++) { // Seperate objectives

            let offset = paddingStepAmount * indexCount;
            if (offset !== 0) {
                itemPrgCounter.style.paddingBottom = `${parseInt(itemPrgCounter.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
                itemPrgDesc.style.paddingBottom = `${parseInt(itemPrgDesc.style.paddingBottom.split('px')[0]) + Math.trunc(offset)}px`;
            };
        };
    };

    // Mark item as complete
    if (param.progress.length === completionCounter) {
        param.areObjectivesComplete = true;

        // Change style to represent state
        document.getElementById(`item_${param.hash}`).className = 'itemContainerComplete'; // ?
        document.getElementById(`${param.hash}`).style.border = '1px solid rgba(182,137,67, 0.749)';
    }
    else if (param.progress.length !== completionCounter) {
        param.areObjectivesComplete = false;
    };

    // Mark item as expired
    if (param.isExpired && !param.areObjectivesComplete) {
        itemStatus.className = `expire`;
        itemStatus.id = `expire_${param.hash}`;
        itemStatus.src = './ico/pursuit_expired.svg';

        // Change style to represent state
        // document.getElementById(`item_${param.hash}`).className = 'itemContainerExpired';
        document.getElementById(`${param.hash}`).style.border = '1px solid rgba(179,73,73, 0.749)';
    }
    else if (param.areObjectivesComplete) {
        itemStatus.className = `complete`;
        itemStatus.id = `complete_${param.hash}`;
        itemStatus.src = './ico/pursuit_expired.svg';
    };
    document.querySelector(`#bountyItems`).append(itemStatus);

    // Watch for mouse events
    item.addEventListener('mousemove', (e) => {
        let el = itemOverlay.style;
        el.display = 'inline-block';
        el.left = `${e.pageX}px`;
        el.top = `${e.pageY}px`;
    });

    item.addEventListener('mouseleave', (e) => {
        itemOverlay.style.display = 'none';
    });
};


// Start loading sequence
function StartLoad() {

    // Add loading bar
    document.getElementById('slider').style.display = 'block';

    // Add load content
    document.getElementById('loadingContentContainer').style.display = 'block';
};


// Stop loading sequence
function StopLoad() {

    // Remove loading bar
    document.getElementById('slider').style.display = 'none';

    // Use mobile layout for content
    document.getElementById('loadingContentContainer').style.display = 'none';
};


// Log user out on request
function Logout() {
    localStorage.clear();
    sessionStorage.clear();
    indexedDB.deleteDatabase('keyval-store');
    window.location.href = import.meta.env.HOME_URL;
};


// Insert commas into numbers where applicable
// @int {num}
function InsertSeperators(num) {
    return new Intl.NumberFormat().format(num);
};


// Capitalize First letter of string
function CapitilizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


// Sort items into bounties
function ParseBounties(charInventory, charObjectives, utils) {

    let charBounties = [], amountOfBounties = 0;

    charInventory.forEach(v => {

        let item = utils.itemDefinitions[v.itemHash];

        if (item.itemType === 26) {

            // Add objectives to item
            item.progress = [];
            for (let prg of charObjectives[v.itemInstanceId].objectives) {
                item.progress.push(prg);
            };

            // Add isExpired property
            item.isExpired = new Date(v.expirationDate) < new Date();
            item.props = [];

            // Add isComplete property
            let entriesAmount = item.progress.length, entriesCount = 0;

            for (let progressEntry of item.progress) {
                if (progressEntry.complete) {
                    entriesCount++;
                };
            };

            // Set to true otherwise false by default
            item.isComplete = false;
            if (entriesAmount === entriesCount) {
                item.isComplete = true;
            };

            // Push item to arr
            charBounties.push(item);
            amountOfBounties++;
        };
    });
    return [charBounties, amountOfBounties];
};


// Push bounties to DOM
function PushToDOM(bountyArr, utils) {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];
        if (group.length !== 0) {
            group.forEach(item => {
                utils.MakeBountyElement(item);
                utils.amountOfBounties++;
            });
        };
    });
};


// Sort bounties via vendor group
function SortByGroup(charBounties, utils) {

    charBounties.forEach(v => {
        for (let i = 1; i < utils.vendorKeys.length; i++) {
            if (utils.vendorKeys.length - 1 === i) {
                utils.bountyArr['other'].push(v);
                break;
            }
            else if (utils.vendorKeys.length !== i) {
                if (v.inventory.stackUniqueLabel.includes(utils.vendorKeys[i])) {
                    utils.bountyArr[utils.vendorKeys[i]].push(v);
                    break;
                };
            };
        };
    });
    return utils.bountyArr;
};


// Sort bounties via bounty type
function SortByType(bountyArr, utils) {

    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.sort(utils.sortBountiesByType);
        };
    });
    return bountyArr;
};


// Sorts by index of item in itemTypeKeys
function SortBountiesByType(a, b) {

    let stackLabelA = a.inventory.stackUniqueLabel, stackLabelB = b.inventory.stackUniqueLabel, stackTypeA, stackTypeB;

    // Remove numbers & get key names from stackUniqueLabel even if it contains _
    stackLabelA.split('.').forEach(v => {
        let keyFromStack = v.replace(/[0-9]/g, '');
        keyFromStack.includes('_') ? keyFromStack.split('_').forEach(x => itemTypeKeys.includes(x) ? stackTypeA = x : null) : itemTypeKeys.includes(v.replace(/[0-9]/g, '')) ? stackTypeA = v.replace(/[0-9]/g, '') : null;
    });
    stackLabelB.split('.').forEach(v => {
        let keyFromStack = v.replace(/[0-9]/g, '');
        keyFromStack.includes('_') ? keyFromStack.split('_').forEach(x => itemTypeKeys.includes(x) ? stackTypeB = x : null) : itemTypeKeys.includes(v.replace(/[0-9]/g, '')) ? stackTypeB = v.replace(/[0-9]/g, '') : null;
    });

    // Sort items by returning index
    if (itemTypeKeys.indexOf(stackTypeA) < itemTypeKeys.indexOf(stackTypeB)) {
        return -1;
    };
    if (itemTypeKeys.indexOf(stackTypeA) > itemTypeKeys.indexOf(stackTypeB)) {
        return 1;
    };
    return 0;
};


// Calculate total XP gain from (active) bounties
function CalcXpYield(bountyArr, utils) {

    let totalXP = 0;
    Object.keys(bountyArr).forEach(v => {

        let group = bountyArr[v];

        if (group.length !== 0) {
            group.forEach(z => {

                for (let i = 0; i < utils.itemTypeKeys.length; i++) {

                    let label = z.inventory.stackUniqueLabel;
                    if (label.includes(utils.itemTypeKeys[i])) {

                        if (label.includes('dreaming_city')) {
                            totalXP += utils.petraYields[utils.itemTypeKeys[i]];
                        }
                        else {
                            totalXP += utils.baseYields[utils.itemTypeKeys[i]];
                        };
                        break;
                    };
                };
            });
        };
    });
    return totalXP;
};

// BRIGHT ENGRAMS:
// If the user is level 97 then this means their next engram is 102 (5 levels)
// The 5n term starts at level 97 instead of 100

// For this we can use a linear function (y = mx + b)
// and rearrange it to solve for x

// In this scenario we can just assume that x will yeild a decimal value that we can
// use as a percentage progress to the next level that awards a bright engram

// nextEngramLevel = (currentLevel - startLevel) / nth term
// nextEngramLevel = (102 - 97) / 5;
// nextEngramLevel = 0.8 or 80%

// Of course this is all assuming that b always starts at 97 and not some other arbitrary value, other than 100.


// Calculate stats based around the season pass XP structure 
async function ReturnSeasonProgressionStats(seasonProgressionInfo, prestigeInfo, rewardsTrack, itemDefinitions) {

    // Get total season rank 
    let seasonRank = seasonProgressionInfo.level + prestigeInfo.level, returnArr = [];

    // Check if the season pass is higher than level 100 (prestige level)
    if (seasonRank >= 100) { // Prestige
        // Calculate Xp needed for next bright engram based on the current prestige level
        // Here, we are assuming that you get a bright engram every other five levels
        // starting at level 97
        // Read above this function for more info on this
        let levelsOutOfFiveToNextRank = (((seasonRank - 97) / 5) * 10) / 2;

        let nextEngramRank = (seasonRank + ((levelsOutOfFiveToNextRank) - 5)), brightEngramCount = 0, fireteamBonusXpPercent = 0, bonusXpPercent = 0;

        // Push Xp required until next engram to returnArr
        returnArr[0] = ((nextEngramRank - seasonRank) * 100000) - prestigeInfo.progressToNextLevel;

        // Iterate through the entire season pass and count all bright engrams
        Object.keys(rewardsTrack).forEach(v => {
            rewardsTrack[v].forEach(x => {

                let itemDisplayProperties = itemDefinitions[x].displayProperties;

                if (x === 1968811824) {
                    brightEngramCount++;
                }
                else if (itemDisplayProperties.name === 'Small Fireteam XP Boost') {
                    fireteamBonusXpPercent = fireteamBonusXpPercent + 2;
                }
                else if (itemDisplayProperties.name === 'Small XP Boost') {
                    bonusXpPercent = bonusXpPercent + 2;
                };
            });
        });

        // Push all results to the array that we return
        let prestigeRanksDividedNthTerm = (seasonRank - 100) / 5;
        returnArr[1] = brightEngramCount + Math.trunc(prestigeRanksDividedNthTerm);
        returnArr[2] = fireteamBonusXpPercent;
        returnArr[3] = bonusXpPercent;
        returnArr[4] = prestigeInfo.progressToNextLevel;
        returnArr[5] = 0;

        // Change DOM content if the user is over rank 100
        document.getElementById('seasonPassSecondContainer').style.color = 'rgb(99, 99, 99)';
        document.getElementById('seasonPassXpToMaxRank').style.color = 'rgb(63, 96, 112)';
    }

    else if (seasonRank < 100) { // Not prestige (less than 100)
        // Here, we are earning bright engrams relative to the season pass structure, because we are not past level 100
        // Once we are level 97, the n5 term applies to the levelling structure
        let splicedRewardsTrack = Object.keys(rewardsTrack).splice(seasonRank), engramRanks = [];

        // Iterate through rewards track and get every bright engram at their respective levels
        splicedRewardsTrack.forEach(v => {
            rewardsTrack[v].forEach(x => {
                if (x === 1968811824) {
                    engramRanks.push(v);
                };
            });
        });

        // Push results to return array
        if (!engramRanks[0]) {

            // Read above this function for more info on this
            let levelsOutOfFiveToNextRank = (((seasonRank - 97) / 5) * 10) / 2;
            let xpRequiredForNextRankThatGivesEngram = ((5 - (levelsOutOfFiveToNextRank + 1)) * 100000) + seasonProgressionInfo.progressToNextLevel;
            returnArr[0] = xpRequiredForNextRankThatGivesEngram;
        }
        else if (engramRanks[0]) {

            let nextEngramRank = engramRanks[0];
            returnArr[0] = ((nextEngramRank - seasonRank) * 100000) - seasonProgressionInfo.progressToNextLevel;
        };

        // Iterate through indexes before and upto the season rank level to get total number of bright engrams earnt
        let RewardsTrackUptoSeasonRank = Object.keys(rewardsTrack).splice(0, seasonRank), brightEngramCount = 0, fireteamBonusXpPercent = 0, bonusXpPercent = 0;

        RewardsTrackUptoSeasonRank.forEach(v => {
            rewardsTrack[v].forEach(x => {

                let itemDisplayProperties = itemDefinitions[x].displayProperties;

                if (x === 1968811824) {
                    brightEngramCount++;
                }
                else if (itemDisplayProperties.name === 'Small Fireteam XP Boost') {
                    fireteamBonusXpPercent = fireteamBonusXpPercent + 2;
                }
                else if (itemDisplayProperties.name === 'Small XP Boost') {
                    bonusXpPercent = bonusXpPercent + 2;
                };
            });
        });

        // Push results to return array
        returnArr[1] = brightEngramCount;
        returnArr[2] = fireteamBonusXpPercent;
        returnArr[3] = bonusXpPercent;
        returnArr[4] = seasonProgressionInfo.progressToNextLevel;
        returnArr[5] = (seasonProgressionInfo.levelCap - seasonProgressionInfo.level) * 100000 + seasonProgressionInfo.progressToNextLevel;
    };

    // Return our array
    return returnArr;
};


// Calculate percentage based on first parameter
async function CalculatePercentage(a, b) {
    return Math.trunc((100 * a) / b);
};


// Return season pass level, even when prestige level
async function ReturnSeasonPassLevel(seasonProgressionInfo, prestigeProgressionSeasonInfo) {

    let levelToReturn = 0;
    levelToReturn += seasonProgressionInfo.level;

    // If the season pass level is more than 100
    if (prestigeProgressionSeasonInfo.level !== 0) {
        levelToReturn += prestigeProgressionSeasonInfo.level;
    };
    return levelToReturn;
};


// Load first character on profile
async function LoadPrimaryCharacter(characters) {

    CacheReturnItem('lastChar')
    .then(async (data) => {
        if (!data) {
            CacheAuditItem('lastChar', characters[Object.keys(characters)[0]].classType);
            await LoadCharacter(characters[Object.keys(characters)[0]].classType);
        }
        else {
            await LoadCharacter(data);
        };
    });

};


// Change item in userCache, add if it doesn't exist
async function CacheAuditItem(key, value) {

    // Configure userCache if it does not exist#
    if (!localStorage.getItem('userCache')) {
        if (value) {
            localStorage.setItem('userCache', JSON.stringify({key: value}));
        }
        else {
            localStorage.setItem('userCache', JSON.stringify({}));
        };
    };

    // Get current userCache and append new key:value pair
    let userCache = JSON.parse(localStorage.getItem('userCache'));
    userCache[key] = value;
    localStorage.setItem('userCache', JSON.stringify(userCache));
};

// Get current userCache and remove specified key:value pair
async function CacheRemoveItem(key) {

    let userCache = JSON.parse(localStorage.getItem('userCache'));
    delete userCache[key];
    localStorage.setItem('userCache', JSON.stringify(userCache));
};

// Get current userCache and return specified key:value pair using key
async function CacheReturnItem(key) {

    let userCache = JSON.parse(localStorage.getItem('userCache'));
    return userCache[key];
};


// Adds something to the targets' innerHTML
// @string {target}, @string {content}
function AddNumberToElementInner(target, content) {

    // Change target innerHTML
    document.getElementById(`${target}`).innerHTML = content;
};


// Load heuristics and configure data
// @array {initArrStr}, @int {propCount}
async function CreateFilters(initArrStr, propCount) {

    // Create new object for filter elements
    userStruct['filterDivs'] = {};

    // Create a filter for each prop
    for (let v in propCount) {

        if (propCount[v] > 1) {

            let filterContainer = document.createElement('div'), filterContent = document.createElement('div');

            // Assign id's and classes + change innerHTML
            filterContainer.className = 'filter';
            filterContent.className = 'propName';
            filterContainer.id = `filter_${v}${propCount[v]}`;
            filterContent.id = `propName_${v}${propCount[v]}`;
            filterContent.innerHTML = `${CapitilizeFirstLetter(v)} (${propCount[v]})`;

            // Add filter to UserStruct
            userStruct['filterDivs'][`propName_${v}${propCount[v]}`] = {};
            userStruct['filterDivs'][`propName_${v}${propCount[v]}`].element = filterContent;

            // Append children elements to respective parent elements
            document.querySelector('#filters').appendChild(filterContainer);
            document.querySelector(`#filter_${v}${propCount[v]}`).appendChild(filterContent);

            // Show bounties as per filter
            filterContainer.addEventListener('click', () => {
                userStruct[initArrStr].forEach(b => {

                    // Find bounties that match the filter index
                    if (!b.props.includes(v)) {

                        document.getElementById(`${b.hash}`).style.opacity = '50%';
                        document.getElementById(`item_${b.hash}`).style.opacity = '50%';
                        document.getElementById(`propName_${v}${propCount[v]}`).style.color = 'rgb(224, 224, 224)';

                        if (!userStruct['greyOutDivs']) {
                            userStruct['greyOutDivs'] = [];
                            userStruct['greyOutDivs'].push(b.hash);
                        }
                        else if (!userStruct['greyOutDivs'].includes(b.hash)) {
                            userStruct['greyOutDivs'].push(b.hash);
                        };
                    };
                });
            });
        };
    };
};


// Generate a random string with defined length
// @int {len}
function GenerateRandomString(len) {
    let result = ' ';
    let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    };
    return result;
};



export {
    VerifyState,
    ParseChar,
    Logout,
    StartLoad,
    StopLoad,
    MakeBountyElement,
    RedirUser,
    InsertSeperators,
    CapitilizeFirstLetter,
    ParseBounties,
    PushToDOM,
    SortByGroup,
    SortByType,
    SortBountiesByType,
    CalcXpYield,
    ReturnSeasonProgressionStats,
    CalculatePercentage,
    ReturnSeasonPassLevel,
    LoadPrimaryCharacter,
    CacheAuditItem,
    CacheRemoveItem,
    CacheReturnItem,
    AddNumberToElementInner,
    CreateFilters,
    GenerateRandomString
};