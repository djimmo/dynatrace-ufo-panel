import { MetricsPanelCtrl } from 'app/plugins/sdk';
import './css/dynatraceufo-panel.css!';
import './Chart.js';
import _ from 'lodash';

const panelDefaults = {
  showUfoName: true,
  showUfoIP: true,
  showUfoWiFi: true,
  showUfoLastUpdate: true,
  showDropdown: true,

  jsonFields: {
    parent: 'detailInfo',
    ufoName: 'ufo',
    ufoDeviceId: 'deviceId',
    ufoClientIP: 'clientIP',
    ufoSSID: 'ssid',
    ufoLeds: 'leds',
    ufoLedsLogo: 'logo',
    ufoLedsTop: 'top',
    ufoLedsBottom: 'bottom',
    ufoLedsColor: 'color',
    ufoLedsWhirl: 'whirl',
    ufoLedsWhirlSpeed: 'speed',
    ufoLedsWhirlDir: 'clockwise',
    ufoLedsMorph: 'morph',
    ufoLedsMorphState: 'state',
    lastUpdate: 'ActivityTime'
  }
};

export class DynatraceUfoCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $interval) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

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

    this.canvasid = ("id" + (Math.random() * 100000)).replace('.', '');

    this.topColors = [];
    this.bottomColors = [];
    this.logoColors = [];

    this.opacity = 0xff;
    this.morphFadeOut = true;
    this.curColors = null;

    this.updateLedData = function () {
      // Reset whirl and morph params
      this.opacity = 0xff;
      this.morphFadeOut = true;

      // Get data for selected Ufo and fill array with current colors
      var selectedUfoJson = this.json.filter(val => val[this.panel.jsonFields.parent][this.panel.jsonFields.ufoDeviceId] === this.selectedUfo).sort((a, b) => new Date(b[this.panel.jsonFields.lastUpdate]) - new Date(a[this.panel.jsonFields.lastUpdate]))[0];
      this.ufoName = selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoName];
      this.ufoClientIP = selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoClientIP];
      this.ufoWifiSsid = selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoSSID];
      this.ufoLastUpdate = selectedUfoJson[this.panel.jsonFields.lastUpdate][0];
      if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds] !== undefined) {
        this.logoColors = selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsLogo].map(val => '#' + val + this.opacity.toString(16));
        this.topColors = selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsTop][this.panel.jsonFields.ufoLedsColor].map(val => '#' + val + this.opacity.toString(16));
        this.bottomColors = selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsBottom][this.panel.jsonFields.ufoLedsColor].map(val => '#' + val + this.opacity.toString(16));

        // Set Whirl
        $interval.cancel(this.whirlIntervalTop);
        if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsTop][this.panel.jsonFields.ufoLedsWhirl][this.panel.jsonFields.ufoLedsWhirlSpeed] > 0) {
          this.whirlIntervalTop = $interval(() => {
            if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsTop][this.panel.jsonFields.ufoLedsWhirl][this.panel.jsonFields.ufoLedsWhirlDir]) {
              this.topColors.unshift(this.topColors.pop());
            } else {
              this.topColors.push(this.topColors.shift());
            }
            this.render();
          }, 1000);
        }

        $interval.cancel(this.whirlIntervalBottom);
        if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsBottom][this.panel.jsonFields.ufoLedsWhirl][this.panel.jsonFields.ufoLedsWhirlSpeed] > 0) {
          this.whirlIntervalBottom = $interval(() => {
            if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsBottom][this.panel.jsonFields.ufoLedsWhirl][this.panel.jsonFields.ufoLedsWhirlDir]) {
              this.bottomColors.unshift(this.bottomColors.pop());
            } else {
              this.bottomColors.push(this.bottomColors.shift());
            }
            this.render();
          }, 1000);
        }

        // Set Morph
        $interval.cancel(this.morphIntervalTop);
        if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsTop][this.panel.jsonFields.ufoLedsMorph][this.panel.jsonFields.ufoLedsMorphState] === 1) {
          this.morphIntervalTop = $interval(() => {
            if (this.morphFadeOut) {
              this.opacity -= 0x0f;
              if (this.opacity == 0x1e) {
                this.morphFadeOut = !this.morphFadeOut;
              }
            } else {
              this.opacity += 0x0f;
              if (this.opacity == 0xff) {
                this.morphFadeOut = !this.morphFadeOut;
              }
            }
            this.topColors = this.topColors.map(val => val.substring(0, 7) + this.opacity.toString(16));
            this.render();
          }, 100);
        }

        $interval.cancel(this.morphIntervalBottom);
        if (selectedUfoJson[this.panel.jsonFields.parent][this.panel.jsonFields.ufoLeds][this.panel.jsonFields.ufoLedsBottom][this.panel.jsonFields.ufoLedsMorph][this.panel.jsonFields.ufoLedsMorphState] === 1) {
          this.morphIntervalBottom = $interval(() => {
            if (this.morphFadeOut) {
              this.opacity -= 0x0f;
              if (this.opacity == 0x1e) {
                this.morphFadeOut = !this.morphFadeOut;
              }
            } else {
              this.opacity += 0x0f;
              if (this.opacity == 0xff) {
                this.morphFadeOut = !this.morphFadeOut;
              }
            }
            this.bottomColors = this.bottomColors.map(val => val.substring(0, 7) + this.opacity.toString(16));
            this.render();
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
    }
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/djimmo-dynatrace-ufo/editor.html', 2);
  }

  onPanelTeardown() {
  }

  onDataError() {
    console.log('There has been a data error!');
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
      animation: false
    };

    var config = {
      type: 'doughnut',
      data: this.data,
      options: this.options
    };

    if (this.ctx == null)
      if (document.getElementById(this.canvasid) != null)
        this.ctx = document.getElementById(this.canvasid).getContext('2d');

    if (this.ctx != null) {
      if (this.ufo == null) {
        this.ufo = new Chart(this.ctx, config);
      } else {
        this.ufo.data = this.data;
        this.ufo.update();
      }
    }
  }

  onDataReceived(dataList) {
    console.log('Data Received!');
    console.log(dataList);
    if (dataList.length !== 0) {
      console.log(dataList[0].datapoints);
      this.json = dataList[0].datapoints;

      this.availUfos = [...new Set(this.json.map(val => val[this.panel.jsonFields.parent][this.panel.jsonFields.ufoDeviceId]))];
      console.log(this.availUfos);
      console.log('Selected Ufo: ' + this.selectedUfo);
      if (this.selectedUfo === undefined) {
        console.log('No Ufo selected so selecting first one in list: ' + this.availUfos[0]);
        this.selectedUfo = this.availUfos[0];
      }
      this.updateLedData();
    }
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

  selectUfo() {
    console.log(this.selectedUfo + ' selected.');
    this.updateLedData();
  }
}

DynatraceUfoCtrl.templateUrl = 'module.html';