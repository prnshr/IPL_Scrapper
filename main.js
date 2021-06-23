const cheerio = require("cheerio");
const request = require("request");
const path = require("path");
const reader = require("xlsx");
const fs = require("fs");

const AllMatch = require("./AllMatch.js");

let cur_Path = process.cwd();
// console.log(cur_Path);


let ipl = path.join(cur_Path,"IPL");
if(!fs.existsSync(ipl)){
    fs.mkdirSync(ipl);
}

const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
const baseUrl ="https://www.espncricinfo.com";


// Processing the main page
request(url, function(error,response, body){
    if(error == null && response.statusCode != 404){
        processMainPage(body);
    }
    else{
        console.log(error);
        console.log(response.statusCode);
    }
});


function processMainPage(body){
    let $ = cheerio.load(body);

    let AllMatchesLink = $("a[data-hover ='View All Results']").attr("href");
    AllMatchesLink = baseUrl + AllMatchesLink;
    // console.log(AllMatchesLink);
    AllMatch.processAllMatches(AllMatchesLink);
}








