import { CheckUserTokens } from "./CheckUserTokens";
import { axiosHeaders, log, UserProfile, UserProfileProgressions } from '../user.js';
import axios from 'axios';
import { MakeRequest } from "../modules/MakeRequest";

// Fetch bungie user data
export async function FetchBungieUser() {

    log('-> FetchBungieUser Called');

    // Get components
    const components = JSON.parse(window.localStorage.getItem('components'));
    const axiosConfig = {
        headers: {
            Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
            "X-API-Key": `${axiosHeaders.ApiKey}`
        }
    };


    // Check membershipType
    let membershipType = window.sessionStorage.getItem('membershipType');
    let destinyMembershipId = window.sessionStorage.getItem('destinyMembershipId');

    if (!membershipType || !destinyMembershipId) {

        // Fetch linked profiles -- 254 as membershipType
        await MakeRequest(`https://www.bungie.net/Platform/Destiny2/254/Profile/${components.membership_id}/LinkedProfiles/?getAllMemberships=true`, axiosConfig)
        .then((response) => {

            // Store response
            membershipType = response.data.Response.profiles[0].membershipType;
            destinyMembershipId = response.data.Response.profiles[0].membershipId;

            // Session storage
            window.sessionStorage.setItem('membershipType', membershipType);
            window.sessionStorage.setItem('destinyMembershipId', destinyMembershipId);
        })
        .catch((error) => {
            console.error(error);
        });
    };


    // Fetch profile
    await MakeRequest(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=100,104,200,201,202,205,300,301,305,900,1200`, axiosConfig)
    .then((response) => {
        
        // Assign user profile and progression data
        UserProfile.AssignDestinyUserProfile(response.data.Response);
        UserProfile.AssignCharacters(response.data.Response.characters.data);
        UserProfile.AssignCurrentSeasonHash(response.data.Response.profile.data.currentSeasonHash);
        UserProfileProgressions.AssignProfileProgressions(response.data.Response.profileProgression.data);

        // Session storage
        window.sessionStorage.setItem('destinyUserProfile', JSON.stringify(response.data.Response));
    })
    .catch((error) => {
        console.error(error);
    });

    UserProfile.AssignDestinyMembershipId(destinyMembershipId);
    UserProfile.AssignMembershipType(membershipType);
    
    log(`-> FetchBungieUser Finished`);
};



// Fetch bungie user data -- Deprecated
export async function FetchBungieUserDeprecated() {

    log('-> FetchBungieUserDetails Called');

    await CheckUserTokens();

    let components = JSON.parse(window.localStorage.getItem('components')),
        axiosConfig = {
            headers: {
                Authorization: `Bearer ${JSON.parse(window.localStorage.getItem('accessToken')).value}`,
                "X-API-Key": `${axiosHeaders.ApiKey}`
            }
        };


    // Check membershipType
    let membershipType = window.sessionStorage.getItem('membershipType'),
        destinyMembershipId = undefined;

    // Check cached data
    if (!membershipType || !membershipType) {

        // GetBungieNetUserById (uses 254 as membershipType)
        await axios.get(`https://www.bungie.net/Platform/Destiny2/254/Profile/${components.membership_id}/LinkedProfiles/?getAllMemberships=true`, axiosConfig)
            .then(response => {

                // Store response
                destinyMembershipId = response.data.Response.profiles[0].membershipId;
                membershipType = response.data.Response.profiles[0].membershipType;

                UserProfile.AssignDestinyMembershipId(destinyMembershipId);
                UserProfile.AssignMembershipType(membershipType);


                // Cache in window.sessionStorage
                window.sessionStorage.setItem('membershipType', membershipType);
                window.sessionStorage.setItem('destinyMembershipId', destinyMembershipId);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // GetProfile
    await axios.get(`https://www.bungie.net/Platform/Destiny2/${membershipType}/Profile/${destinyMembershipId}/?components=100,104,200,201,202,205,300,301,305,900,1200`, axiosConfig)
        .then(response => {
                
            // Store in memory again
            log(response);
            destinyUserProfile = response.data.Response;

            // Parse data from destinyUserProfile
            CurrentSeasonHash = destinyUserProfile.profile.data.currentSeasonHash;
            ProfileProgressions = destinyUserProfile.profileProgression.data;

            // Cache in window.sessionStorage
            window.sessionStorage.setItem('destinyUserProfile', JSON.stringify(destinyUserProfile));
        })
        .catch((error) => {
            console.error(error);
        });
        
    characters = destinyUserProfile.characters.data;
    log(`Current season hash: ${CurrentSeasonHash}`);
};