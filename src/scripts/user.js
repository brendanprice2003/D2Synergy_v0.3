console.log('%cD2 SYNERGY _V0.3', 'font-weight: bold;font-size: 40px;color: white;');
console.log('// Please report any errors to @beru2003 on Twitter.')
var log = console.log.bind(console);
var localStorage = window.localStorage;

const startTime = new Date();

// has code
// has localStorage items

const AuthorizeBungie = async () => {

    var AuthorizationCode = window.location.search.replace('?code=','');
    // var lsAuthorizationCode = localStorage.getItem('components')['authorization_code'];

    try {
        if (AuthorizationCode && !localStorage.getItem('components')) {

            // If user does not have localStorage items
            var AccessToken = {}, 
            RefreshToken = {},
            components = {};
            const AxiosConfig = {
                headers: {
                    "Authorization": `Basic ${btoa('38074:9qBsYpKC7ieWB4pffobacY7weIcziSmmfDXc.nwe8S8')}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            };
    
            await axios.post('https://www.bungie.net/platform/app/oauth/token/', `grant_type=authorization_code&code=${AuthorizationCode}`, AxiosConfig)
            .then(res => {
                var data = res.data;
    
                components['membership_id'] = data['membership_id'];
                components['token_type'] = data['token_type'];
                components['authorization_code'] = AuthorizationCode;
    
                AccessToken['inception'] = Math.round(new Date().getTime()/1000);
                AccessToken['expires_in'] = data['expires_in'];
                AccessToken['value'] = data['access_token'];
    
                RefreshToken['inception'] = Math.round(new Date().getTime()/1000);
                RefreshToken['expires_in'] = data['refresh_expires_in'];
                RefreshToken['value'] = data['refresh_token'];
    
                localStorage.setItem('accessToken', JSON.stringify(AccessToken));
                localStorage.setItem('components', JSON.stringify(components));
                localStorage.setItem('refreshToken', JSON.stringify(RefreshToken));
            });

            log('-> Authorized with Bungie.net!');
        }
        else if (!AuthorizationCode || !localStorage.getItem('components')) {
            window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
        };
    } 
    catch (error) { 
        log(`Line 57: ${error}`);
        window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
    };

    // Check if user entered the URL in-directly
    // Check against userAuth localStorage variable to see if user has authorized before
    //  and is entering the path directly


    // try {
    //     if (AuthorizationCode && localStorage.getItem('components')) {

    //         // Refresh tokens completley
    //         var accessTokenKey = JSON.parse(localStorage.getItem('accessToken'));
    //         var components = JSON.parse(localStorage.getItem('components'));
    //         var refreshTokenKey = JSON.parse(localStorage.getItem('refreshToken'));
    
    //         if (accessTokenKey && refreshTokenKey && components) {
    //             if (Math.round(new Date().getTime()/1000) - accessTokenKey['inception'] == accessTokenKey['expires_in']) {
    //                 window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`;
    //             }
    //             else {
    //                 log('-> LocalStorage items validated!');
    //                 // isUserAuthorized = true;
    //                 // localStorage.setItem('userAuthorized', true);
    //             };
    //         };
    //     }
    //     else if (!localStorage.getItem('components')) {
    //         log(`Line 82`)
    //         // User entered the URL directly
    //         // window.location.href = `http://86.2.10.33:4645/D2Synergy-v3.0/src/views/app.html`;
    //     };
    // } catch (error) { 
    //     log(`Line 86: ${error}`); 
    // };
};


const GetDestinyManifest = async (conf) => {
    try {
        const DestinyManifest = await axios.get(`https://www.bungie.net/Platform/Destiny2/Manifest/`, conf);
        localStorage.setItem('destinyManifestVersion', JSON.stringify(DestinyManifest['data']['Response']['version']));
        log('-> Manifest (Version) Accquired!');
    } catch (error) { window.location.href = `https://www.bungie.net/en/oauth/authorize?&client_id=38074&response_type=code`; };
};


const FetchBungieUserDetails = async (self, conf) => {
    var components = self.components;
    var userComponents = {};
    var bungieMembershipId = components['membership_id'];

    // Get bungie user by id
    var GetBungieNetUserById = await axios.get(`https://www.bungie.net/Platform/User/GetBungieNetUserById/${bungieMembershipId}/`, conf);
    userComponents['BungieNetUser'] = GetBungieNetUserById['data']['Response'];

    // Get memberships by id
    var GetMembershipsById = await axios.get(`https://www.bungie.net/Platform/User/GetMembershipsById/${bungieMembershipId}/0/`, conf);
    userComponents['DestinyUserMemberships'] = GetMembershipsById['data']['Response']['destinyMemberships'];

    // Index for primaryMembershipId and membershipType
    let index = userComponents['DestinyUserMemberships'][0];
    var PrimaryMembershipId = index['membershipId'];
    var MembershipType = index['membershipType'];


    // Get users clan info
    var LinkedMembershipType;
    const LinkedProfiles = await axios.get(`https://www.bungie.net/Platform/Destiny2/${MembershipType}/Profile/${bungieMembershipId}/LinkedProfiles/?getAllMemberships=true`, conf);
    LinkedMembershipType = LinkedProfiles['data']['Response']['bnetMembership']['membershipType'];
    const GetGroupsForMember = await axios.get(`https://www.bungie.net/Platform/GroupV2/User/${LinkedMembershipType}/${bungieMembershipId}/0/1/`, conf);
    userComponents['DestinyUserClan'] = GetGroupsForMember['data']['Response']['results'][0]['group'];


    // Get characters
    var GetProfileComponents = await axios.get(`https://www.bungie.net/Platform/Destiny2/${MembershipType}/Profile/${PrimaryMembershipId}/?components=200`, conf);
    userComponents['DestinyUserCharacters'] = GetProfileComponents['data']['Response'];
    localStorage.setItem('userComponents', JSON.stringify(userComponents));

    // Configure UI
    document.getElementById('userClan').innerHTML = '['+userComponents['DestinyUserClan']['clanInfo']['clanCallsign']+']';
    document.getElementById('displayName').innerHTML = userComponents['BungieNetUser']['cachedBungieGlobalDisplayName'];
};


const ParseUserCharacters = async (self) => {
    var userComponents = self.userComponents,
    CharacterIndex = Object.values(userComponents['DestinyUserCharacters']);

    // if (CharacterIndex[0]['emblemBackgroundPath']) {
    //     document.getElementById('userEmblem1').style.display = 'inline';
    //     document.getElementById('emblemPath1').src = `https://www.bungie.net${CharacterIndex[0]['emblemBackgroundPath']}`;
    // };
    // if (CharacterIndex[1]['emblemBackgroundPath']) {
    //     document.getElementById('userEmblem2').style.display = 'inline';
    //     document.getElementById('emblemPath2').src = `https://www.bungie.net${CharacterIndex[1]['emblemBackgroundPath']}`;
    // };
    // if (CharacterIndex[2]['emblemBackgroundPath']) {
    //     document.getElementById('userEmblem3').style.display = 'inline';
    //     document.getElementById('emblemPath3').src = `https://www.bungie.net${CharacterIndex[2]['emblemBackgroundPath']}`;
    // };
};


const GetLocalStorageSize = async () => {
    var values = [],
    keys = Object.keys(localStorage),
    i = keys.length;

    while (i--) { values.push(localStorage.getItem(keys[i])); };

    log('[Usage Bytes]: ', encodeURI(JSON.stringify(values)).split(/%..|./).length - 1);
};


const Main = (self) => {

    document.getElementById('displayName').innerHTML = userComponents['BungieNetUser']['cachedBungieGlobalDisplayName'];
    document.getElementById('userClan').innerHTML    = '['+userComponents['DestinyUserClan']['clanInfo']['clanCallsign']+']';
};


(async () => {

    await AuthorizeBungie();

    var accessTokenKey = JSON.parse(localStorage.getItem('accessToken')),
        components     = JSON.parse(localStorage.getItem('components')),
        refreshToken   = JSON.parse(localStorage.getItem('refreshToken')),
        userComponents = JSON.parse(localStorage.getItem('userComponents'));
    var AxiosConfig = {
        headers: {
            "X-API-Key": 'e62a8257ba2747d4b8450e7ad469785d',
            Authorization: `Bearer ${accessTokenKey['value']}`
        }
    };

        // Get utils and misc
        // await GetDestinyManifest();
        await FetchBungieUserDetails({components}, AxiosConfig);
        // await GetLocalStorageSize();

        // User Data
        // await ParseUserCharacters();

        // Main
        // await Main({});
        
        // Stop loading sequence
        document.getElementById('slider').style.display = 'none';
        log('-> API Fetch Complete!');

        log(`Runtime: ${(new Date() - startTime)}ms`);
})();