var TextFrame = function (framename, layer) {
    var name = framename;
    var css = document.createElement('style');
    var size = {
        ratio_min: 0,
        ratio_max: 1,
        dx_min: 0,
        dy_min: 0            
    }, margin = {
        top: 1,
        left: 1,
        right: 2,
        bottom: 2,
        topR: 0,
        leftR: 0,
        rightR: 0,
        bottomR: 0
    }, padding = {
        top: 1,
        left: 1.75,
        right: 1.75,
        bottom: 1
    }
    var visible = false;
    var x, dx, dy;
    var x0, y0, dx0, dy0;
    var y, textBottom;
    var text = "";
    var w_start = new Array();
    var w_end = new Array();
    var w_format = new Array();
    var w_length = 0;
    var words_in_page = 0;
    var w_offset = 0;
    var w_nextpage;
    var fontSize = 40.0;
    var fontStep = 1.01;
    var pcss = false;
    var pageStart = new Array();
    var currentPage = 0;
    var resizing = true;
    var target_off = -1, target_nxt;

    renderPage = function () {
        if(!visible) return;

        var scrDX = document.documentElement.clientWidth;
        var scrDY = document.documentElement.clientHeight;

        var ml = margin.left + Math.round(margin.leftR * scrDX / 1000);
        var mr = margin.right + Math.round(margin.rightR * scrDX / 1000);
        var mt = margin.top + Math.round(margin.topR * scrDY / 1000);
        var mb = margin.bottom + Math.round(margin.bottomR * scrDY / 1000);

        dx0 = scrDX - ml - mr;
        dy0 = scrDY - mt - mb;
        if(dx0 < size.dx_min) dx0 = size.dx_min;
        if(dy0 < size.dy_min) dy0 = size.dy_min;
        x0 = ml + ((scrDX - dx0 - ml - mr) >> 1);
        y0 = mt;

        var fontsz = Math.max(dx0, dy0) / fontSize;

        var pl = Math.round(fontsz * padding.left);
        var pr = Math.round(fontsz * padding.right);
        var pt = Math.round(fontsz * padding.top);
        var pb = Math.round(fontsz * padding.bottom);

        dx = dx0 - pl - pr;
        dy = dy0 - pt - pb;
        x = x0 + pl;
        y = y0 + pt;
        textBottom = y + dy;

        Outer.style.left = x0 + "px";
        Outer.style.top = y0 + "px";
        Outer.style.width = dx0 + "px";
        Outer.style.height = dy0 + "px";
        Inner.style.left = x + "px";
        Inner.style.top = y + "px";
        Inner.style.width = dx + "px";
        Inner.style.height = dy + "px";

        PgUp.style.left = x0 + "px";
        PgDn.style.left = x0 + dx + "px";
        PgUp.style.top = PgDn.style.top = y0 + "px";
        PgUp.style.width = dx0 - dx - x + "px"; 
        PgDn.style.width = x - x0 + "px";
        PgUp.style.height = PgDn.style.height = dy0 + "px";
		PgDn.style.left = x + dx + "px";


        if(resizing){

            if(pcss){
            	var sheetToBeRemoved = document.getElementById(name+"_pcss");
        		var sheetParent = sheetToBeRemoved.parentNode;
        		sheetParent.removeChild(sheetToBeRemoved);
            }
        	var psheet = document.createElement('style');
        	psheet.innerHTML =
        	"div#" + innerName + " { font-size:" + fontsz + "px; }";
            console.log(fontsz);
        	psheet.setAttribute("id", name+"_pcss");
        	document.head.appendChild(psheet);
        	pcss = true;

            if(target_off > -1) {

                w_offset = 0, currentPage = 0;
                var olap = 0, target = (target_nxt - target_off) / 2;

                renderText();

                olap = overlap(target_off, target_nxt, w_offset, w_nextpage);

                while(olap < target && olap < (w_nextpage - w_offset)) {
                    nextPage();
                    olap = overlap(target_off, target_nxt, w_offset, w_nextpage);
                }
            }
        }

        renderText();
    }

    function overlap(a1, b1, a2, b2) {
        var max_a = (a1 > a2) ? a1 : a2;
        var min_b = (b1 < b2) ? b1 : b2;
        var overlap = min_b - max_a + 1;
        if(overlap < 0) return 0;
        return overlap;
    }


    resizePage = function () {
        resizing = true;
        renderPage();
        resizing = false;
    }

    showPage = function () {
        if(visible) return;
        Inner.style.display = "block";
        Outer.style.display = "block";
        PgUp.style.display = "block";
        PgDn.style.display = "block";
        visible = true;
        renderPage();
    }

    hidePage = function () {
        if(!visible) return;
        Inner.style.display = "none";
        Outer.style.display = "none";
        PgUp.style.display = "none";
        PgDn.style.display = "none";
        visible = false;
    }

    setPageText = function (inputtext) {
        text = inputtext;

        var i = 0, n = 0;
        var space = true, tag = false;
        var opentags = 0, formatStart = 0;
        
        for(i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            
            if(c == '<') {
                i++; c = text.charAt(i);
                
                if(c == '/') {
                    if(!space) {
                        if(text.charAt(i + 1) == 'p' &&
                            text.charAt(i + 2) == '>') {
                                w_end[n] = i - 1;
                                space = true;
                                n++;
                        }
                    }   // </p> means end of word
                    opentags--;
                }   // closing tag
                else {
                    if(opentags == 0) {
                        formatStart = i - 1;
                    }
                    opentags++;
                }   // opening tag
                
                do {
                    i++; c = text.charAt(i);
                    if(c == '/')
                        if(text.charAt(i + 1) == '>')
                            opentags--;
                } while(c != '>');
            }   // tag processing
            
            else {
                if(c == ' ' || c == '—' || c == '-' || c == '\r' || c == '\n') {
                    if(!space) {
                        w_end[n] = i;
                        space = true;
                        n++;
                    }
                }
                else {
                    if(space) {
                        w_start[n] = i;
                        w_format[n] = formatStart;
                        space = false;
                    }
                }
            }   // not a tag, process words and spaces
        }
        w_length = n;
        
    }

    function renderText() {
        var step = 256, rect;
        if(words_in_page > 0) step = words_in_page;

        Inner.style.top = y + "px";
        if(w_format[w_offset] < w_start[w_offset]) {
            var text_overhead = "<a id='" + hideName + "1'>" +
                text.substring(w_format[w_offset],w_start[w_offset]) +
                "</a><a id='" + hideName + "2'>" +
                text.substring(w_start[w_offset], w_end[w_offset]) +
                "</a>";
            Inner.innerHTML = text_overhead;
            var overhead =
                document.getElementById(hideName + "2").getBoundingClientRect().top -
                document.getElementById(hideName + "1").getBoundingClientRect().top;
            Inner.style.top = y - overhead + "px";
        }

        var first = w_offset, last = w_offset + step;
        while(isWordVisible(last)) {
            first = last; last += step;
        }
        if(last > w_length) last = w_length;
        while(last - first > 1) {
            step = (last - first) >> 1;
            var i = first + step;
            if(isWordVisible(i))
                first = i;
            else last = i;
        }
        trimTextBy(last);
        w_nextpage = last;
        words_in_page = w_nextpage - w_offset;
    }

    function isWordVisible(word) {
        if(word >= w_length) return false;
        trimTextBy(word);
        if(document.getElementById(hideName).
            getBoundingClientRect().bottom < textBottom) return true;
        return false;
    }
 
    function trimTextBy(word) {
        var txt = "";
        if(w_format[w_offset] < w_start[w_offset]) {
            txt += "<a style='visibility:hidden;'>" +
            text.substring(w_format[w_offset],w_start[w_offset]) + "</a>";
        }
        if(word < w_length) {
            txt += text.substring(w_start[w_offset], w_start[word]) +
                "<a id='" + hideName + "'>" +
                text.substring(w_start[word], w_end[word]) +
                "</a>";
        }
        else txt += text.substring(w_start[w_offset]);
        Inner.innerHTML = txt;
    }
  
    nextPage = function() {
        if(w_nextpage >= w_length) return;
        pageStart[currentPage] = w_offset;
        currentPage++;
        w_offset = w_nextpage;

        renderText();
        if(resizing) return;
        target_off = w_offset; target_nxt  = w_nextpage;
    }

    prevPage = function () {
        if(w_offset == 0) return;
        currentPage--;
        w_offset = pageStart[currentPage];
        renderText();
        if(resizing) return;
        target_off = w_offset; target_nxt  = w_nextpage;
    }

//------------------initialization
	var innerName = name;
	var outerName = name + "_out";
	var pgUpName = name + "_pgup";
	var pgDnName = name + "_pgdn";
	var hideName = name + "_hide";

    Main.innerHTML += "<div id='" + innerName + "'></div>" + "\n";
    Main.innerHTML += "<div id='" + outerName + "'></div>" + "\n";
    Main.innerHTML += "<div id='" + pgUpName + "'></div>" + "\n";
    Main.innerHTML += "<div id='" + pgDnName + "'></div>" + "\n";
    var Inner = document.getElementById(innerName);
    var Outer = document.getElementById(outerName);
    var PgUp = document.getElementById(pgUpName);
    var PgDn = document.getElementById(pgDnName);
    
    var sheet = document.createElement('style');
    sheet.innerHTML =
    	"div#" + innerName +
    	"{ position:absolute; z-index:" + (layer + 1) +
        "; overflow: visible; border: 0; display: none; }\n" +
    	"div#" + outerName +
    	"{ position:absolute; z-index:" + layer +
        "; border: 1px solid; display: none; }\n" +
    	"div#" + pgUpName +
    	"{ position:absolute; z-index:" + (layer + 1) +
        "; border: 0; display: none; }\n" +
    	"div#" + pgDnName +
    	"{ position:absolute; z-index:" + (layer + 1) +
        "; border: 0; display: none; }\n" +
    	"div#" + pgUpName + ":hover " +
    	"{ background: linear-gradient(90deg, rgba(0,0,0,0.075) 0%, rgba(0,0,0,0) 100%); }\n" + 
    	"div#" + pgDnName + ":hover " +
    	"{ background: linear-gradient(270deg, rgba(0,0,0,0.075) 0%, rgba(0,0,0,0) 100%); }\n" + 
    	"div#" + pgUpName + ":active " +
    	"{ background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%); }\n" + 
    	"div#" + pgDnName + ":active " +
    	"{ background: linear-gradient(270deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%); }\n" +
    	"a#" + hideName + " { visibility: hidden; }";
    sheet.setAttribute("id", name+"css");
    document.body.appendChild(sheet);

    window.addEventListener("resize", resizePage);
    PgDn.addEventListener("click", nextPage);
    PgUp.addEventListener("click", prevPage);
    window.addEventListener("keydown", navKeys);
    
    function navKeys() {
        var key = event.key;
        if(key == "PageDown") nextPage();
        if(key == "PageUp") prevPage();
        if(key == "+") fontUp();
        if(key == "-") fontDown();
        
    }
    
    function fontUp() {
        if(!visible) return;
        fontSize /= fontStep;
        renderPage();
    }

    function fontDown() {
        if(!visible) return;
        fontSize *= fontStep;
        renderPage();
    }


    return {
        show: showPage,
        hide: hidePage,
        setText: setPageText
    }
}