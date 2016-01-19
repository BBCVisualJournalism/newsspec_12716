define(['lib/news_special/bootstrap'], function (news) {

    var ScrollListenerController = function () {

        /*
         *	variables
        */
        // this.scrollClassListeners = [];

        // --------------------------------------------------------------------
        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

        // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

        // MIT license

        (function() {
            var lastTime = 0;
            var vendors = ['ms', 'moz', 'webkit', 'o'];
            for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                           || window[vendors[x]+'CancelRequestAnimationFrame'];
            }
         
            if (!window.requestAnimationFrame)
                window.requestAnimationFrame = function(callback, element) {
                    var currTime = new Date().getTime();
                    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                      timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
         
            if (!window.cancelAnimationFrame)
                window.cancelAnimationFrame = function(id) {
                    clearTimeout(id);
                };
        }());
        // --------------------------------------------------------------------
        

        //add scroll listener
        this.throttle("scroll", "optimizedScroll");

    };

    ScrollListenerController.prototype = {

        throttle: function (type, eventName, obj) {

            var obj = obj || window;
            var running = false;
            var func = function() {
                if (running) { return; }
                running = true;

                var scrollEvent;
                if(document.createEvent) {
                    scrollEvent = document.createEvent('HTMLEvents');
                    scrollEvent.initEvent(eventName, true, true);
                    // args: string type, boolean bubbles, boolean cancelable
                } else if (document.createEventObject) {
                    // IE < 9
                    scrollEvent = document.createEventObject();
                    scrollEvent.eventType = eventName;
                }
                scrollEvent.eventName = eventName;
                    



                requestAnimationFrame(function() {
                    // if(document.createEventObject) {
                    //     obj.fireEvent(scrollEvent);
                    // } else {
                    //     obj.dispatchEvent(scrollEvent);
                    // }

                    if(obj.dispatchEvent) {
                        obj.dispatchEvent(scrollEvent);
                    } else if (obj.fireEvent && htmlEvents['on' + eventName]) {// IE < 9
                        obj.fireEvent('on'+scrollEvent.eventType, scrollEvent);// can trigger only real event (e.g. 'click')
                    } else if (obj[eventName]) {
                        obj[eventName]();
                    } else if (obj['on'+eventName]) {
                        obj['on'+eventName]();
                    }

                    running = false;
                });
            };
            if (obj.addEventListener) obj.addEventListener(type, func);
        }

    };

    return ScrollListenerController;
});
