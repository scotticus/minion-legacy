// JSLint settings:
/*global
  alert,
  clearTimeout,
  console,
  jQuery,
  nm,
  setTimeout
*/

var Minion = Minion || {};

Minion.modal = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  // Expose innards.
  return {
    //=========
    // Minion.util
    //=========
    util: {

      // Minion.modal.util.close
      close: function() {
        $(document.documentElement).removeClass('html-modal-show');

        // Undo width, if any.
        $('.modal').css({
          width: '',
          overflowY: ''
        });

        // Clean up existing content.
        $('.modal-content').find('*').off().end().html('');
      },
      // Minion.modal.util.error
      error: function(o) {
        var message = '<p>An error occurred while processing your request.</p>';
        var width = 350;
        var title = 'Error';

        // Are we dealing with an object?
        if (typeof o === 'object') {
          width = o.width || width;
          title = $.trim(o.title).replace(/\s+/g, ' ') || title;
          message = $.trim(o.message).replace(/\s+/g, ' ');
        }
        // Or is it a string?
        else if (typeof o === 'string') {
          message = o;
        }

        // Does the message contain HTML?
        var not_html = !message.match(/<p>|<ul>/g);

        // Clean up the message.
        if (message && not_html) {
          message = '<p>'+message+'</p>';
        }

        // Build the markup.
        var html = [
          '<h2 class="error-text">',
            title,
          '</h2>',
          message,
          '<p>',
            '<button type="button" class="button-action button-small modal-close">',
              'OK',
            '</button>',
          '</p>'
        ].join('');

        // Fire it off.
        Minion.modal.util.open(html, width);
      },
      // Minion.modal.util.open
      open: function(html, width, callback) {
        // Do some cleanup.
        html = $.trim(html).replace(/\s+/g, ' ');

        // Is there a callback?
        var has_callback = typeof callback === 'function';

        // Show the modal.
        $(document.documentElement).addClass('html-modal-show');
        Minion.modal.util.center(width);
        $('.modal').hide();

        var modal_content = $('.modal-content');

        // Clean up existing content, add new content.
        modal_content.find('*').off().end().html(html);

        // Init quantity widget, if needed.
        if (Minion.forms) {
          Minion.forms.init.amount_widget_markup();
        }

        // Are there images in the content?
        var images = modal_content.find('img');
        var images_length = images.length;
        var counter = 0;

        if (images_length) {
          images.hide().each(function() {
            // Fire event when images load.
            $(this).on('load', function(e) {
              counter++;

              // Have all images loaded?
              if (counter === images_length) {
                images.show();

                $('.modal').show();
                Minion.modal.util.center(width);
                has_callback && callback();
              }
            });
          });
        }
        else {
          $('.modal').show();
          Minion.modal.util.center(width);
          has_callback && callback();
        }
      },
      // Minion.modal.util.center
      center: function(width) {
        var modal = $('.modal:visible:first');

        if (width) {
          modal.css({
            width: width
          });
        }

        // Take measurements.
        var n = -0.5;
        var offset_top = n * modal.outerHeight();
        var offset_left = n * modal.outerWidth();

        var is_mobile = Minion.info.media('mobile');

        if (is_mobile) {
          modal.css({
            marginTop: 0,
            marginLeft: 0
          });
        }
        else {
          modal.css({
            marginTop: offset_top,
            marginLeft: offset_left
          });
        }
      }
    },
    //===============
    // Minion.modal.init
    //===============
    init: {
      // Minion.modal.init.create
      create: function() {
        var modal_exists = $('.modal').length;

        // Don't create unnecessarily.
        if (modal_exists) {
          return;
        }

        // Build some markup.
        var modal_html = [
          // Here, "onclick" is needed for iOS to recognize clicks.
          '<div class="modal-overlay" onclick="javascript:void(0)">',
            '<div class="modal">',
              '<div class="modal-content"></div>',
              '<span class="modal-close-x" title="Close">&times;</span>',
            '</div>',
          '</div>'
        ].join('');

        // Bottom of the page.
        $(document.body).append(modal_html);
      },
      // Minion.modal.init.trigger_content
      trigger_content: function() {
        // Namespaced event.
        var event = 'click.rwd_modal_init_trigger_content';

        // Element selectors.
        var str = [
          'a[data-modal-content]',
          'input[data-modal-content]',
          'button[data-modal-content]'
        ];

        // Event handler.
        Minion.on(event, str, function(e) {
          var el = $(this);
          var x = el.attr('data-modal-content');
          var width = el.attr('data-modal-width');

          // In-page content.
          var div = 'div[data-modal-content="'+x+'"]';
          var html = $(div).html();

          Minion.modal.util.open(html, width);
        });
      },
      // Minion.modal.init.trigger_url
      trigger_url: function() {
        // Namespaced event.
        var event = 'click.rwd_modal_init_trigger_url';

        // Element selectors.
        var str = 'a[data-modal-url]';

        // Event handler.
        Minion.on(event, str, function(e) {
          var el = $(this);
          var x = el.attr('data-modal-url');
          var width = el.attr('data-modal-width');

          // Get ready to Ajax.
          var options = {
            url: x,
            success: function(html) {
              Minion.modal.util.open(html, width);
            },
            error: function() {
              Minion.modal.util.error();
            }
          };

          $.ajax(options);
        });
      },
      // Minion.modal.init.trigger_obj
      trigger_obj: function() {
        // Namespaced event.
        var event = 'click.rwd_modal_init_trigger_obj';

        // Element selectors.
        var str = 'a[data-modal-map-obj]';

        // Event handler.
        Minion.on(event, str, function(e) {
          var el = $(this);
          var width = el.attr('data-modal-width');

          var obj = el.attr('data-modal-map-obj');
          obj = Minion.modals.modalMapper.getMappedValue(obj);

          obj.init(el, Minion.modal.util, width);
        });
      },
      // Minion.modal.init.modal_ui
      modal_ui: function() {
        // Center modal.
        Minion.modal.util.center();

        // Events.
        var click_close = 'tap.rwd_init_modal_ui_close';
        var click_overlay = 'tap.rwd_init_modal_ui_overlay';

        var str_close = [
          '.modal-close',
          '.modal-close-x'
        ];

        var str_overlay = '.modal-overlay';

        // Hide modal, when close clicked.
        Minion.on(click_close, str_close, function(e) {
          e.preventDefault();
          Minion.modal.util.close();
        });

        // Hide modal, when overlay clicked.
        Minion.on(click_overlay, str_overlay, function(e) {
          var is_overlay = $(e.target).hasClass('modal-overlay');

          // Don't close, if the click
          // was on the modal itself.
          if (is_overlay) {
            Minion.modal.util.close();
          }
        });
      },
      // Minion.modal.init.window_resize
      window_resize: function() {
        var x = 'resize.rwd_modal_init_slick';

        $(window).off(x).on(x, function(e) {
          Minion.modal.util.center();
        });
      },
      // Minion.modal.init.popup_override
      popup_override: function() {
        var event = 'click.rwd_layer_init_popup_override';

        // Element selectors.
        var str = [
          'a[href^="javascript:popup"]',
          'a[href^="javascript:popUp"]',
          'area[href^="javascript:popup"]',
          'area[href^="javascript:popUp"]'
        ];

        Minion.on(event, str, function(e) {
          // Stop the link from calling popUp.
          e.preventDefault();

          // Get the initial link.
          var link = $(this).attr('href');

          // Split into popUp() arguments.
          var args = link.split('(')[1];
          args = args.split(')')[0];
          args = args.split(',');

          // Get the first argument.
          var url = args[0];
          url = url.replace(/"/g, '');
          url = url.replace(/'/g, '');
          url = $.trim(url);

          // Get the second argument.
          var width = args[1];
          width = width.replace(/"/g, '');
          width = width.replace(/'/g, '');
          width = $.trim(width);
          width = width || '';

          // Get the third argument.
          var height = args[2];
          height = height.replace(/"/g, '');
          height = height.replace(/'/g, '');
          height = $.trim(height);
          height = height || '';

          // Get the fourth argument.
          var scroll = args[3];
          scroll = scroll.replace(/"/g, '');
          scroll = scroll.replace(/'/g, '');
          scroll = $.trim(scroll);
          scroll = scroll || 'no';

          var options = [
            'toolbar=no',
            'location=no',
            'directories=no',
            'status=no',
            'menubar=no',
            'scrollbars=' + scroll,
            'width=' + width,
            'height=' + height
          ].join(',');

          var win = window.open(url, 'nmpopup', options);
          win.focus();
        });
      }
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);