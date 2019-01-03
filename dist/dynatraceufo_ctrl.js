'use strict';

System.register(['app/plugins/sdk', './css/dynatraceufo-panel.css!', './Chart.js'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _createClass, DynatraceUfoCtrl;

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
    }, function (_cssDynatraceufoPanelCss) {}, function (_ChartJs) {}],
    execute: function () {
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

      _export('DynatraceUfoCtrl', DynatraceUfoCtrl = function (_MetricsPanelCtrl) {
        _inherits(DynatraceUfoCtrl, _MetricsPanelCtrl);

        function DynatraceUfoCtrl($scope, $injector, $interval) {
          _classCallCheck(this, DynatraceUfoCtrl);

          var _this = _possibleConstructorReturn(this, (DynatraceUfoCtrl.__proto__ || Object.getPrototypeOf(DynatraceUfoCtrl)).call(this, $scope, $injector));

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

          _this.showUfoName = true;
          _this.showUfoIP = true;
          _this.showUfoWiFi = true;
          _this.showUfoLastUpdate = true;
          _this.showDropdown = true;

          _this.canvasid = Math.random();

          _this.topColors = [];
          _this.bottomColors = [];
          _this.logoColors = [];

          _this.opacity = 0xff;
          _this.morphFadeOut = true;
          _this.curColors = null;

          _this.updateLedData = function () {
            var _this2 = this;

            // Reset whirl and morph params
            this.opacity = 0xff;
            this.morphFadeOut = true;

            // Get data for selected Ufo and fill array with current colors
            var selectedUfoJson = this.json.filter(function (val) {
              return val.detailInfo.deviceId === _this2.selectedUfo;
            }).sort(function (a, b) {
              return new Date(b.ActivityTime) - new Date(a.ActivityTime);
            })[0];
            this.ufoName = selectedUfoJson.detailInfo.ufo;
            this.ufoClientIP = selectedUfoJson.detailInfo.clientIP;
            this.ufoWifiSsid = selectedUfoJson.detailInfo.ssid;
            this.ufoLastUpdate = selectedUfoJson.ActivityTime[0];
            if (selectedUfoJson.detailInfo.leds) {
              this.logoColors = selectedUfoJson.detailInfo.leds.logo.map(function (val) {
                return '#' + val + _this2.opacity.toString(16);
              });
              this.topColors = selectedUfoJson.detailInfo.leds.top.color.map(function (val) {
                return '#' + val + _this2.opacity.toString(16);
              });
              this.bottomColors = selectedUfoJson.detailInfo.leds.bottom.color.map(function (val) {
                return '#' + val + _this2.opacity.toString(16);
              });
            } else {
              this.logoColors = [];
              this.topColors = [];
              this.bottomColors = [];
            }
            this.render();

            // Set Whirl
            $interval.cancel(this.whirlIntervalTop);
            if (selectedUfoJson.detailInfo.leds.top.whirl.speed > 0) {
              this.whirlIntervalTop = $interval(function () {
                if (selectedUfoJson.detailInfo.leds.top.whirl.clockwise) {
                  _this2.topColors.unshift(_this2.topColors.pop());
                } else {
                  _this2.topColors.push(_this2.topColors.shift());
                }
                _this2.render();
              }, 1000);
            }

            $interval.cancel(this.whirlIntervalBottom);
            if (selectedUfoJson.detailInfo.leds.bottom.whirl.speed > 0) {
              this.whirlIntervalBottom = $interval(function () {
                if (selectedUfoJson.detailInfo.leds.bottom.whirl.clockwise) {
                  _this2.bottomColors.unshift(_this2.bottomColors.pop());
                } else {
                  _this2.bottomColors.push(_this2.bottomColors.shift());
                }
                _this2.render();
              }, 1000);
            }

            // Set Morph
            $interval.cancel(this.morphIntervalTop);
            if (selectedUfoJson.detailInfo.leds.top.morph.state === 1) {
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
            if (selectedUfoJson.detailInfo.leds.bottom.morph.state === 1) {
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

            console.log('Visualizing UFO on IP: ' + selectedUfoJson.detailInfo.clientIP + '. Connected to WiFi: ' + selectedUfoJson.detailInfo.ssid);
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
                fillColor: 'rgba(0,0,0,0)',
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
            console.log('Data Received!');
            console.log(dataList);
            console.log(dataList[0].datapoints);
            this.json = dataList[0].datapoints;

            this.availUfos = [].concat(_toConsumableArray(new Set(this.json.map(function (val) {
              return val.detailInfo.deviceId;
            }))));
            // this.availUfoIds = [...new Set(this.json.map(val => val.detailInfo.deviceId))];
            console.log(this.availUfos);
            console.log(this.selectedUfo);
            if (this.selectedUfo === undefined) {
              this.selectedUfo = this.availUfos[0];
            }
            this.updateLedData();
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
