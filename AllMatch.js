const cheerio = require("cheerio");
const request = require("request");
const path = require("path");
const reader = require("xlsx");
const fs = require("fs");
const baseUrl ="https://www.espncricinfo.com";
let cur_Path = process.cwd();
// console.log(cur_Path);


let ipl = path.join(cur_Path,"IPL");
if(!fs.existsSync(ipl)){
    fs.mkdirSync(ipl);
}

// Processing All Patches Page ==> ye vala function export kr rkha hai
const SingleMatch = require("./SingleMatch.js");
function processAllMatches(AllMatchesLink){

    request(AllMatchesLink,function(error,response,body){
        if(error == null && response.statusCode != 404){
            processMatches(body);
        }
        else{
            console.log(error);
            console.log(response.statusCode);
        }
    })
}

function processMatches(body){
    let $ = cheerio.load(body);

    let arr = $("a[data-hover ='Scorecard']");
    // console.log(arr.length);
    
    for(let i =0; i<arr.length ;i++){
        let link = $(arr[i]).attr("href");
        link = baseUrl + link;
        // console.log(link);
        SingleMatch.makeSingleMatchRequest(link);   
        
    }
}

module.exports = {
     processAllMatches
};