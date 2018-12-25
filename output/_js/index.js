$(document).ready(function () {
    onShow();
    initDefultLinkEvent();

    function onShow() {
        //1.获取屏幕高度，为了布局使用
        var mineHeight=document.documentElement.clientHeight;
        $(".ddf-main-page").css("height",mineHeight-80+"px");
        $(".users-md").css("height",mineHeight-140+"px");
        //2.判断是否有参数
        var page = segmentation("page");
        if (page) {
            initDefultTapEvent(page);
        } else {
            initDefultTapEvent();
        }
    }


    function segmentation(name) {//
        var status = false;
        var url = (window.location.href).split("?")[1];
        if (url == undefined) {
            return
        }
        var fontArray = url.split("&");//array
        if (fontArray == undefined) {
            return
        }
        var obArray = [];
        for (var t = 0; t < fontArray.length; t++) {
            var ll = fontArray[t].split("=");
            var objects = {
                name: ll[0],
                value: ll[1]
            };
            obArray.push(objects);
        }
        for (var i = 0; i < obArray.length; i++) {
            if (name == (obArray[i].name)) {
                var the_value = obArray[i].value;
                status = true;

            }
        }
        if (status) {
            return the_value;
        } else {
            return "";
        }

    }
    function initDefultLinkEvent() {//绑定跳转事件
        $(".bs-li").on("click", function (e) {
            var link = e.currentTarget.getAttribute('data-link');
            var url = "./" + link + ".html?page=" + link;
            window.location.href = url;
        })
    }

    function initDefultTapEvent(name) {//绑定顶部tab切换的相关事件
        if (!name) {
            $($(".topTitleBox")[0]).addClass("ddf-active-tap");//默认显示第一个tap里的内容
            //依据tap的状态初始化第一次broadSide内容块的显隐
            var acTap = $($(".topTitleBox")[0])
            var symbols = acTap.attr("data-children");
            $(".border-side").children().hide();
            $("." + symbols).show();
            $($(".bs-li")[0]).css("color","#66ccff");
        } else {
            //name最低级为文件名，我们根据此完成tab的渲染，这种情况发生在页面跳转后
            var tl = $(".bs-li[data-link=" + name + "]").parent().parent().attr("class");
            var newAcTap = $(".topTitleBox[data-children=" + tl + "]");
            newAcTap.addClass("ddf-active-tap");
            $(".border-side").children().hide();
            $("." + tl).show();
            $(".bs-li[data-link="+name+"]").css("color","#66ccff");
        }
        //为顶部tab绑定点击事件
        $(".topTitleBox").on("click", function (e) {
            if ($(e.currentTarget).hasClass("ddf-active-tap")) { } else {
                var classes = $(e.currentTarget).attr("data-children");
                var names = $($("." + classes + " ul li")[0]).attr("data-link");
                var url = "./" + names + ".html?page=" + names;
                window.location.href = url;
            }

        })

    }
});


