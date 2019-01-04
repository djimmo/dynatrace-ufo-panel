'use strict';

System.register(['app/plugins/sdk', './css/dynatraceufo-panel.css!', './Chart.js', 'lodash'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, _typeof, _createClass, panelDefaults, DynatraceUfoCtrl;

  function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    } else {
      return Array.from(arr);
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_cssDynatraceufoPanelCss) {}, function (_ChartJs) {}, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      panelDefaults = {
        showUfoName: true,
        showUfoIP: true,
        showUfoWiFi: true,
        showUfoLastUpdate: true,
        showDropdown: true,

        jsonFields: {
          ufoName: 'detailInfo.ufo',
          ufoDeviceId: 'detailInfo.deviceId',
          ufoClientIP: 'detailInfo.clientIP',
          ufoSSID: 'detailInfo.ssid',
          ufoLeds: 'detailInfo.leds',
          ufoLedsLogo: 'logo',
          ufoLedsTop: 'top',
          ufoLedsBottom: 'bottom',
          ufoLedsColor: 'color',
          ufoLedsWhirlSpeed: 'whirl.speed',
          ufoLedsWhirlDir: 'whirl.clockwise',
          ufoLedsMorphState: 'morph.state',
          lastUpdate: 'ActivityTime'
        }
      };

      _export('DynatraceUfoCtrl', DynatraceUfoCtrl = function (_MetricsPanelCtrl) {
        _inherits(DynatraceUfoCtrl, _MetricsPanelCtrl);

        function DynatraceUfoCtrl($scope, $injector, $interval) {
          _classCallCheck(this, DynatraceUfoCtrl);

          var _this = _possibleConstructorReturn(this, (DynatraceUfoCtrl.__proto__ || Object.getPrototypeOf(DynatraceUfoCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));

          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-snapshot-load', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));

          _this.data = [];
          _this.ctx = null;
          _this.ufo = null;

          _this.canvasid = ("id" + Math.random() * 100000).replace('.', '');

          _this.topColors = [];
          _this.bottomColors = [];
          _this.logoColors = [];

          _this.opacity = 0xff;
          _this.morphFadeOut = true;
          _this.curColors = null;

          _this.traverseJson = function (model, path, def) {
            path = path || '';
            model = model || {};
            def = typeof def === 'undefined' ? '' : def;
            var parts = path.split('.');
            if (parts.length > 1 && _typeof(model[parts[0]]) === 'object') {
              return this.traverseJson(model[parts[0]], parts.splice(1).join('.'), def);
            } else {
              return model[parts[0]] || def;
            }
          };

          _this.updateLedData = function () {
            var _this2 = this;

            // Reset whirl and morph params
            this.opacity = 0xff;
            this.morphFadeOut = true;

            // Get data for selected Ufo and fill array with current colors
            var selectedUfoJson = this.json.filter(function (val) {
              return _this2.traverseJson(val, _this2.panel.jsonFields.ufoDeviceId) === _this2.selectedUfo;
            }).sort(function (a, b) {
              return new Date(_this2.traverseJson(b, _this2.panel.jsonFields.lastUpdate)[0]) - new Date(_this2.traverseJson(a, _this2.panel.jsonFields.lastUpdate)[0]);
            })[0];
            this.ufoName = this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoName);
            this.ufoClientIP = this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoClientIP);
            this.ufoWifiSsid = this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoSSID);
            this.ufoLastUpdate = this.traverseJson(selectedUfoJson, this.panel.jsonFields.lastUpdate)[0];
            if (this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds) !== '') {
              this.logoColors = this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsLogo].map(function (val) {
                return '#' + val + _this2.opacity.toString(16);
              });
              this.topColors = this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsTop][this.panel.jsonFields.ufoLedsColor].map(function (val) {
                return '#' + val + _this2.opacity.toString(16);
              });
              this.bottomColors = this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsBottom][this.panel.jsonFields.ufoLedsColor].map(function (val) {
                return '#' + val + _this2.opacity.toString(16);
              });

              // Set Whirl
              $interval.cancel(this.whirlIntervalTop);
              if (this.traverseJson(this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsTop], this.panel.jsonFields.ufoLedsWhirlSpeed) > 0) {
                this.whirlIntervalTop = $interval(function () {
                  if (_this2.traverseJson(_this2.traverseJson(selectedUfoJson, _this2.panel.jsonFields.ufoLeds)[_this2.panel.jsonFields.ufoLedsTop], _this2.panel.jsonFields.ufoLedsWhirlDir)) {
                    _this2.topColors.unshift(_this2.topColors.pop());
                  } else {
                    _this2.topColors.push(_this2.topColors.shift());
                  }
                  _this2.render();
                }, 1000);
              }

              $interval.cancel(this.whirlIntervalBottom);
              if (this.traverseJson(this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsBottom], this.panel.jsonFields.ufoLedsWhirlSpeed) > 0) {
                this.whirlIntervalBottom = $interval(function () {
                  if (_this2.traverseJson(_this2.traverseJson(selectedUfoJson, _this2.panel.jsonFields.ufoLeds)[_this2.panel.jsonFields.ufoLedsBottom], _this2.panel.jsonFields.ufoLedsWhirlDir)) {
                    _this2.bottomColors.unshift(_this2.bottomColors.pop());
                  } else {
                    _this2.bottomColors.push(_this2.bottomColors.shift());
                  }
                  _this2.render();
                }, 1000);
              }

              // Set Morph
              $interval.cancel(this.morphIntervalTop);
              if (this.traverseJson(this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsTop], this.panel.jsonFields.ufoLedsMorphState) === 1) {
                this.morphIntervalTop = $interval(function () {
                  if (_this2.morphFadeOut) {
                    _this2.opacity -= 0x0f;
                    if (_this2.opacity == 0x1e) {
                      _this2.morphFadeOut = !_this2.morphFadeOut;
                    }
                  } else {
                    _this2.opacity += 0x0f;
                    if (_this2.opacity == 0xff) {
                      _this2.morphFadeOut = !_this2.morphFadeOut;
                    }
                  }
                  _this2.topColors = _this2.topColors.map(function (val) {
                    return val.substring(0, 7) + _this2.opacity.toString(16);
                  });
                  _this2.render();
                }, 100);
              }

              $interval.cancel(this.morphIntervalBottom);
              if (this.traverseJson(this.traverseJson(selectedUfoJson, this.panel.jsonFields.ufoLeds)[this.panel.jsonFields.ufoLedsBottom], this.panel.jsonFields.ufoLedsMorphState) === 1) {
                this.morphIntervalBottom = $interval(function () {
                  if (_this2.morphFadeOut) {
                    _this2.opacity -= 0x0f;
                    if (_this2.opacity == 0x1e) {
                      _this2.morphFadeOut = !_this2.morphFadeOut;
                    }
                  } else {
                    _this2.opacity += 0x0f;
                    if (_this2.opacity == 0xff) {
                      _this2.morphFadeOut = !_this2.morphFadeOut;
                    }
                  }
                  _this2.bottomColors = _this2.bottomColors.map(function (val) {
                    return val.substring(0, 7) + _this2.opacity.toString(16);
                  });
                  _this2.render();
                }, 100);
              }
            } else {
              this.logoColors = [];
              this.topColors = [];
              this.bottomColors = [];
            }
            this.render();
            console.log('Visualizing UFO on IP: ' + this.ufoClientIP + '. Connected to WiFi: ' + this.ufoWifiSsid);
            console.log('UFO has ' + this.topColors.length + ' top LEDS and ' + this.bottomColors.length + ' bottom LEDS.');
          };
          return _this;
        }

        _createClass(DynatraceUfoCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/djimmo-dynatrace-ufo/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {}
        }, {
          key: 'onDataError',
          value: function onDataError() {
            console.log('There has been a data error!');
            this.render();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            this.data = {
              datasets: [{
                data: this.createLEDring(this.bottomColors.length),
                backgroundColor: this.bottomColors,
                label: 'Bottom Ring'
              }, {
                data: this.createLEDring(this.topColors.length),
                backgroundColor: this.topColors,
                label: 'Top Ring'
              }],
              labels: this.createLabels(this.topColors.length)
            };

            this.options = {
              responsive: true,
              aspectRatio: 1.4,
              legend: false,
              multiTooltipTemplate: '<%= datasetLabel %> - <%= value %>',
              animation: false
            };

            var config = {
              type: 'doughnut',
              data: this.data,
              options: this.options
            };

            if (this.ctx == null) if (document.getElementById(this.canvasid) != null) this.ctx = document.getElementById(this.canvasid).getContext('2d');

            if (this.ctx != null) {
              if (this.ufo == null) {
                this.ufo = new Chart(this.ctx, config);
              } else {
                this.ufo.data = this.data;
                this.ufo.update();
              }
            }
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            var _this3 = this;

            console.log('Data Received!');
            console.log(dataList);
            if (dataList.length !== 0) {
              console.log(dataList[0].datapoints);
              this.json = dataList[0].datapoints;

              this.availUfos = [].concat(_toConsumableArray(new Set(this.json.map(function (val) {
                return _this3.traverseJson(val, _this3.panel.jsonFields.ufoDeviceId);
              }))));
              console.log(this.availUfos);
              console.log('Selected Ufo: ' + this.selectedUfo);
              if (this.selectedUfo === undefined) {
                console.log('No Ufo selected so selecting first one in list: ' + this.availUfos[0]);
                this.selectedUfo = this.availUfos[0];
              }
              this.updateLedData();
            }
          }
        }, {
          key: 'createLEDring',
          value: function createLEDring(noOfLeds) {
            var arr = new Array(noOfLeds);
            for (var i = 0; i < noOfLeds; i++) {
              arr[i] = 1;
            }
            return arr;
          }
        }, {
          key: 'createLabels',
          value: function createLabels(noOfLeds) {
            var arr = new Array(noOfLeds);
            for (var i = 0; i < noOfLeds; i++) {
              arr[i] = 'LED #' + (i + 1);
            }
            return arr;
          }
        }, {
          key: 'selectUfo',
          value: function selectUfo() {
            console.log(this.selectedUfo + ' selected.');
            this.updateLedData();
          }
        }]);

        return DynatraceUfoCtrl;
      }(MetricsPanelCtrl));

      _export('DynatraceUfoCtrl', DynatraceUfoCtrl);

      DynatraceUfoCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=dynatraceufo_ctrl.js.map
