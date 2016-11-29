// JSLint settings:
/*global
  alert,
  clearTimeout,
  console,
  jQuery,
  setTimeout
*/

// `Global namespace.
//----------------------------------------------------------------------------------------------------

var Minion = Minion || {};

// `Check for a defined value.
//----------------------------------------------------------------------------------------------------

Minion.is_defined = function(x) {
  return typeof x !== 'undefined' && x !== null;
};

// `Escape regex.
//----------------------------------------------------------------------------------------------------

Minion.regex = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  // Escape the string.
  function esc(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  // Expose method.
  return function(x) {
    // Used in loop.
    var arr;
    var i;

    // Is it an array?
    var is_array = $.type(x) === 'array';

    // Is it an array?
    if (is_array) {
      arr = [];
      i = x.length;

      while (i--) {
        arr.push(esc(x[i]));
      }

      arr = arr.reverse();
      arr = arr.join('|');

      return new RegExp(arr, 'g');
    }
    // Assume individual string.
    else {
      return new RegExp(esc(x), 'g');
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Shared settings.
//----------------------------------------------------------------------------------------------------

Minion.config = Minion.config || {};

// Ajax URL for Hamburger.
Minion.config.hamburger_nav_url = Minion.config.hamburger_nav_url || './data/hamburger.json';

// How long to keep cache, in minutes.
Minion.config.cache_duration = Minion.config.cache_duration || 15;

// Use in-page value, if it exists.
Minion.config.debug = Minion.config.debug || (function(w, d) {
  // Strict mode.
  'use strict';

  // Is it "development"?
  var regex = Minion.regex([
    'dev.',
    'localhost',
    '0.0.0.0',
    ':4567'
  ]);

  // Is it NOT production?
  var regex_nm = Minion.regex('neimanmarcus.com');

  // Host.
  var host = w.location.host;

  // Check both conditions.
  var is_debug =
    !host.match(regex_nm) &&
    (host.match(regex) || host === '');

  // Force a boolean.
  is_debug = !!is_debug;

  // HTML tag.
  var h = d.documentElement;
  var c = !!h.className;

  // String for class="..."
  var s = 'debug';
  var _s = ' ' + s;

  // If debug, set <body> class.
  if (is_debug) {
    c ? h.className += _s : h.className = s;
  }

  // Report the boolean.
  return is_debug;

// Parameters: window, document.
})(this, this.document);

// `Logging, based on environment.
//----------------------------------------------------------------------------------------------------

Minion.log = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function() {
    // Ensure debug mode.
    var logging_enabled =
      Minion.config.debug &&
      window.console &&
      window.console.log;

    // Logging not enabled?
    if (!logging_enabled) {
      // Exit.
      return;
    }

    for (var i = 0, ii = arguments.length; i < ii; i++) {
      window.console.log(arguments[i]);
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Info about browser, screen, etc.
//----------------------------------------------------------------------------------------------------

Minion.info = Minion.info || {};

//============================
// Are touch events supported?
//============================

Minion.info.is_touch = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  var w = window;
  var d = document;
  var o = 'ontouchstart';
  var t = w.DocumentTouch;
  var x = o in w || (t && d instanceof t);

  return !!x;

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

//==================================
// Detect media query'd screen size.
//==================================

Minion.info.media = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(x) {
    x = $.trim(x);

    var body = $(document.body);

    // Detect mobile or "desktop" width.
    var span = body.find('.js-detect-media-query');

    if (!span.length) {
      span = $('<span class="js-detect-media-query"></span>').appendTo(body);
    }

    // Font stuff.
    var f = 'font-family';
    var serif = 'serif';
    var sans = 'sans-serif';

    // Do comparison.
    var is_tablet = span.css(f) === serif;
    var is_desktop = span.css(f) === sans;

    // Assume mobile.
    var media = 'mobile';

    // Report tablet/desktop.
    if (is_tablet) {
      media = 'tablet';
    }
    else if (is_desktop) {
      media = 'desktop';
    }

    // Does it match?
    return media === x;
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// //============
// // IE version.
// //============

// Minion.info.ie_version = (function($, window, document, undefined) {
//   // Strict mode.
//   'use strict';

//   /*
//     Read more about this technique here:

//     https://gist.github.com/padolsey/527683
//   */

//   var v = 3;
//   var b = document.createElement('b');
//   var all = b.getElementsByTagName('br');

//   // Iterate to find IE version.
//   do {
//     v++;
//     b.innerHTML = '<!--[if gt IE ' + v + ']><br><![endif]-->';
//   }
//   while (all[0]);

//   // Report IE version, if any.
//   return v > 4 ? v : undefined;

// // Parameters: jQuery, window, document.
// })(jQuery, this, this.document);

//==============
// JSON support.
//==============

Minion.info.json_support =
  typeof JSON === 'object' &&
  typeof JSON.parse === 'function' &&
  typeof JSON.stringify === 'function';

//=======================================
// `Detect if HTML5 storage is supported.
//=======================================

/*
  The reason we do this is that Safari reports a false positive
  when in "private browsing" mode. Meaning, it says it supports
  `window.localStorage` but doesn't allow you to do read/write.
*/

Minion.info.storage_support = (function(w) {
  // Assume no support.
  var bool = false;

  // Used in the `try`.
  var key = 'TEST_KEY';
  var val = 'TEST_VAL';

  // Rigorously test for support.
  try {
    // Set the key/value.
    w.localStorage.setItem(key, val);

    // Are we able to read it?
    bool = w.localStorage.getItem(key) === val;

    // Delete the key/value.
    w.localStorage.removeItem(key);
  }
  catch(e){}

  // Return the boolean.
  return bool;
})(this);

// `Empty object, for tracking events.
//----------------------------------------------------------------------------------------------------

Minion.events = Minion.events ||
(
  Object.create ?
  Object.create(null) :
  {}
);

// `Event handling.
//----------------------------------------------------------------------------------------------------

Minion.on = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(event, str, func) {
    // Alias to <body>.
    var body = $(document.body);

    // Split event and namespace.
    var arr = event.split('.');
    var prefix = arr[0];
    var suffix = arr[1];

    // Does namespace exist?
    if (!suffix) {
      /*
        By creating a suffix, we ensure that there
        is a unique namespace for un-named events.
      */

      // Timestamp.
      suffix = new Date().getTime();

      // Separator.
      suffix += '_';

      // Random number.
      suffix += Math.random().toString().split('.')[1];

      // Namespaced event.
      event = [
        prefix,
        suffix
      ].join('.');

      /*
        This will yield something like:

        "click.1401052861955_0749090884346515"

        That way, when body.off() is called, it doesn't
        accidentally un-bind all of the "click" events.
      */
    }

    // Array of element selectors?
    var is_array = $.type(str) === 'array';

    // Change element array into selector string.
    if (is_array) {
      str = str.join(',');
    }

    // Add to events object.
    Minion.events[event] = str;

    // Delegate to body.
    body.off(event).on(event, str, func);
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Remove event.
//----------------------------------------------------------------------------------------------------

Minion.off = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(event, str, func) {
    // Alias to <body>.
    var body = $(document.body);

    //=========
    // Un-bind.
    //=========

    // Un-bind specific function?
    if (event && func && str) {
      body.off(event, str, func);
    }
    // Un-bind delegates?
    else if (event && str) {
      body.off(event, str);
    }
    // Un-bind event.
    else if (event) {
      body.off(event);
    }

    //=======================
    // Remove from Minion.events
    //=======================

    // Split event and namespace.
    var arr = event.split('.');
    var prefix = arr[0];
    var suffix = arr[1];

    // Used in conditional.
    var _prefix;
    var _suffix;
    var i;

    // Is there both prefix AND suffix?
    if (prefix && suffix) {
      // Remove from events list.
      delete Minion.events[event];
    }
    // Is there only a prefix?
    else if (prefix) {
      // Loop through object.
      for (i in Minion.events) {
        _prefix = i.split('.')[0];

        if (_prefix === prefix) {
          delete Minion.events[i];
        }
      }
    }
    // Is there only a suffix?
    else if (suffix) {
      // Loop through object.
      for (i in Minion.events) {
        _suffix = i.split('.')[1];

        if (_suffix === suffix) {
          delete Minion.events[i];
        }
      }
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Trigger event.
//----------------------------------------------------------------------------------------------------

Minion.trigger = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(event, el) {
    // Alias to <body>.
    var body = $(document.body);

    event = $.Event(event);
    event.target = typeof el === 'object' ? el[0] : $(el)[0];
    body.trigger(event);
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Call all module init functions.
//----------------------------------------------------------------------------------------------------

Minion.init = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  // Run when DOM is ready.
  $(document).ready(function() {
    // Events.
    var click = 'click.minion_init_click';
    var submit = 'submit.minion_init_submit';

    // Empty links.
    var links = [
      'a[href=""]',
      'a[href="#"]',
      'a:not([href])',
      'area[href=""]',
      'area[href="#"]',
      'area:not([href])'
    ];

    // Ajax forms.
    var forms = [
      'form[action=""]',
      'form[action="#"]',
      'form:not([action])'
    ];

    // Stop <a href="#"> links.
    Minion.on(click, links, function(e) {
      e.preventDefault();
    });

    // Stop Ajax forms.
    Minion.on(submit, forms, function(e) {
      e.preventDefault();
    });

    Minion.on('focusout', '', function() {
      window.scrollTo(0, 0);
    });

    if (("standalone" in window.navigator) && window.navigator.standalone) {
      $('html').addClass('standalone');
    }


    // Kickoff.
    Minion.init();
  });

  return function() {
    var i;
    var j;
    var valid_init;
    var valid_func;

    for (i in Minion) {
      // Check for init.
      valid_init =
        Minion.hasOwnProperty(i) &&
        typeof Minion[i] === 'object' &&
        Minion[i].init &&
        typeof Minion[i].init === 'object';

      // Does init exist?
      if (valid_init) {
        // Loop through init.
        for (j in Minion[i].init) {

          // Check for function.
          valid_func =
            Minion[i].init.hasOwnProperty(j) &&
            typeof Minion[i].init[j] === 'function';

          // Can it be called?
          if (valid_func) {
            Minion[i].init[j]();
          }
        }
      }
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// // `Local storage cache.
// //----------------------------------------------------------------------------------------------------

// Minion.cache = Minion.cache || (function($, window, document, undefined) {
//   // Strict mode.
//   'use strict';

//   // Internal reference.
//   var cache = Minion.info.storage_support ? window.localStorage : {clear:function(){}};

//   // Is there a clear method?
//   var has_clear = typeof cache.clear === 'function';

//   // What time is it?
//   var now = new Date().getTime();

//   // When was it last updated?
//   var m = 60000;
//   var t = Minion.config.cache_duration * m;
//   var timestamp = cache.timestamp;

//   // Is the timestamp valid?
//   var invalid = !timestamp || now - timestamp > t;

//   if (invalid) {
//     // Flush the cache.
//     has_clear && cache.clear();

//     // New timestamp.
//     cache.timestamp = now;
//   }

//   // Expose as "Minion.cache"
//   return cache;

// // Parameters: jQuery, window, document.
// })(jQuery, this, this.document);

// //========
// // Getter.
// //========

// Minion.get_cache = (function($, window, document, undefined) {
//   // Strict mode.
//   'use strict';

//   // Expose function.
//   return function(key) {
//     var data = Minion.cache[key];

//     if (!data) {
//       return;
//     }

//     // Attempt to JSON parse.
//     if (Minion.info.json_support) {
//       data = JSON.parse(data);
//     }

//     return data;
//   };

// // Parameters: jQuery, window, document.
// })(jQuery, this, this.document);

// //========
// // Setter.
// //========

// Minion.set_cache = (function($, window, document, undefined) {
//   // Strict mode.
//   'use strict';

//   // Expose function.
//   return function(key, data) {
//     if (Minion.info.json_support) {
//       data = JSON.stringify(data);
//     }

//     Minion.cache[key] = data;
//   };

// // Parameters: jQuery, window, document.
// })(jQuery, this, this.document);

// `Method to truncate text.
//----------------------------------------------------------------------------------------------------

Minion.truncate = function(text, max) {
  var arr = text.split(' ');
  var temp = [];
  var total = 0;

  // Used in loop.
  var i;
  var ii;
  var word;
  var word_length;

  if (text.length > max) {
    for (i = 0, ii = arr.length; i < ii; i++) {
      word = arr[i];
      word_length = word.length;
      total += word_length;

      if (total < max) {
        temp.push(word);
      }
    }

    text = temp.join(' ');
    text += '&hellip;';
  }

  return text;
};

// `Minify a string.
//----------------------------------------------------------------------------------------------------

Minion.trim = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(str) {
    return $.trim(str).replace(/\s+/g, ' ');
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Hyphenate a string.
//----------------------------------------------------------------------------------------------------

Minion.dashed = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(str) {
    return $.trim(str).replace(/\s+/g, '-').toLowerCase();
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Roll it.
//----------------------------------------------------------------------------------------------------

Minion.roll = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  return function(die, mod) {
    return Math.floor(Math.random() * die) + 1 + (mod || 0);
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);

// `Generate Unique ID.
//----------------------------------------------------------------------------------------------------

Minion.uid = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';
  return function() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);