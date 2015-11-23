// Generated by CoffeeScript 1.9.3
(function() {
  var ActionMsgbox,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ActionMsgbox = (function(superClass) {
    extend(ActionMsgbox, superClass);

    function ActionMsgbox() {
      return ActionMsgbox.__super__.constructor.apply(this, arguments);
    }

    ActionMsgbox.prototype.init = function(action) {
      var actionId, self;
      ActionMsgbox.__super__.init.call(this, action);
      if (!this.form) {
        return;
      }
      actionId = action.actionName.replace(/::/g, '-');
      self = this;
      this.cls = 'action-' + actionId + '-result';
      this.ccls = 'action-result';
      if (this.config.container) {
        this.container = $(this.config.container);
      } else {
        this.container = this.form.find('.' + this.cls);
        if (!this.container.get(0)) {
          this.container = $('<div/>').addClass(this.cls).addClass(this.ccls);
          this.form.prepend(this.container);
        }
      }
      if (typeof this.config.clear !== "undefined") {
        if (this.config.clear) {
          this.container.empty().hide();
        }
      } else {
        this.container.empty().hide();
      }
      $(action).bind('action.on_result', function(ev, resp) {
        var $box, $close, $desc, $icon, $text, d, i, len, msg, ref, results;
        $box = $('<div/>').addClass('message');
        $text = $('<div/>').addClass('text');
        $desc = $('<div/>').addClass('desc');
        $icon = $('<i/>').css({
          float: 'left'
        }).addClass('icon fa');
        $close = $('<span/>').css({
          position: 'absolute',
          top: 6,
          right: 6
        }).addClass('fa fa-times-circle').click(function() {
          return $box.fadeOut('slow', function() {
            return $box.remove();
          });
        });
        $box.append($icon).append($text);
        if (resp.desc) {
          $box.append($desc);
        }
        $box.append($close);
        if (resp.success) {
          $box.addClass('success');
          $icon.addClass('fa-check-circle');
          $text.text(resp.message);
          self.container.html($box).fadeIn('fast');
        } else if (resp.error) {
          self.container.empty();
          $box.addClass('error');
          $icon.addClass('fa-warning');
          $text.text(resp.message);
          self.container.html($box).fadeIn('fast');
        }
        if (resp.validations) {
          ref = self.extErrorMsgs(resp);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            msg = ref[i];
            d = $('<div/>').addClass('error-message').html(msg);
            results.push($desc.append(d));
          }
          return results;
        }
      });
      return $(action).bind('action.before_submit', function() {
        return self.wait();
      });
    };

    ActionMsgbox.prototype.wait = function() {
      var $box, $close, $desc, $icon, $text, scrollOffset;
      $box = $('<div/>').addClass('message');
      $text = $('<div/>').addClass('text');
      $desc = $('<div/>').addClass('desc');
      $icon = $('<i/>').css({
        float: 'left'
      }).addClass('icon icon-spinner icon-spin');
      $close = $('<span/>').css({
        position: 'absolute',
        top: 6,
        right: 6
      }).addClass('fa fa-times-circle').click(function() {
        return $box.fadeOut('slow', function() {
          return $box.remove();
        });
      });
      $box.append($icon).append($text).append($desc).append($close);
      $box.addClass('waiting');
      $text.text("Progressing");
      this.container.html($box).fadeIn('fast');
      if (!this.config.disableScroll && $.scrollTo && window.pageYOffset > 20) {
        scrollOffset = this.config.scrollOffset || -20;
        $.scrollTo($box.get(0), 200, {
          offset: scrollOffset
        });
      }
      if (this.config.fadeOut) {
        return setTimeout(((function(_this) {
          return function() {
            return _this.container.fadeOut('fast', (function() {
              return _this.container.empty();
            }));
          };
        })(this)), 1200);
      }
    };

    ActionMsgbox.prototype.extErrorMsgs = function(resp) {
      var field, ref, results, v;
      ref = resp.validations;
      results = [];
      for (field in ref) {
        v = ref[field];
        if (!v.valid || v.error) {
          results.push(v.message);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    return ActionMsgbox;

  })(ActionPlugin);

  window.ActionMsgbox = ActionMsgbox;

}).call(this);
