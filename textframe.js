/* global document */
function Reader(readerid) {
    'use strict';
    var main;               // main text frame
    
    function TextFrame(frameid, layer) {
        var e,
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
            text,
            y,
            dy,
            offset,
            nxtpage,
            wordsInPage,
            fontSize = 40,
            fontStep = 1.01,
            fontSizePx,
            currentPage,
            pageStart = [],
            targetOffset,
            targetNxt;
        
        function FrameElements() {
            var Main,
                Inner,
                Outer,
                PgUp,
                PgDn,

                innerName = frameid,
                outerName = frameid + "_out",
                pgUpName = frameid + "_pgup",
                pgDnName = frameid + "_pgdn",
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
            sheet.innerHTML = "div#" + innerName + "{ position:absolute; z-index:" + (layer + 1) + "; overflow: visible; border: 0; }\n" +
                "div#" + outerName + "{ position:absolute; z-index:" + layer + "; border: 1px solid; }\n" +
                "div#" + pgUpName + "{ position:absolute; z-index:" + (layer + 1) + "; border: 0; }\n" +
                "div#" + pgDnName + "{ position:absolute; z-index:" + (layer + 1) + "; border: 0; }\n" +
                "div#" + pgUpName + ":hover " + "{ background: linear-gradient(90deg, rgba(0,0,0,0.075) 0%, rgba(0,0,0,0) 100%); }\n" +
                "div#" + pgDnName + ":hover " + "{ background: linear-gradient(270deg, rgba(0,0,0,0.075) 0%, rgba(0,0,0,0) 100%); }\n" +
                "div#" + pgUpName + ":active " + "{ background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%); }\n" +
                "div#" + pgDnName + ":active " + "{ background: linear-gradient(270deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%); }";
            sheet.setAttribute("id", frameid + "_css");
            document.head.appendChild(sheet);

            return {
                Inner: Inner,
                Outer: Outer,
                PgUp: PgUp,
                PgDn: PgDn
            };
        }
        e = new FrameElements();

        function positionPage() {
            var scrDX,
                scrDY,
                dx0,
                dy0,
                x0,
                y0,
                dx,
                x,
                paddingTop,
                paddingBottom,
                paddingLeft,
                paddingRight;
        
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
        }
        
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
                src: src,
                text: text,
                start: start,
                end: end,
                format: format,
                length: length
            };
        }
        function setText(input) {
            text = new ParsedText(input);
            offset = 0;
            currentPage = 0;
        }
        
        function trimTextBy(word) {
            var txt = "";
            if (text.format[offset] < text.start[offset]) {
                txt += "<a style='visibility:hidden;'>" + text.src.substring(text.format[offset], text.start[offset]) + "</a>";
            }
            if (word < text.length) {
                txt += text.src.substring(text.start[offset], text.start[word]) + "<a id='" + frameid + "tmp' style='visibility:hidden;'>" + text.src.substring(text.start[word], text.end[word]) + "</a>";
            } else {
                txt += text.src.substring(text.start[offset]);
            }
            e.Inner.innerHTML = txt;
        }
        
        function isWordVisible(word) {
            if (word >= text.length) {
                return false;
            }
            trimTextBy(word);
            
            if (document.getElementById(frameid + "tmp").getBoundingClientRect().bottom < y + dy) {
                return true;
            }
            return false;
        }
        
        function renderText() {
            var textOverhead,
                overhead,
                first,
                last,
                step,
                i;
            
            e.Inner.style.top = y + "px";
            if (text.format[offset] < text.start[offset]) {
                textOverhead = "<a id='" + frameid + "tmp1'>" +
                    text.src.substring(text.format[offset], text.start[offset]) +
                    "</a><a id='" + frameid + "tmp2'>" +
                    text.src.substring(text.start[offset], text.end[offset]) +
                    "</a>";
                e.Inner.innerHTML = textOverhead;
                overhead = document.getElementById(frameid + "tmp2").getBoundingClientRect().top -
                    document.getElementById(frameid + "tmp1").getBoundingClientRect().top;
                e.Inner.style.top = y - overhead + "px";
            }

            first = offset;
            step = (wordsInPage > 0) ? wordsInPage : 256;
            last = offset + step;
            while (isWordVisible(last)) {
                first = last;
                last += step;
            }
            if (last > text.length) {
                last = text.length;
            }
            while (last - first > 1) {
                i = Math.floor((first + last) / 2);
                if (isWordVisible(i)) {
                    first = i;
                } else {
                    last = i;
                }
            }
            trimTextBy(last);
            nxtpage = last;
            if (nxtpage < text.length) {
                wordsInPage = nxtpage - offset;
            }
        }

        function renderPage() {
            var fontSizeSheet,
                fontSizeSheetParent,
                olap2;
            
            function overlap(a1, b1, a2, b2) {
                var max_a = (a1 > a2) ? a1 : a2,
                    min_b = (b1 < b2) ? b1 : b2,
                    over = min_b - max_a + 1;
                if (over < 0) {
                    return 0;
                }
                return over;
            }
            
            fontSizeSheet = document.getElementById(frameid + "_pcss");
            if (fontSizeSheet !== null) {
                fontSizeSheetParent = fontSizeSheet.parentNode;
                fontSizeSheetParent.removeChild(fontSizeSheet);
            }
            fontSizeSheet = document.createElement('style');
            fontSizeSheet.innerHTML = "div#" + frameid + " { font-size:" + fontSizePx + "px; }";
            fontSizeSheet.setAttribute("id", frameid + "_pcss");
            document.head.appendChild(fontSizeSheet);

            if (offset > 0) {
                offset = 0;
                currentPage = 0;
                
                while (true) {
                    renderText();
                    olap2 = overlap(targetOffset, targetNxt, offset, nxtpage) * 2;
                    console.log(olap2 + ": " + offset + "-" + nxtpage + " -> " + targetOffset + "-" + targetNxt);
                    if (olap2 >= (targetNxt - targetOffset) || olap2 >= (nxtpage - offset)) {
                        break;
                    }
                    pageStart[currentPage] = offset;
                    currentPage += 1;
                    offset = nxtpage;
                }
            } else {
                renderText();
            }
        }
        
        function nextPage() {
            if (nxtpage >= text.length) {
                return;
            }
            pageStart[currentPage] = offset;
            currentPage += 1;
            offset = nxtpage;
            renderText();
            targetOffset = offset;
            targetNxt = nxtpage;
        }

        function prevPage() {
            if (offset === 0) {
                return;
            }
            currentPage -= 1;
            offset = pageStart[currentPage];
            renderText();
            targetOffset = offset;
            targetNxt = nxtpage;
        }
        
        function onResize() {
            positionPage();
            renderPage();
        }
        
        function fontUp() {
            fontSize /= fontStep;
            positionPage();
            renderPage();
        }

        function fontDown() {
            fontSize *= fontStep;
            positionPage();
            renderPage();
        }
        
        function navKeys() {
            var key = event.key;
            switch (key) {
            case "PageDown":
                nextPage();
                break;
            case "PageUp":
                prevPage();
                break;
            case "+":
                fontUp();
                break;
            case "-":
                fontDown();
                break;
            }
        }

        
        window.addEventListener("resize", onResize);
        e.PgDn.addEventListener("click", nextPage);
        e.PgUp.addEventListener("click", prevPage);
        window.addEventListener("keydown", navKeys);
        
        return {
            position: positionPage,
            setText: setText,
            renderText: renderText,
            renderPage: renderPage,
            nextPage: nextPage,
            prevPage: prevPage
        };
    }
    main = new TextFrame(readerid, 90);
    
    function run() {
        main.position();
        main.renderPage();
        
        
    }

    
    return {
        setText: main.setText,
        run: run
    };

}