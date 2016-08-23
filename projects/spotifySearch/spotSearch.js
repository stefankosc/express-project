//function to keep everything in local scope
(function() {
    var button = $('button');
    var nameField = $('#inputField');
    var typeField = $('select');
    var body = $('body');
    var container = $('#container');
    var res = $('#res');
    var name;
    var type;
    var bodyHeight = '';
    var windowHeight = '';
    var bodyscrollTop = '';
    var timer;

    button.on('click', function searchFor() {
        name = encodeURIComponent(nameField.val());
        type = typeField.val();
        getRecords();
        container.empty();
    });

    function getRecords(url) {
        if (!url) {
            url = 'https://api.spotify.com/v1/search?q='+ name +'&type=' + type;
        }
        clearTimeout(timer)
        $.get(url, function(data) {

            data = data[type + 's'];
            var rec = data.items;
            var next = data.next;
            $('#more').remove();
            if (!rec || !rec.length) {
                res.html('No results');
                return;
            }
            res.html('Results for ' + '"' + name + '"');
            for (var item in rec) {
                var images = rec[item].images;
                var img = images[0];
                if (!img) {
                    img = {
                        url: 'kit1.jpg'
                    }
                }
                container.append('<img src='+ img.url +'>');
                container.append('<div class="description">' + rec[item].name + '</div>');
            }
            timer = setTimeout(scro, 100);
            function scro() {
                bodyHeight = $(document).height();
                windowHeight = $(window).height();
                bodyscrollTop = $('body').scrollTop();
                console.log(bodyHeight,windowHeight,bodyscrollTop);
                if (bodyscrollTop > bodyHeight - windowHeight- 200) {
                    console.log('yes');
                    getRecords(next);
                    container.append('<img src='+ img.url +'>');
                    container.append('<div class="description">' + rec[item].name + '</div>');
                } else {
                    setTimeout(scro, 2000);
                };
            };
            scro();
            //$('<button id="more">more</button>').on('click', function () {
            //    get(next);
            //}).appendTo(container);
        })
    }
})();
