//function to keep everything in local scope
(function() {
  var menu = document.getElementById('menu');
  var close = document.getElementById('close');
  menu.addEventListener('click', function(){
    document.getElementsByClassName('sidemenu')[0].classList.add('move');
  });
  close.addEventListener('click', function() {
    document.getElementsByClassName('sidemenu')[0].classList.remove('move');
  })

})();
