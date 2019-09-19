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