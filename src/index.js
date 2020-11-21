import "./styles.scss";
import { 
  BaseComponent,
  TimeSlider,
  DataNotes,
  //DataWarning,
  LocaleService,
  LayoutService,
  TreeMenu,
  SteppedSlider,
  Dialogs,
  ButtonList
} from "VizabiSharedComponents";
import VizabiMountainchart from "./component.js";
import { observable } from "mobx";

//import "./dialogs/axesmc/axesmc";
//import "./dialogs/robinhood/robinhood";

//const VERSION_INFO = { version: __VERSION, build: __BUILD };

// MOUNTAIN CHART TOOL
export default class MountainChart extends BaseComponent {

  constructor(config){
    const marker = config.model.stores.markers.get("mountain");

    config.name = "mountainchart";

    config.subcomponents = [{
      type: VizabiMountainchart,
      placeholder: ".vzb-mountainchart",
      model: marker,
      name: "chart"
    },{
      type: TimeSlider,
      placeholder: ".vzb-timeslider",
      name: "time-slider",
      model: marker
    },{
      type: SteppedSlider,
      placeholder: ".vzb-speedslider",
      name: "speed-slider",
      model: marker
    },{
      type: TreeMenu,
      placeholder: ".vzb-treemenu",
      name: "tree-menu",
      model: marker
    },{
      type: DataNotes,
      placeholder: ".vzb-datanotes",
      model: marker
    },{
      type: Dialogs,
      placeholder: ".vzb-dialogs",
      model: marker,
      name: "dialogs"
    },{
      type: ButtonList,
      placeholder: ".vzb-buttonlist",
      name: "buttons",
      model: marker
    }];

    config.template = `
      <div class="vzb-mountainchart"></div>
      <div class="vzb-animationcontrols">
        <div class="vzb-timeslider"></div>
        <div class="vzb-speedslider"></div>
      </div>
      <div class="vzb-sidebar">
        <div class="vzb-dialogs"></div>
        <div class="vzb-buttonlist"></div>
      </div>
      <div class="vzb-treemenu"></div>
      <div class="vzb-datanotes"></div>
    `;

    config.services = {
      locale: new LocaleService(config.locale),
      layout: new LayoutService({placeholder: config.placeholder})
    };

    //register locale service in the marker model
    config.model.config.markers.mountain.data.locale = observable({
      get id() { return config.services.locale.id; }
    });

    super(config);
  }
}
MountainChart.DEFAULT_UI = {
  time: {
    "delay": 100,
    "delayThresholdX2": 50,
    "delayThresholdX4": 25
  },
  chart: {  
    opacitySelectDim: 0.3,
    opacityRegular: 0.7
  },
  datawarning: {
    doubtDomain: [],
    doubtRange: []
  },
};



// "buttons": ["colors", "find", "stack", "moreoptions", "presentation", "sidebarcollapse", "fullscreen"],
// "dialogs": {
//   "popup": ["colors", "find", "stack", "moreoptions"],
//   "sidebar": ["colors", "find", "stack"],
//   "moreoptions": ["opacity", "speed", "stack", "axesmc", "robinhood", "colors", "presentation", "about"]
//npm run build && cp ./build/* ../../tools-page/node_modules/vizabi-mountainchart/build/