(function() {

    //handlebars
    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });


    var element = $('#ticker');
    var currentPosition = element.position().left;
    var inner = $('#inner');
    var responseText;
    var myreq;
    var data;

    inner.html(Handlebars.templates.hello({
        name: 'World'
    }));

    $.get('links.json', function(data) {
        //do something with data
        insertLinksFromJSON(data);
        step();
    });
    function insertLinksFromJSON(data) {
        /*var html = '';
        for (var url in data) {
            html += '<a href="' + url + '">' + data[url] +'</a>';
        }
        */
        var headlines = [];
        for (var key in data) {
            headlines.push({
                url: key,
                text: data[key]
            })
        }

        element.html(Handlebars.templates.tick({
            headlines: headlines
        }))
        //element.html(html);

    }
    function step () {
        var links;
        links = $('a');

        currentPosition -= 2;

        element.css({
            left: currentPosition +'px'
        });
        var firstWidth = links.eq(1).position().left;

        if (currentPosition < -firstWidth){
            var old = links.eq(0).remove();
    //        leftPadding += firstWidth;
    //        element.style.paddingLeft = leftPadding + 'px';

            currentPosition += firstWidth;

            element.css ({
                left: currentPosition +'px'
            });
            element.append(old);
        }
        myreq = requestAnimationFrame(step);
    }
    element.on('mouseenter', function cancel() {
        cancelAnimationFrame(myreq);
    });
    element.on('mouseleave', function() {
            myreq = requestAnimationFrame(step);
    });




})();
