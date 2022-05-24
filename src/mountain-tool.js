/*eslint no-unused-vars: ["warn", { "varsIgnorePattern": "Stack" }]*/

import "./styles.scss";
import { 
  BaseComponent,
  DateTimeBackground,
  TimeSlider,
  DataNotes,
  LocaleService,
  LayoutService,
  TreeMenu,
  SteppedSlider,
  Dialogs,
  ButtonList,
  CapitalVizabiService,
  Repeater,
  Facet,
  AddGeo,
  versionInfo,
  LegacyUtils as utils,
} from "VizabiSharedComponents";
import {VizabiMountainChart} from "./mountain-cmp.js";
import {Stack} from "./dialogs/stack/stack.js";
import {PovertyLine} from "./dialogs/povertyline/povertyline.js";
import {Presets} from "./dialogs/presets/presets.js";

//import "./dialogs/axesmc/axesmc";
//import "./dialogs/robinhood/robinhood";

export default class MountainChart extends BaseComponent {

  constructor(config){

    const markerName = config.options.markerName || "mountain";
    const fullMarker = config.model.markers[markerName];

    const frameType = config.Vizabi.stores.encodings.modelTypes.frame;
    const { marker, splashMarker } = frameType.splashMarker(fullMarker);

    config.model.markers[markerName] = marker;

    config.name = "mountainchart";

    config.subcomponents = [{
      type: Repeater,
      placeholder: ".vzb-repeater",
      model: marker,
      options: {
        repeatedComponent: Facet, 
        repeatedComponentCssClass: "vzb-facet",
        repeatedComponentOptions: {
          facetedComponent: VizabiMountainChart,
          facetedComponentCssClass: "vzb-mountainchart"
        }
      },
      name: "chart",
    },{
      type: AddGeo,
      placeholder: ".vzb-addgeo",
      name: "addgeo",
      model: marker,
      options: {
        PROFILE_CONSTANTS: utils.deepExtend({}, VizabiMountainChart.PROFILE_CONSTANTS, {
          LARGE: {dy: 5}, MEDIUM: {dy: 1}, SMALL: {dy: 0}
        }),
        PROFILE_CONSTANTS_FOR_PROJECTOR: utils.deepExtend({}, VizabiMountainChart.PROFILE_CONSTANTS_FOR_PROJECTOR, {
          LARGE: {dy: 16}, MEDIUM: {dy: 10}
        }),
        xAlign: "right",
        yAlign: "top"
      }
    },{
      type: DateTimeBackground,
      placeholder: ".vzb-datetime",
      name: "datetime",
      model: marker
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
      <div class="vzb-chart">
        <div class="vzb-datetime"></div>
        <div class="vzb-repeater"></div>
        <div class="vzb-addgeo"></div>
      </div>
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
      Vizabi: new CapitalVizabiService({Vizabi: config.Vizabi}),
      locale: new LocaleService(config.locale),
      layout: new LayoutService(config.layout)
    };

    super(config);
    
    this.splashMarker = splashMarker;
  }
  draw(){
    this.addReaction(this.updatePercentButton);
  }
  updatePercentButton(){
    const enabled = !!this.model.markers.mountain.encoding.facet_row.data.concept;
    this.findChild({type: "ButtonList"}).setButtonUnavailable("inpercent", !enabled);
  }
}
MountainChart.DEFAULT_UI = {
  chart: {  
  },
};

MountainChart.versionInfo = { version: __VERSION, build: __BUILD, package: __PACKAGE_JSON_FIELDS, sharedComponents: versionInfo};
