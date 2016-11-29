// `Libraries
//------------------------------------------------------------------------------

//= require lib/jquery-2.2.2.min.js
//= require lib/Sortable.js
//= require lib/handlebars-v1.3.0.js
//= require lib/jquery.serialize-object.js
//= require lib/localstore_and_sessionstore.js
//= require lib/jquery.tap.js

// `Modules
//------------------------------------------------------------------------------

//= require modules/minion.js
//= require modules/minion.modal.js


// `Raw code
//------------------------------------------------------------------------------

$(document).ready(function() {
  Minion.on('tap.show_panel', '.toggle-panel', function(e) {
    e.preventDefault();
    showPanel(togglePanel);
  });

});

function showPanel(callback) {
    var source = $('#choose-actor-type').html();
    var template = Handlebars.compile(source);
    var context = {};
    var html = template(context);

    $('#panel-body').html(html);

    if (callback) {
      callback();
    }
}

function togglePanel() {
  $('#panel').toggleClass('active');
}