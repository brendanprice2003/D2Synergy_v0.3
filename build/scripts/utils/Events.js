import{LoadCharacter as n,userStruct as e}from"../user.js";import{Logout as o}from"./ModuleScript.js";const d=async()=>{for(let t=0;t<=2;t++)document.getElementById(`charContainer${t}`).addEventListener("click",()=>{n(t)});document.getElementById("navBarLogoutContainer").addEventListener("click",()=>{o()}),document.getElementById("navBarSettingsContainer").addEventListener("click",()=>{let t=document.getElementById("mainContainer").style.display;t==="none"?(document.getElementById("settingsContainer").style.display="none",document.getElementById("mainContainer").style.display="block"):t!=="none"&&(document.getElementById("mainContainer").style.display="none",document.getElementById("settingsContainer").style.display="block")}),document.getElementById("statsTitleQuery").addEventListener("mousemove",()=>{document.getElementById("queryDiv").style.display="block"}),document.getElementById("statsTitleQuery").addEventListener("mouseleave",()=>{document.getElementById("queryDiv").style.display="none"}),document.getElementById("statSharedWisdom").addEventListener("mouseover",()=>{document.getElementById("sharedWisdomPopupContainer").style.display="inline-block"}),document.getElementById("statSharedWisdom").addEventListener("mouseleave",()=>{document.getElementById("sharedWisdomPopupContainer").style.display="none"}),document.getElementById("statGhostMod").addEventListener("mouseover",()=>{document.getElementById("ghostModPopupContainer").style.display="inline-block"}),document.getElementById("statGhostMod").addEventListener("mouseleave",()=>{document.getElementById("ghostModPopupContainer").style.display="none"}),document.getElementById("statBonusXp").addEventListener("mouseover",()=>{document.getElementById("BonusXpPopupContainer").style.display="inline-block"}),document.getElementById("statBonusXp").addEventListener("mouseleave",()=>{document.getElementById("BonusXpPopupContainer").style.display="none"}),document.getElementById("removeFiltersID").addEventListener("click",()=>{e.charBounties.forEach(t=>{e.greyOutDivs&&e.greyOutDivs.forEach(s=>{document.getElementById(`${t.hash}`).style.opacity="unset",document.getElementById(`item_${t.hash}`).style.opacity="unset"})}),e.greyOutDivs=[],Object.keys(e.filterDivs).forEach(t=>{e.filterDivs[t].element.style.color="rgb(138, 138, 138)"})}),document.getElementById("cgDefaultLoadouts").addEventListener("click",()=>{e.objs.currView.style.display="none",document.getElementById("loadoutsContainer").style.display="block",e.objs.currView=document.getElementById("loadoutsContainer")}),document.getElementById("cgPursuits").addEventListener("click",()=>{e.objs.currView.style.display="none",document.getElementById("pursuitsContainer").style.display="block",e.objs.currView=document.getElementById("pursuitsContainer")}),document.getElementById("btnSynergyView").addEventListener("click",()=>{e.objs.currView.style.display="none",document.getElementById("synergyContainer").style.display="block",e.objs.currView=document.getElementById("synergyContainer")}),document.getElementById("btnHideFilters").addEventListener("click",()=>{var t=document.getElementById("filterContentContainer").style;e.bools.filterToggled?e.bools.filterToggled&&(e.bools.filterToggled=!1,t.display="none"):(e.bools.filterToggled=!0,t.display="block")})};export{d as AddEventListeners};