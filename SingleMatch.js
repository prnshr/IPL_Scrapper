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

function makeSingleMatchRequest(single_url){
    request(single_url, function(error,response, body){
        if(error == null && response.statusCode != 404){
            processSingleMatch(body);
        }
        else{
            console.log(error);
            console.log(response.statusCode);
        }
    });
}

// Processing single Match
function processSingleMatch(body){
    let $ = cheerio.load(body);
    let Teams = $(".Collapsible");// Team A and Team B alag alag krlo, aur vahan khelo
    // console.log(Teams.length);
    processTeam($,Teams[0]);
    processTeam($,Teams[1]);

}

// Process Teams
function processTeam($, Team){
    let AllBatsmen = $(Team).find(".batsman tbody tr");
    let teamName = $(Team).find(".header-title").text().split("INNINGS")[0].trim().split(" ").join("_").toLowerCase();

    for(let i =0 ; i< AllBatsmen.length ; i++){
        // if(!$(AllBatsmen[i]).hasClass("p-0.border-0.out")){------------------------------------
            let obj = processEachBatsman($,AllBatsmen[i]);
           
            if(obj != null){
                obj.teamName = teamName;
                // console.log(obj);

                let teamPath =path.join(ipl,teamName);
                if(!fs.existsSync(teamPath)){
                    fs.mkdirSync(teamPath);
                }

                let playerName =obj.name;
                let player = playerName+".xlsx";
                let filePath = path.join(teamPath,player);
                excelWriter(filePath,obj,playerName);
            }
        // }
    }

}



// Process Each Batsman-----------------------------------------------------------------------------------
function processEachBatsman($,object){
    let details = $(object).find("td");

    if(!$(details[0]).hasClass("batsman-cell"))
        return null;
   
    let name = $(details[0]).text();
    name = name.split("(")[0].split("†")[0].trim().split(" ").join("_").toLowerCase();
    let runs = $(details[2]).text();
    let balls = $(details[3]).text();
    let fours = $(details[5]).text();
    let sixes = $(details[6]).text();
    let strikeRate= $(details[7]).text();

    let obj={name, runs,balls,fours,sixes,strikeRate};
    return obj;
}



function excelReader(filePath,name){
    if(fs.existsSync(filePath) == false){
        return [];
    }

    console.log(filePath);
    let workbook = reader.readFile(filePath);

    console.log(workbook.SheetNames)
    
    let excelData = workbook.Sheets[name];

    let jsonData = reader.utils.sheet_to_json(excelData);
    
    return jsonData;
}

function excelWriter(filePath,obj,name){

    let jsonData = excelReader(filePath,name);
    console.log(jsonData);
    
    jsonData.push(obj);
    let workBook = reader.utils.book_new();
    let workSheet = reader.utils.json_to_sheet(jsonData);
    reader.utils.book_append_sheet(workBook,workSheet,name);
    console.log( workBook.SheetNames);
    reader.writeFile(workBook, filePath);
}

module.exports = {
   makeSingleMatchRequest
};