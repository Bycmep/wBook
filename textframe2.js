/* global document */
function TextFrame(name, layer) {
    'use strict';
    var e,                  // elements
        text,                // frame text
        page;               // page properties

    function FrameElements() {
        var Main,
            Inner,
            Outer,
            PgUp,
            PgDn,

            innerName = name,
            outerName = name + "_out",
            pgUpName = name + "_pgup",
            pgDnName = name + "_pgdn",
            hideName = name + "_hide",
            sheet = document.createElement('style');

        Main = document.getElementById("_main");
        Main.innerHTML += "<div id='" + innerName + "'></div>" + "\n";
        Main.innerHTML += "<div id='" + outerName + "'></div>" + "\n";
        Main.innerHTML += "<div id='" + pgUpName + "'></div>" + "\n";
        Main.innerHTML += "<div id='" + pgDnName + "'></div>" + "\n";
        Inner = document.getElementById(innerName);
        Outer = document.getElementById(outerName);
        PgUp = document.getElementById(pgUpName);
        PgDn = document.getElementById(pgDnName);

        sheet = document.createElement('style');
        sheet.innerHTML = "div#" + innerName + "{ position:absolute; z-index:" + (layer + 1) + "; overflow: visible; border: 0; display: none; }\n" +
            "div#" + outerName + "{ position:absolute; z-index:" + layer + "; border: 1px solid; display: none; }\n" +
            "div#" + pgUpName + "{ position:absolute; z-index:" + (layer + 1) + "; border: 0; display: none; }\n" +
            "div#" + pgDnName + "{ position:absolute; z-index:" + (layer + 1) + "; border: 0; display: none; }\n" +
            "div#" + pgUpName + ":hover " + "{ background: linear-gradient(90deg, rgba(0,0,0,0.075) 0%, rgba(0,0,0,0) 100%); }\n" +
            "div#" + pgDnName + ":hover " + "{ background: linear-gradient(270deg, rgba(0,0,0,0.075) 0%, rgba(0,0,0,0) 100%); }\n" +
            "div#" + pgUpName + ":active " + "{ background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%); }\n" +
            "div#" + pgDnName + ":active " + "{ background: linear-gradient(270deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%); }\n" +
            "a#" + hideName + " { visibility: hidden; }";
        sheet.setAttribute("id", name + "_css");
        document.head.appendChild(sheet);
        
        
        return {
            Inner: Inner,
            Outer: Outer,
            PgUp: PgUp,
            PgDn: PgDn,
            divname: innerName
        };
    }
    e = new FrameElements();

    function ParsedText(input) {
        var src,
            start = [],
            end = [],
            format = [],
            length = 0,
            
            i,
            c,
            n = 0,
            space = true,
            openTags = 0,
            formatStart = 0;

        src = input;

        for (i = 0; i < src.length; i += 1) {
            c = src.charAt(i);

            if (c === '<') {
                i += 1;
                c = src.charAt(i);

                if (c === '/') {
                    if (!space) {
                        if (src.charAt(i + 1) === 'p' && src.charAt(i + 2) === '>') {
                            end[n] = i - 1;
                            space = true;
                            n += 1;
                        }
                    }   // </p> means end of word
                    openTags -= 1;
                } else {
                    if (openTags === 0) {
                        formatStart = i - 1;
                    }
                    openTags += 1;
                }   // opening tag

                do {
                    i += 1;
                    c = src.charAt(i);
                    if (c === '/') {
                        if (src.charAt(i + 1) === '>') {
                            openTags -= 1;
                        }
                    }
                } while (c !== '>');
            } else {
                if (c === ' ' || c === '—' || c === '-' || c === '\r' || c === '\n') {
                    if (!space) {
                        end[n] = i;
                        space = true;
                        n += 1;
                    }
                } else {
                    if (space) {
                        start[n] = i;
                        format[n] = formatStart;
                        space = false;
                    }
                }
            }   // not a tag, process words and spaces
        }
        length = n;
        
        return {
            text: text,
            start: start,
            end: end,
            format: format,
            length: length
        };
    }
    function setText(input) {
        text = new ParsedText(input);
    }
    
    function TextPage() {
        var visible = false,
            margin = {
                top: 1,
                left: 1,
                right: 2,
                bottom: 2
            },
            padding = {
                top: 1,
                left: 1.75,
                right: 1.75,
                bottom: 1
            },
            fontSize,
            resizing = false,
        
        function render() {
            var scrDX,
                scrDY,
                fontSizePx,
                paddingLeft,
                paddingRight,
                paddingTop,
                paddingBottom,
                x0,
                y0,
                dx0,
                dy0,
                x,
                y,
                dx,
                dy,
                textBottom,
                pcss = false,
                fontSizeSheet,
                fontSizeSheetParent;

            if (!visible) {
                return;
            }

            scrDX = document.documentElement.clientWidth;
            scrDY = document.documentElement.clientHeight;
            dx0 = scrDX - margin.left - margin.right;
            dy0 = scrDY - margin.top - margin.bottom;
            x0 = margin.left + Math.round((scrDX - dx0 - margin.left - margin.right) / 2);
            y0 = margin.top;

            fontSizePx = Math.max(dx0, dy0) / fontSize;
            paddingLeft = Math.round(fontSizePx * padding.left);
            paddingRight = Math.round(fontSizePx * padding.right);
            paddingTop = Math.round(fontSizePx * padding.top);
            paddingBottom = Math.round(fontSizePx * padding.bottom);

            dx = dx0 - paddingLeft - paddingRight;
            dy = dy0 - paddingTop - paddingBottom;
            x = x0 + paddingLeft;
            y = y0 + paddingTop;
            textBottom = y + dy;

            e.Outer.style.left = x0 + "px";
            e.Outer.style.top = y0 + "px";
            e.Outer.style.width = dx0 + "px";
            e.Outer.style.height = dy0 + "px";
            e.Inner.style.left = x + "px";
            e.Inner.style.top = y + "px";
            e.Inner.style.width = dx + "px";
            e.Inner.style.height = dy + "px";

            e.PgUp.style.left = x0 + "px";
            e.PgDn.style.left = x0 + dx + "px";
            e.PgUp.style.top = e.PgDn.style.top = y0 + "px";
            e.PgUp.style.width = dx0 - dx - x + "px";
            e.PgDn.style.width = x - x0 + "px";
            e.PgUp.style.height = e.PgDn.style.height = dy0 + "px";
            e.PgDn.style.left = x + dx + "px";

            if (resizing) {

                if (pcss) {
                    fontSizeSheet = document.getElementById(name + "_pcss");
                    fontSizeSheetParent = fontSizeSheet.parentNode;
                    fontSizeSheetParent.removeChild(fontSizeSheet);
                }
                fontSizeSheet = document.createElement('style');
                fontSizeSheet.innerHTML = "div#" + e.divname + " { font-size:" + fontSizePx + "px; }";
                fontSizeSheet.setAttribute("id", name + "_pcss");
                document.head.appendChild(fontSizeSheet);
                pcss = true;

                if (target_off > -1) {

                    w_offset = 0;
                    currentPage = 0;
                    var olap = 0, target = (target_nxt - target_off) / 2;

                    renderText();

                    olap = overlap(target_off, target_nxt, w_offset, w_nextpage);

                    while (olap < target && olap < (w_nextpage - w_offset)) {
                        nextPage();
                        olap = overlap(target_off, target_nxt, w_offset, w_nextpage);
                    }
                }
            }

        renderText();
    }
            
        }

        
        
    }
    page = new TextPage();
    
    
    
    

    function show() {
        if (visible) {
            return;
        }
        Inner.style.display = "block";
        Outer.style.display = "block";
        PgUp.style.display = "block";
        PgDn.style.display = "block";
        visible = true;
        renderPage();
    }
*/
    
    return {
        setText: setText
//        show: show
    };

}