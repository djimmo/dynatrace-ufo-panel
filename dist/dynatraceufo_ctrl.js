'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/time_series', './css/dynatraceufo-panel.css!', './Chart.js'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, TimeSeries, _createClass, panelDefaults, DynatraceUfoCtrl;

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
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
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

      panelDefaults = {
        bgColor: null,

        dynatraceUfoSettings: {
          fontColor: 'gray',
          gridColor: 'gray',
          fontSize: 14
        }
      };

      _export('DynatraceUfoCtrl', DynatraceUfoCtrl = function (_MetricsPanelCtrl) {
        _inherits(DynatraceUfoCtrl, _MetricsPanelCtrl);

        function DynatraceUfoCtrl($scope, $injector, $rootScope) {
          _classCallCheck(this, DynatraceUfoCtrl);

          var _this = _possibleConstructorReturn(this, (DynatraceUfoCtrl.__proto__ || Object.getPrototypeOf(DynatraceUfoCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          _this.$rootScope = $rootScope;

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

          _this.canvasid = "canvas";

          _this.currentOptions = null;

          _this.ufoId = null;
          _this.ufoClientIP = null;
          _this.ufoWifiSsid = null;
          _this.topColors = [];
          _this.bottomColors = [];
          _this.logoColors = [];

          _this.availUfos = [];
          _this.selectedUfo = null;

          _this.updateUfo();
          return _this;
        }

        _createClass(DynatraceUfoCtrl, [{
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/djimmo-dynatrace-ufo/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            this.series = [];
            this.render();
          }
        }, {
          key: 'whirl',
          value: function whirl(clockwise) {
            if (clockwise) {
              config.data.datasets[0].backgroundColor.unshift(config.data.datasets[0].backgroundColor.pop());
            } else {
              config.data.datasets[0].backgroundColor.push(config.data.datasets[0].backgroundColor.shift());
            }
            console.log('test: trying to whirl!');
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
              // title: {
              //   display: true,
              //   text: 'Dynatrace Ufo ' + this.ufoId
              // },
              animation: {
                animateRotate: false,
                animateScale: true
              }
            };

            var config = {
              type: 'doughnut',
              data: this.data,
              options: this.options
            };

            if (this.currentOptions == null) this.currentOptions = JSON.stringify(this.options);

            if (this.ctx == null) if (document.getElementById(this.canvasid) != null) this.ctx = document.getElementById(this.canvasid).getContext('2d');

            if (this.ctx != null) {
              this.ufo = new Chart(this.ctx, config);
            }
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            console.log('Data Received!');
            console.log(dataList);

            var jsonData = '{"timestamp":"1827609","device":{"id":"ufo-30aea420be35","clientIP":"172.28.165.246","ssid":"Royal-Guest","version":"Dec 17 2018 - 12:02:57","build":"1000","cpu":"ESP32","battery":"100","temperature":"22.12","leds": {"logo": ["ff0000", "00ff40", "00ff00", "000044"], "top": {"color": ["ff0000","00f400", "ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ffff00","ff0000"],"background": "000000","whirl": {"speed": 0,"clockwise": 0},"morph": { "state": 1, "period": 80, "periodTick": 80, "speed": 8, "speedTick": 1, "percentage": 68}},"bottom": {"color": ["004400","ff4400","ff4400","ff4400","004400","004400","004400","004400","004400","004400","004400","004400","004400","004400","004400"],"background": "000000","whirl": {"speed": 0,"clockwise": 0},"morph": { "state": 1, "period": 80, "periodTick": 80, "speed": 8, "speedTick": 3, "percentage": 70}}},"freemem":"143588"}}';
            var json = JSON.parse(jsonData);

            this.ufoId = json.device.id;
            this.availUfos.push(this.ufoId);
            this.selectedUfo = this.availUfos[0];
            this.ufoClientIP = json.device.clientIP;
            this.ufoWifiSsid = json.device.ssid;
            this.logoColors = json.device.leds.logo.map(function (val) {
              return '#' + val;
            });
            this.topColors = json.device.leds.top.color.map(function (val) {
              return '#' + val;
            });
            this.bottomColors = json.device.leds.bottom.color.map(function (val) {
              return '#' + val;
            });

            console.log('Visualizing UFO on IP: ' + json.device.clientIP + '. Connected to WiFi: ' + json.device.ssid);
            console.log('UFO has ' + this.topColors.length + ' top LEDS and ' + this.bottomColors.length + ' bottom LEDS.');

            this.render();
          }
        }, {
          key: 'updateUfo',
          value: function updateUfo() {
            this.nextTickPromise = this.$timeout(this.updateUfo.bind(this), 1000);
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
        }]);

        return DynatraceUfoCtrl;
      }(MetricsPanelCtrl));

      _export('DynatraceUfoCtrl', DynatraceUfoCtrl);

      DynatraceUfoCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=dynatraceufo_ctrl.js.map
