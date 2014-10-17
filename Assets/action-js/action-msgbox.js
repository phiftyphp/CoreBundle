// Generated by CoffeeScript 1.7.1
(function() {
  var ActionMsgbox,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ActionMsgbox = (function(_super) {
    __extends(ActionMsgbox, _super);

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
        var $box, $close, $desc, $icon, $text, d, msg, _i, _len, _ref, _results;
        $box = $('<div/>').addClass('message');
        $text = $('<div/>').addClass('text');
        $desc = $('<div/>').addClass('desc');
        $icon = $('<i/>').css({
          float: 'left'
        }).addClass('icon');
        $close = $('<span/>').css({
          position: 'absolute',
          top: 6,
          right: 6
        }).addClass('icon-remove').click(function() {
          return $box.fadeOut('slow', function() {
            return $box.remove();
          });
        });
        $box.append($icon).append($text).append($desc).append($close);
        if (resp.success) {
          $box.addClass('success');
          $icon.addClass('icon-ok-sign');
          $text.text(resp.message);
          self.container.html($box).fadeIn('fast');
        } else if (resp.error) {
          self.container.empty();
          $box.addClass('error');
          $icon.addClass('icon-warning-sign');
          $text.text(resp.message);
          self.container.html($box).fadeIn('fast');
        }
        if (resp.validations) {
          _ref = self.extErrorMsgs(resp);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            msg = _ref[_i];
            d = $('<div/>').addClass('error-message').html(msg);
            _results.push($desc.append(d));
          }
          return _results;
        }
      });
      return $(action).bind('action.before_submit', function() {
        return self.wait();
      });
    };

    ActionMsgbox.prototype.wait = function() {
      var $box, $close, $desc, $icon, $text;
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
      }).addClass('ui-icon ui-icon-circle-close').click(function() {
        return $box.fadeOut('slow', function() {
          return $box.remove();
        });
      });
      $box.append($icon).append($text).append($desc).append($close);
      $box.addClass('waiting');
      $text.text("Progressing");
      this.container.html($box).fadeIn('fast');
      if (!this.config.disableScroll && $.scrollTo && window.pageYOffset > 20) {
        $.scrollTo($box.get(0), 200, {
          offset: -20
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
      var field, v, _ref, _results;
      _ref = resp.validations;
      _results = [];
      for (field in _ref) {
        v = _ref[field];
        if (!v.valid || v.error) {
          _results.push(v.message);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return ActionMsgbox;

  })(ActionPlugin);

  window.ActionMsgbox = ActionMsgbox;

}).call(this);
