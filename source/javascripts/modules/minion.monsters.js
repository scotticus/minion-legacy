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

Minion.monster = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  // Expose innards.
  return {
    //=================
    // Minion.monster.util
    //=================
    util: {
      // Minion.monster.util.load_monsters
      load_monsters: function() {
        var o = localstore.get('monsters');
        Minion.log(o);
      },

      // Minion.monster.util.list_monsters
      list_monsters: function() {
        var monsters = localstore.get('monsters');

        $(monsters).each(function(i, m) {
          m.type = "monster";
          m.key = 'm-' + m.id;
          Minion.monster.util.display_monster(m);
        });
      },

      // Minion.monster.util.display_monster
      display_monster: function(obj) {
        var monster = obj;
        var source = $('#actor-template').html();
        var template = Handlebars.compile(source);
        var context = {};
        context.actor = monster;

        $('#monster-list').append(template(context));
        $('#' + monster.key).data('info', monster);

      },

      // Minion.monster.util.update_button
      update_button: function(html) {
        $('#add-selected').html(html);
      },

      // Minion.monster.util.count_object
      count_object: function(obj) {
        var keys = Object.keys(obj);
        var count = keys.length;
        return count;
      }

    },
    //=================
    // Minion.monster.init
    //=================
    init: {
      // Minion.monster.init.fetch_monsters
      fetch_monsters: function() {
        var monstersDB = new Firebase("https://minion2.firebaseio.com/monsters");

        monstersDB.on('value', function(snapshot) {
          localstore.set('monsters', snapshot.val());
          Minion.log(snapshot.val());
          Minion.monster.util.list_monsters();
        }, function(errorObj) {
          console.log("The read failed: " + errorObj.code);
        });
      },

      //Minion.monster.init.fetch_player_characters
      fetch_player_characters: function() {
        Minion.log('fetch_player_characters');
        $.getJSON('/data/player_characters.json', function(data) {
          Minion.log('success');
          localstore.set('characters', data.player_characters);
        });
      },

      // Minion.monster.init.handle_selection
      handle_selection: function() {
        Minion.monster_selection = {};
        Minion.selection_keys = {};
        
        Minion.on('tap.select_monster', '.actor', function(e) {
          Minion.log(e);
          var $s = $(this);
          var selected_monster = $s.data('info');
          var key = Minion.uid();

          if ($s.hasClass('selected')) {
            $s.removeClass('selected');
            var del_key = Minion.selection_keys[selected_monster.name];
            delete Minion.selection_keys[selected_monster.name];
            delete Minion.monster_selection[del_key];
          } else {
            selected_monster.initiative = Minion.roll(20);
            Minion.selection_keys[selected_monster.name] = key;
            Minion.monster_selection[key] = selected_monster;
            $s.addClass('selected');
          }

          var count = Minion.monster.util.count_object(Minion.monster_selection);
          count = count > 0 ? ' ' + count : '';
          Minion.monster.util.update_button('Add' + count);
        });

        Minion.on('tap.add_monsters', '#add-selected', function(e) {
          e.preventDefault();
          var selected_count = Minion.monster.util.count_object(Minion.monster_selection);

          if (selected_count > 0) {
            var o = {};
            o.count = selected_count;
            o.selection = Minion.monster_selection;
            localstore.set('monster_selection', o);
            window.location = '/';
          }
        });
      }
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);