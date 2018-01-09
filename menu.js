//Please note, this uses body parser, and request libraries.

var request = require("request");  
var menus = [];
var pageNum = 1;
var API, total;
var obj = {};
var url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=1&page=";
function initializeObj()
{
    obj.valid_menus = [];
    obj.invalid_menus = [];
}

function getAPI(callback) {
    request(url + pageNum, function (error, response, body) {
        API = JSON.parse(body);
        total = API["pagination"]["total"]
        callback();
    });
}

function sequential() {
    menus.push(API);
    pageNum++
    if (total - pageNum * API["pagination"]["per_page"] >= 0) {
        getAPI(sequential);
    }
    else {
        trim();
    }
}

function trim()
{
    for (var x = 0 ; x < menus.length ; x++)
    {
        menus[x] = menus[x]["menus"];
    }
    sort();
}

function sort()                                                                  
{
    for (var x = 0 ; x < menus.length ; x++)
    {
        for (var y = 0 ; y < menus[x].length ; y++)
        {
            rootParents(x, y);
            if (menus[x][y].child_ids.length > 0)
            {
                matchChildren(x, y);
            }
            
        }
    }
    filter();
    console.log((JSON.stringify(obj)));
    if (url !== "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=2&page=")
    {
    url = "https://backend-challenge-summer-2018.herokuapp.com/challenges.json?id=2&page=";
    pageNum = 1;
    initializeObj();
    menus = [];
    API = null;
    getAPI(sequential);
    }
    
}

function rootParents(x, y)
{
    if (!menus[x][y].hasOwnProperty("parent_id"))                              
        {
            obj.valid_menus.push({
                "root_id": menus[x][y].id,
                "children": []
            });
        }
}

function matchChildren(x, y)                                                   
{
    var idUsed;
    if (menus[x][y].hasOwnProperty("parent_id"))
    {
        idUsed = menus[x][y].parent_id;
    }
    else { idUsed = menus[x][y].id; }
    
    for (var i = 0 ; i < obj.valid_menus.length ; i++)
    {
        if ((obj.valid_menus[i].root_id === idUsed) || (obj.valid_menus[i].children.indexOf(idUsed) > -1))
        {
            obj.valid_menus[i].children = obj.valid_menus[i].children.concat(menus[x][y].child_ids);
        }
    }
}

function filter()
{
    for (var i = 0 ; i < obj.valid_menus.length ; i++)
    {
        if (obj.valid_menus[i].children.indexOf(obj.valid_menus[i].root_id) >= 0)
        {
            obj.invalid_menus.push(obj.valid_menus[i]);
            obj.valid_menus.splice(i, 1);
        }
        else if (obj.valid_menus[i].children.length > 4)
        {
            obj.invalid_menus.push(obj.valid_menus[i]);
            obj.valid_menus.splice(i, 1);
        }
    }
}
initializeObj();
getAPI(sequential);