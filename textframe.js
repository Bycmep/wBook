var TextFrame = function (framename, layer) {
        var name = framename,
            size = {
                ratio_min: 0,
                ratio_max: 1,
                dx_min: 0,
                dy_min: 0
            },
            
            visible = false,
            x,
            dx,
            dy,
            x0,
            y0,
            dx0,
            dy0,
            y,
            textBottom,
            text = "",
            words_in_page = 0,
            w_offset = 0,
            w_nextpage,
            fontSize = 40.0,
            fontStep = 1.01,
            pcss = false,
            pageStart = [],
            currentPage = 0,
            resizing = true,
            target_off = -1,
            target_nxt,
            

            
    
        

        
    
        function resizePage() {
            resizing = true;
            renderPage();
            resizing = false;
        }

    
    

        window.addEventListener("resize", resizePage);
        PgDn.addEventListener("click", nextPage);
        PgUp.addEventListener("click", prevPage);
        window.addEventListener("keydown", navKeys);

        
        function overlap(a1, b1, a2, b2) {
            var max_a = (a1 > a2) ? a1 : a2,
                min_b = (b1 < b2) ? b1 : b2,
                over = min_b - max_a + 1;
            if (over < 0) {
                return 0;
            }
            return over;
        }



        function hidePage() {
            if (!visible) {
                return;
            }
            Inner.style.display = "none";
            Outer.style.display = "none";
            PgUp.style.display = "none";
            PgDn.style.display = "none";
            visible = false;
        }

        

        function renderText() {
            var step = 256,
                rect,
                first = w_offset,
                last = w_offset + step;
            
            if (words_in_page > 0) {
                step = words_in_page;
            }

            Inner.style.top = y + "px";
            if (w_format[w_offset] < w_start[w_offset]) {
                var text_overhead = "<a id='" + hideName + "1'>" +
                    text.substring(w_format[w_offset], w_start[w_offset]) +
                    "</a><a id='" + hideName + "2'>" +
                    text.substring(w_start[w_offset], w_end[w_offset]) +
                    "</a>";
                Inner.innerHTML = text_overhead;
                var overhead =
                    document.getElementById(hideName + "2").getBoundingClientRect().top -
                    document.getElementById(hideName + "1").getBoundingClientRect().top;
                Inner.style.top = y - overhead + "px";
            }

            while (isWordVisible(last)) {
                first = last;
                last += step;
            }
            if (last > w_length) {
                last = w_length;
            }
            while (last - first > 1) {
                step = Math.floor(last - first);
                var i = first + step;
                if (isWordVisible(i)) {
                    first = i;
                } else {
                    last = i;
                }
            }
            trimTextBy(last);
            w_nextpage = last;
            words_in_page = w_nextpage - w_offset;
        }

        function isWordVisible(word) {
            if (word >= w_length) {
                return false;
            }
            trimTextBy(word);
            if (document.getElementById(hideName).getBoundingClientRect().bottom < textBottom) {
                return true;
            }
            return false;
        }

        function trimTextBy(word) {
            var txt = "";
            if (w_format[w_offset] < w_start[w_offset]) {
                txt += "<a style='visibility:hidden;'>" + text.substring(w_format[w_offset], w_start[w_offset]) + "</a>";
            }
            if (word < w_length) {
                txt += text.substring(w_start[w_offset], w_start[word]) + "<a id='" + hideName + "'>" + text.substring(w_start[word], w_end[word]) + "</a>";
            } else {
                txt += text.substring(w_start[w_offset]);
            }
            Inner.innerHTML = txt;
        }

        function nextPage() {
            if (w_nextpage >= w_length) {
                return;
            }
            pageStart[currentPage] = w_offset;
            currentPage += 1;
            w_offset = w_nextpage;

            renderText();
            if (resizing) {
                return;
            }
            target_off = w_offset;
            target_nxt  = w_nextpage;
        }

        function prevPage() {
            if (w_offset === 0) {
                return;
            }
            currentPage -= 1;
            w_offset = pageStart[currentPage];
            renderText();
            if (resizing) {
                return;
            }
            target_off = w_offset;
            target_nxt  = w_nextpage;
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

        function fontUp() {
            if (!visible) {
                return;
            }
            fontSize /= fontStep;
            renderPage();
        }

        function fontDown() {
            if (!visible) {
                return;
            }
            fontSize *= fontStep;
            renderPage();
        }

        return {
            show: showPage,
            hide: hidePage,
        };
    };