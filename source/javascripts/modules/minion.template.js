/*
  DO NOT ACTUALLY USE THIS FILE AS-IS.

  IT IS MEANT AS A TEMPLATE FOR NEW FILES.
*/

// JSLint settings:
/*global
  alert,
  clearTimeout,
  console,
  jQuery,
  setTimeout
*/

var Minion = Minion || {};

Minion.example = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  // Expose innards.
  return {
    //=================
    // Minion.example.util
    //=================
    util: {
      // Minion.example.util.something
      something: function() {
        /*
          You could call this as needed, but it
          wouldn't be auto-called by Minion.init()
        */
      }
    },
    //=================
    // Minion.example.init
    //=================
    init: {
      /*
        Any functions added to the module's
        `init` object will automatically be
        called via the Minion.init() method.
      */

      // Minion.example.init.foobar
      foobar: function() {
        // Namespaced event.
        var event = 'click.rwd_example_init_foobar';

        // Element selectors.
        var str = [
          'a.class-name-1',
          'a.class-name-2',
          'a.class-name-3'
        ];

        // Event handler.
        Minion.on(event, str, function(e) {
          Minion.log('A link was clicked');

          /*
            e.preventDefault() is not necessary if
            a link doesn't have a real href value.

            <a href="#">Not needed</a>

             <a href="">Not needed</a>

                     <a>Not needed</a>
          */
          e.preventDefault();
        });
      },

      // Canary in the coal mine, to check
      // if the init object was picked up.
      test: function() {
        Minion.log('EXAMPLE: TEST');
      }
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);