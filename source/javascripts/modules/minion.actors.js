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

Minion.actor = (function($, window, document, undefined) {
  // Strict mode.
  'use strict';

  // Expose innards.
  return {
    //=========
    // Minion.actor.util
    //=========
    util: {
      // Minion.actor.util.roll_initiative
      roll_initiative: function() {
        var mod = $('#actor_initiative_mod').val() || 0;
        var init = Minion.roll(20, mod);
        $('#actor_initiative').val(init);
      },

      // Minion.actor.util.new
      new: function() {
        var source = $('#actor-new').html();
        var template = Handlebars.compile(source);
        var context = {};
        context.isMonster = true;
        context.button_text = 'Add';
        context.form_id = 'new-actor-form';
        var html = template(context);

        Minion.modal.util.open(html);

        Minion.on('submit.add_actor', '#' + context.form_id, function() {
          var form_data = $('#' + context.form_id).serializeObject();
          var key = form_data.actor.key = form_data.actor.id = Minion.uid();

          Minion.actor.util.create(form_data);
          Minion.modal.util.close();
        });


        Minion.on('focus.initiative', '#actor_initiative', function() {
          if ($('#actor_type_monster').prop('checked') && $('#actor_initiative').val() === "") {
            Minion.actor.util.roll_initiative();
          }

        });
      },

      // Minion.actor.util.create
      create: function(data) {
        Minion.actor.util.save(data);
        Minion.actor.util.add(data);
      },

      // Minion.actor.util.save
      save: function(data) {
        var e = localstore.get('encounter') || {};
        var a = data.actor;
        var b = {};
        b[a.key] = a;
        $.extend(e, e, b);
        localstore.set('encounter', e);
      },

      // Minion.actor.util.edit
      edit: function(key) {
        var source = $('#actor-new').html();
        var template = Handlebars.compile(source);
        var context = Minion.actor.util.find(key);
        context.form_id = "edit-actor-form";

        if (context.type == 'pc') {
          context.isPC = true;
        } else {
          context.isMonster = true;
        }

        context.button_text = "Save";

        var html = template(context);

        Minion.modal.util.open(html);

        Minion.on('submit.edit_actor', '#' + context.form_id, function() {
          var form_data = $('#' + context.form_id).serializeObject();

          Minion.actor.util.remove(key);
          Minion.actor.util.update(key, form_data);
          Minion.modal.util.close();
        });

      },

      // Minion.actor.util.find
      find: function(key) {
        var e = localstore.get('encounter');
        var a = e[key];
        return a;
      },

      // Minion.actor.util.update
      update: function(key, data) {
        var e = localstore.get('encounter');
        e[key] = data.actor;
        localstore.set('encounter', e);
        data.actor.key = key;
        Minion.actor.util.add(data);
        $('html').removeClass('editable');
        $('#button-edit').html('Edit');
      },

      // Minion.actor.util.delete
      delete: function(key) {
        var e = localstore.get('encounter');
        delete e[key];
        localstore.set('encounter', e);
      },

      // Minion.actor.util.add
      add: function(data) {
        var source = $('#actor-template').html();
        var template = Handlebars.compile(source);
        var context = data;

        Minion.$encounter.prepend(template(context));
        Minion.actor.util.sort();
      },

      // Minion.actor.util.remove
      remove: function(key) {
        $('#' + key).remove();

      },

      // Minion.actor.util.sort
      sort: function() {
        var mylist = $('#encounter-list');
        var listitems = mylist.children('li').get();
        listitems.sort(function(a, b) {
          var sA = $(a).find('.actor-initiative').text();
          var sB = $(b).find('.actor-initiative').text();
          var bA = $(a).find('input.initBonus').val();
          var bB = $(b).find('input.initBonus').val();
          
          if(sA == sB){
            return (bB - bA);
          } else {
            return (sB - sA);
          }
          
        });

        $.each(listitems, function(idx, itm) { mylist.append(itm); });
      }
    },
    //===============
    // Minion.actors.init
    //===============
    init: {
      // Minion.actor.init.init_sort
      init_sort: function() {
        Minion.encounter = document.getElementById('encounter-list');
        Minion.$encounter = $(Minion.encounter);

        new Sortable(Minion.encounter, {
          handle: '.handle'
        });
      },

      // Minion.actor.init.restore
      restore: function() {
        $('#encounter-list').empty();
        var actors = localstore.get('encounter') || {};
        var monster_selection = localstore.get('monster_selection') || {};

        if (monster_selection.count > 0) {
          Minion.log(monster_selection);
          var new_roster = $.extend(actors, actors, monster_selection.selection);
          localstore.set('encounter', new_roster);
          var encounterDB = new Firebase('https://minion2.firebaseio.com/encounter');
          encounterDB.set(new_roster);
          localstore.remove('monster_selection');
        }

        $.each(actors, function (key, value) {
          var item = {};
          item.actor = value;
          item.actor.key = key;
          Minion.actor.util.add(item);
        });
      },

      // Minion.actor.init.buttons
      buttons: function() {
        Minion.on('tap.new_actor', '#button-add', function(e) {
          e.preventDefault();
          showPanel(togglePanel);
        });

        Minion.on('tap.new_custom', '#new-pc, #new-custom', function(e) {
          e.preventDefault();
          Minion.actor.util.new();
          togglePanel();
        });

        Minion.on('tap.new_monster', '#new-monster', function(e) {
          e.preventDefault();
          window.location = '/monsters.html';
        });

        Minion.on('tap.delete_actor', '.button-delete', function(e) {
          e.stopPropagation();

          var key = $(this).parents('.actor').attr('id');
          var name = $(this).siblings('.actor-name').html();
          if (confirm('Remove ' + name + "?")) {
            Minion.actor.util.delete(key);
            $(this).parents('.actor').remove();
          }
        });

        Minion.on('tap.edit_actor', '.actor', function(e) {
          e.preventDefault();
          if ($('html').hasClass('editable')) {
            Minion.actor.util.edit($(this).attr('id'));
          }

        });

        Minion.on('tap.edit_actors', '#button-edit', function(e) {
          e.preventDefault();
          var app = $('html');
          app.toggleClass('editable');
          if (app.hasClass('editable')) {
            $(this).html('Done');
          } else {
            $(this).html('Edit');
          }
        });

        Minion.on('tap.roll_initiative', '#roll-initiative', function() {
          var mod = parseInt($('#actor-initiative-mod').val(), 0) || 0;
          var total = Minion.roll(20, mod);
          $('#actor_initiative').val(total);
        });

        Minion.on('tap.clear_all', '#button-clear-data', function(e) {
          e.preventDefault();

          if (confirm('Reset encounter and remove all actors?')) {
            localstore.remove('encounter');
            Minion.actor.init.restore();
          }
        });
      }
    }
  };

// Parameters: jQuery, window, document.
})(jQuery, this, this.document);