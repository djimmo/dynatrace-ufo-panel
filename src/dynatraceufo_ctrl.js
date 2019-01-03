import { MetricsPanelCtrl } from 'app/plugins/sdk';
import './css/dynatraceufo-panel.css!';
import './Chart.js'

export class DynatraceUfoCtrl extends MetricsPanelCtrl {
  constructor($scope, $injector, $interval) {
    super($scope, $injector);

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

    this.showUfoName = true;
    this.showUfoIP = true;
    this.showUfoWiFi = true;
    this.showUfoLastUpdate = true;
    this.showDropdown = true;

    this.canvasid = Math.random();

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
      var selectedUfoJson = this.json.filter(val => val.detailInfo.deviceId === this.selectedUfo).sort((a, b) => new Date(b.ActivityTime) - new Date(a.ActivityTime))[0];
      this.ufoName = selectedUfoJson.detailInfo.ufo;
      this.ufoClientIP = selectedUfoJson.detailInfo.clientIP;
      this.ufoWifiSsid = selectedUfoJson.detailInfo.ssid;
      this.ufoLastUpdate = selectedUfoJson.ActivityTime[0];
      if (selectedUfoJson.detailInfo.leds) {
        this.logoColors = selectedUfoJson.detailInfo.leds.logo.map(val => '#' + val + this.opacity.toString(16));
        this.topColors = selectedUfoJson.detailInfo.leds.top.color.map(val => '#' + val + this.opacity.toString(16));
        this.bottomColors = selectedUfoJson.detailInfo.leds.bottom.color.map(val => '#' + val + this.opacity.toString(16));
      } else {
        this.logoColors = [];
        this.topColors = [];
        this.bottomColors = [];
      }
      this.render();

      // Set Whirl
      $interval.cancel(this.whirlIntervalTop);
      if (selectedUfoJson.detailInfo.leds.top.whirl.speed > 0) {
        this.whirlIntervalTop = $interval(() => {
          if (selectedUfoJson.detailInfo.leds.top.whirl.clockwise) {
            this.topColors.unshift(this.topColors.pop());
          } else {
            this.topColors.push(this.topColors.shift());
          }
          this.render();
        }, 1000);
      }

      $interval.cancel(this.whirlIntervalBottom);
      if (selectedUfoJson.detailInfo.leds.bottom.whirl.speed > 0) {
        this.whirlIntervalBottom = $interval(() => {
          if (selectedUfoJson.detailInfo.leds.bottom.whirl.clockwise) {
            this.bottomColors.unshift(this.bottomColors.pop());
          } else {
            this.bottomColors.push(this.bottomColors.shift());
          }
          this.render();
        }, 1000);
      }

      // Set Morph
      $interval.cancel(this.morphIntervalTop);
      if (selectedUfoJson.detailInfo.leds.top.morph.state === 1) {
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
      if (selectedUfoJson.detailInfo.leds.bottom.morph.state === 1) {
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

      console.log('Visualizing UFO on IP: ' + selectedUfoJson.detailInfo.clientIP + '. Connected to WiFi: ' + selectedUfoJson.detailInfo.ssid);
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
    console.log(dataList[0].datapoints);
    this.json = dataList[0].datapoints;

    this.availUfos = [...new Set(this.json.map(val => val.detailInfo.deviceId))];
    // this.availUfoIds = [...new Set(this.json.map(val => val.detailInfo.deviceId))];
    console.log(this.availUfos);
    console.log(this.selectedUfo);
    if (this.selectedUfo === undefined) {
      this.selectedUfo = this.availUfos[0];
    }
    this.updateLedData();
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