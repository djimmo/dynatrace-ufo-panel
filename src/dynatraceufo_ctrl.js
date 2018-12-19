import { MetricsPanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series';
import './css/dynatraceufo-panel.css!';
import './Chart.js'

const panelDefaults = {
  bgColor: null,

  dynatraceUfoSettings: {
    fontColor: 'gray',
    gridColor: 'gray',
    fontSize: 14
  }
};

export class DynatraceUfoCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $rootScope) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    this.$rootScope = $rootScope;

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));

    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));

    this.data = [];
    this.ctx = null;
    this.ufo = null;

    this.canvasid = "canvas";

    this.currentOptions = null;

    this.ufoId = null;
    this.ufoClientIP = null;
    this.ufoWifiSsid = null;
    this.topColors = [];
    this.bottomColors = [];
    this.logoColors = [];

    this.availUfos = [];
    this.selectedUfo = null;


    this.updateUfo();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/djimmo-dynatrace-ufo/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  onDataError() {
    this.series = [];
    this.render();
  }

  whirl(clockwise) {
    if (clockwise) {
      config.data.datasets[0].backgroundColor.unshift(config.data.datasets[0].backgroundColor.pop());
    } else {
      config.data.datasets[0].backgroundColor.push(config.data.datasets[0].backgroundColor.shift());
    }
    console.log('test: trying to whirl!');
    this.render();
  }

  onRender() {
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

    if (this.currentOptions == null)
      this.currentOptions = JSON.stringify(this.options);

    if (this.ctx == null)
      if (document.getElementById(this.canvasid) != null)
        this.ctx = document.getElementById(this.canvasid).getContext('2d');

    if (this.ctx != null) {
      this.ufo = new Chart(this.ctx, config);
    }
  }

  onDataReceived(dataList) {
    console.log('Data Received!');
    console.log(dataList);

    var jsonData = '{"timestamp":"1827609","device":{"id":"ufo-30aea420be35","clientIP":"172.28.165.246","ssid":"Royal-Guest","version":"Dec 17 2018 - 12:02:57","build":"1000","cpu":"ESP32","battery":"100","temperature":"22.12","leds": {"logo": ["ff0000", "00ff40", "00ff00", "000044"], "top": {"color": ["ff0000","00f400", "ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ff0000","ffff00","ff0000"],"background": "000000","whirl": {"speed": 0,"clockwise": 0},"morph": { "state": 1, "period": 80, "periodTick": 80, "speed": 8, "speedTick": 1, "percentage": 68}},"bottom": {"color": ["004400","ff4400","ff4400","ff4400","004400","004400","004400","004400","004400","004400","004400","004400","004400","004400","004400"],"background": "000000","whirl": {"speed": 0,"clockwise": 0},"morph": { "state": 1, "period": 80, "periodTick": 80, "speed": 8, "speedTick": 3, "percentage": 70}}},"freemem":"143588"}}';
    var json = JSON.parse(jsonData);

    this.ufoId = json.device.id;
    this.availUfos.push(this.ufoId);
    this.selectedUfo = this.availUfos[0];
    this.ufoClientIP = json.device.clientIP;
    this.ufoWifiSsid = json.device.ssid;
    this.logoColors = json.device.leds.logo.map(val => '#' + val);
    this.topColors = json.device.leds.top.color.map(val => '#' + val);
    this.bottomColors = json.device.leds.bottom.color.map(val => '#' + val);


    console.log('Visualizing UFO on IP: ' + json.device.clientIP + '. Connected to WiFi: ' + json.device.ssid);
    console.log('UFO has ' + this.topColors.length + ' top LEDS and ' + this.bottomColors.length + ' bottom LEDS.');

    this.render();
  }

  updateUfo() {
    this.nextTickPromise = this.$timeout(this.updateUfo.bind(this), 1000);
  }

  createLEDring(noOfLeds) {
    var arr = new Array(noOfLeds);
    for (var i = 0; i < noOfLeds; i++) {
      arr[i] = 1;
    }
    return arr;
  };

  createLabels(noOfLeds) {
    var arr = new Array(noOfLeds);
    for (var i = 0; i < noOfLeds; i++) {
      arr[i] = 'LED #' + (i + 1);
    }
    return arr;
  }
}

DynatraceUfoCtrl.templateUrl = 'module.html';