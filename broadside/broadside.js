var _ = require("underscore");
var fs = require("fs");
var path = require('path');
var swig = require('swig');
swig.setDefaults({ autoescape: false });
var cj = 1;

//-------------------outer--------------------------
function readFile() {
    var data = fs.readFileSync('./broadside/broadside.json', 'utf8');
    var fileLength=_.keys(JSON.parse(data)).length;
    global.flashBackLength=fileLength;
    var exportData = doTpl(JSON.parse(data));
    return exportData;
}
//---------------inner use---------------------------
function doTpl(data) {
    //1.判断是几层目录结构
    var html3 = "", html2 = "", html1 = "", tapTitle = []; menuObj = {};
    _.each(_.pairs(data), function (items, index) {
        //1.判断是几层目录结构

        var menuInfo = items[0].split("-");
        var len = menuInfo.length;
        switch (len) {
            case 1://无目录，直接就是文件名列表

                break;
            case 2://有二级目录，无顶部tab目录
                if (typeof (menuObj[menuInfo[0]]) === "object") { } else {
                    menuObj[menuInfo[0]] = [];
                }
                menuObj[menuInfo[0]].push({
                    name: items[1],
                    url: menuInfo[1],
                    parentTitle: menuInfo[0]
                })

                break;
            case 3://包含二级目录以及顶部tab目录
                if (typeof (menuObj[menuInfo[1]]) === "object") { } else {
                    menuObj[menuInfo[1]] = [];
                }
                menuObj[menuInfo[1]].push({
                    name: items[1],
                    url: menuInfo[2],
                    parentTitle: menuInfo[1]
                })
                tapTitle.push({ title: menuInfo[0], name: menuInfo[0],childrenName:menuInfo[1]})

        }


    });

    //var totalBs="<div><ul>"+html+"</div></ul>";
    var tpl = swig.compileFile("./broadside/broadside.html");
    //var bsTpl = buildSide.readFile();
    var menuHtml = tpl({
        data: menuObj
    });
    //若有第一级目录，那么我们渲染之
    if (tapTitle && tapTitle.length) {
        var topHtml = "";
        //这里我们需要去个重
        var repeatArray=[];
        // console.log(tapTitle)
        _.each(tapTitle, function (items, indexs) {
            if(repeatArray.indexOf(items.name)==-1){
                topHtml = topHtml + "<div data-children='"+items.childrenName+"' class='" + items.title + "  topTitleBox'>" + items.name + "</div>"
                repeatArray.push(items.name);
            }else{
              
            }
            
        })
    }
    var fixHtml = {
        menuHtml: menuHtml,
        topHtml: topHtml ?topHtml:"" 
    }
    
    return fixHtml;
}


//裸露给外部调用
exports.readFile = readFile;


