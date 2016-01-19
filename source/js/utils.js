define(['lib/news_special/bootstrap'], function (news) {

    isElementInViewport = function(el) {
        // console.log('checking isElementInViewport', el[0], window.innerHeight || document.documentElement.clientHeight);
        var rect = el[0].getBoundingClientRect(),
            winWidth = (window.innerWidth || document.documentElement.clientWidth),
            winHeight = (window.innerHeight || document.documentElement.clientHeight),
            visibilityMargin = 80;

        /* fully
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );*/

        return (
            rect.top >= -rect.height + visibilityMargin &&
            //rect.left >= 0 &&
            rect.bottom <= (winHeight + rect.height - visibilityMargin) /*&&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)*/
        );
    }

    isTouchDevice = function() {
        return 'ontouchstart' in window // works on most browsers
            || 'onmsgesturechange' in window; // works on ie10
    }


    return {
        isElementInViewport : isElementInViewport,
        isTouchDevice : isTouchDevice
    }
});
