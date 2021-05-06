/*eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Stack" }]*/

import "./styles.scss";
import { 
  BaseComponent,
  TimeSlider,
  DataNotes,
  DataWarning,
  LocaleService,
  LayoutService,
  TreeMenu,
  SteppedSlider,
  Dialogs,
  ButtonList,
  CapitalVizabiService,
  versionInfo
} from "VizabiSharedComponents";
import {VizabiMountainChart} from "./component.js";
import {Stack} from "./dialogs/stack/stack.js";

//import "./dialogs/axesmc/axesmc";
//import "./dialogs/robinhood/robinhood";

export default class MountainChart extends BaseComponent {

  constructor(config){

    const frameType = config.Vizabi.stores.encodings.modelTypes.frame;
    const fullMarker = config.model.markers.mountain;
    const { marker, splashMarker } = frameType.splashMarker(fullMarker);

    config.name = "mountainchart";

    config.subcomponents = [{
      type: VizabiMountainChart,
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
      name: "datanotes",
      type: DataNotes,
      placeholder: ".vzb-datanotes",
      model: marker
    },{
      type: DataWarning,
      placeholder: ".vzb-datawarning",
      options: {button: ".vzb-datawarning-button"},
      model: marker,
      name: "data-warning"
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
      <div class="vzb-datawarning"></div>
    `;

    config.services = {
      Vizabi: new CapitalVizabiService({Vizabi: config.Vizabi}),
      locale: new LocaleService(config.locale),
      layout: new LayoutService(config.layout)
    };

    super(config);
    
    this.splashMarker = splashMarker;
  }
}
MountainChart.DEFAULT_UI = {
  chart: {  
  },
};

MountainChart.versionInfo = { version: __VERSION, build: __BUILD, package: __PACKAGE_JSON_FIELDS, sharedComponents: versionInfo};
