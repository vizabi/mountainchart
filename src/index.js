import "./styles.scss";
import component from "./component";
import "./dialogs/axesmc/axesmc";

const VERSION_INFO = { version: __VERSION, build: __BUILD };

// MOUNTAIN CHART TOOL
const MountainChart = Vizabi.Tool.extend("MountainChart", {

  /**
   * Initializes the tool (MountainChart Tool).
   * Executed once before any template is rendered.
   * @param {Object} placeholder Placeholder element for the tool
   * @param {Object} external_model Model as given by the external page
   */
  init(placeholder, external_model) {

    this.name = "mountainchart";

    //specifying components
    this.components = [{
      component,
      placeholder: ".vzb-tool-viz",
      model: ["state.time", "state.marker", "locale", "data", "ui"] //pass models to component
    }, {
      component: Vizabi.Component.get("timeslider"),
      placeholder: ".vzb-tool-timeslider",
      model: ["state.time", "state.marker", "ui"]
    }, {
      component: Vizabi.Component.get("dialogs"),
      placeholder: ".vzb-tool-dialogs",
      model: ["state", "ui", "locale"]
    }, {
      component: Vizabi.Component.get("buttonlist"),
      placeholder: ".vzb-tool-buttonlist",
      model: ["state", "ui", "locale"]
    }, {
      component: Vizabi.Component.get("treemenu"),
      placeholder: ".vzb-tool-treemenu",
      model: ["state.marker", "state.marker_tags", "state.time", "locale"]
    }, {
      component: Vizabi.Component.get("datawarning"),
      placeholder: ".vzb-tool-datawarning",
      model: ["locale"]
    }, {
      component: Vizabi.Component.get("datanotes"),
      placeholder: ".vzb-tool-datanotes",
      model: ["state.marker", "locale"]
    }, {
      component: Vizabi.Component.get("steppedspeedslider"),
      placeholder: ".vzb-tool-stepped-speed-slider",
      model: ["state.time", "locale"]
    }];

    //constructor is the same as any tool
    this._super(placeholder, external_model);
  },

  default_model: {
    state: {
      time: {
        "delay": 100,
        "delayThresholdX2": 50,
        "delayThresholdX4": 25
      },
      "entities": {
        "opacitySelectDim": 0.3,
        "opacityRegular": 0.7
      }
    },
    locale: { },
    ui: {
      chart: {
        manualSortingEnabled: true,
        yMaxMethod: "latest",
        showProbeX: true,
        probeX: 1.85,
        xLogStops: [1, 2, 5],
        xPoints: 50,
        directSigma: false, //false = input is gini, true = input is standatd deviation of the distribution
        directMu: false, //false = input is GDP/capita, true = input is mean of the distribution
        preload: "income_mountains",
        preloadKey: "world"
      },
      "buttons": ["colors", "find", "stack", "show", "moreoptions", "fullscreen", "presentation"],
      "dialogs": {
        "popup": ["colors", "find", "stack", "show", "moreoptions"],
        "sidebar": ["colors", "find", "stack"],
        "moreoptions": ["opacity", "speed", "stack", "axesmc", "colors", "presentation", "about"]
      },
      datawarning: {
        doubtDomain: [],
        doubtRange: []
      },
      presentation: false
    }
  },

  versionInfo: VERSION_INFO
});

export default MountainChart;
