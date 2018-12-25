
var marked = require("marked");
var _ = require("underscore");
var fs = require("fs");
var path = require('path');
var swig = require("swig");
var $ = require("jquery");
var pinyin = require("js-pinyin");
var buildSide = require("./broadside/broadside.js");
swig.setDefaults({ autoescape: false });
pinyin.setOptions({ checkPolyphone: false, charCase: 0 });
//遍历markDownsFiles文件夹
var filePath = path.resolve('./markDownFiles');
var contentName = [];//这个变量用来装文件名，我们将用之建立一个json文件。
var dictionaryName={};//这个变量用来装文件夹名，我们也将用之建立一个json文件。
var fileLength=0;//这个变量用来判断文件数量，是否全部构建完成
var dictionary=1;//这个变量用来判断文件夹的层级。
fileDisplay(filePath);
function createJson(filePath) {
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err);
        } else {

            files.forEach(function (filename) {
                var filedir = path.join(filePath, filename);//绝对路径
               
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn('获取文件stats失败');
                    } else {
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if (isFile) {
                            console.log(filename);
                            fs.readFile(filedir, 'utf-8', function (err, data) {
                                if (err) {
                                } else {
                                    contentName.push((filename.split("."))[0]);
                                    //然后我们根据contentName的内容，建立一个json文件
                                    var jsonObj = {};
                                    _.each(contentName, function (item, index) {
                                        jsonObj[pinyin.getFullChars(item)] = item;
                                    })
                                    var paths = "./broadside/broadside.json";
                                    fs.writeFile(paths, JSON.stringify(jsonObj), function (err) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                    });
                                    if (filename.length == contentName.length) {
                                        console.log("broadside.json文件创建完毕");
                                        fileDisplay(filePath);
                                    }
                                }
                            })
                        }else{
                            var dirName=fs.readdirSync(filedir);
                            console.log(filename);
                            //是文件夹，我们需要判断是第几层文件夹，然后用之渲染目录
                            if(dictionary==1){
                                //第一层
                                dictionary=dictionary+1;
                            }else{
                                //第二层
                                dictionary=1;
                                
                            } 
                        }
                        if (isDir) {
                            createJson(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
            //该死的异步
            // fileDisplay(filePath);

        }
    })
}
function fileDisplay(filePath) {
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.warn(err)
        } else {
            //遍历读取到的文件列表
            files.forEach(function (filename) {
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir, function (eror, stats) {
                    if (eror) {
                        console.warn('获取文件stats失败');
                    } else {
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if (isFile) {
                            fs.readFile(filedir, 'utf-8', function (err, data) {
                                if (err) {
                                    //console.log("---读取文件出错了-build.js---");
                                } else {
                                    //console.log("---读取文件完成-build.js---");
                                    //检测-创建-写入 一条龙服务
                                    var writepath = mkdirPath(filename, "html");
                                    // contentName.push(filename);
                                    var oneShot = data;
                                    marked.setOptions({//对markdown文件的解析
                                        renderer: new marked.Renderer(),
                                        gfm: true,
                                        tables: true,
                                        breaks: false,
                                        pedantic: false,
                                        sanitize: false,
                                        smartLists: true,
                                        smartypants: false
                                    });//基本设置

                                    //console.log("---准备写入文件-build.js---");
                                    var $html = addDefaultTemplate(marked(oneShot), filename);
                                    fs.writeFile(writepath, $html, function (err) {
                                        if (err) {
                                            return console.error(err);
                                        }
                                        fileLength=fileLength+1;
                                        if(fileLength==global.flashBackLength){
                                            console.log("`            @               ;'      #@@@,                 ;'         \n`   `@@@@@@ #@`              @@      @@@@@#                @@         \n`   ,@@@@@. @@`              @@     .@@  @@                @@         \n`   '@#     @@    @@@   @@. `@@@@   :@@  @@    @@@    @@; `@@  @      \n`   @@@@@#  @@  #@@@@``@@@@ ,@@@@@  #@@@@@   #@@@@` ,@@@@.,@# @@:     \n`   @@@@@# `@@ .@@`@@ .@@   +@# @@  @@@@@@@ .@@`@@  @@    '@@@@,      \n`   @@`    .@# #@' @@  @@@, @@` @@  @@`  @@ #@' @@ .@@    @@@@@       \n`   @@     '@' #@: @@    @@ @@` @@  @@  ,@@ #@: @@ .@@    @@'@@.      \n`  `@@     #@, ,@@@@@ @@@@+ @@  @@  @@@@@@@ ,@@@@@  @@@@@ @@ .@@      \n`   @:      @   ,@`@`  @@   ##  @,  @@@@@    ,@`@`   #@@  #'  @,  ")
                                            console.log("构建完成了，你很棒棒哦");
                                        }

                                    });
                                }
                            })
                        }
                        if (isDir) {
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
};
function mkdirPath(nisepath, types) {
    //拼凑文件路径
    var pat = "";
    var mineArray = nisepath.split(".");
    if (types == "html") {
        mineArray[0] = pinyin.getFullChars(mineArray[0]);
        mineArray[1] = ".html";
        var honPath = "";
        _.each(mineArray, function (items) {
            honPath = honPath + items;
        })
        var creatPath = "./output/" + honPath;
        createFolder(creatPath);
        return creatPath
    } else if ("json") {
        mineArray[1] = ".json";

    };

};
function createFolder(to) { //文件写入
    var sep = path.sep
    var folders = path.dirname(to).split(sep);
    var p = '';
    while (folders.length) {
        p += folders.shift() + sep;
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);

        }
    }
};
function addDefaultTemplate(userTpl, name) {//为创建的文件添加固定的模板
    var tpl = swig.compileFile("./build.html");
    var bsTpl = buildSide.readFile();
    var renderedHtml = tpl({
        vars: userTpl,
        borderSide: bsTpl.menuHtml,
        topTitle:bsTpl.topHtml,
        titles:(name.split("."))[0]
    });

    return renderedHtml;
}




