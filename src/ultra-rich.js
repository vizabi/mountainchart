import {
  BaseComponent,
  Icons,
  LegacyUtils as utils,
  Utils
} from "VizabiSharedComponents";
import sign from "./ultra-rich-sign.js";

const {ICON_QUESTION} = Icons;
import { decorate, computed, observable } from "mobx";

class MCUltraRich extends BaseComponent {

  constructor(config) {
    config.template = ``;

    super(config);
  }

  setup(options) {
    this.DOM = {
      container: this.element,
      sign: this.element.append("g").attr("class", "vzb-billy-sign"),
      arrow: this.element.append("g").attr("class", "vzb-billy-arrow vzb-hidden").html(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <g>
      <path d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm-28.9 143.6l75.5 72.4H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h182.6l-75.5 72.4c-9.7 9.3-9.9 24.8-.4 34.3l11 10.9c9.4 9.4 24.6 9.4 33.9 0L404.3 273c9.4-9.4 9.4-24.6 0-33.9L271.6 106.3c-9.4-9.4-24.6-9.4-33.9 0l-11 10.9c-9.5 9.6-9.3 25.1.4 34.4z"/>
      </g>
      </svg>`),
      bridgeShapeBlur: this.element.append("g"),
      bridgeShape: this.element.append("g"),
      circlebox: this.element.append("g"),
      zoombox: this.element.append("g"),
      hlFace: this.element.append("circle"),
      hlLine: this.element.append("line"),
      unknownCircle: this.element.append("circle"),
      text: this.element.append("g").attr("class", "vzb-billy-text"),
      defs: this.element.append("defs")
    };
    this.DOM.text.append("text");
    this.DOM.info = this.DOM.zoombox.append("g").attr("class", "vzb-billy-info"),
    this.DOM.boxTopText = this.DOM.zoombox.append("text"),
    this.DOM.upperbox = this.DOM.zoombox.append("rect").attr("class", "vzb-billy-upperbox");
    this.DOM.lowerbox = this.DOM.zoombox.append("rect").attr("class", "vzb-billy-lowerbox");
    this.DOM.arc = this.DOM.zoombox.append("path").attr("class", "vzb-billy-arc");
    this.DOM.sign.append("g").attr("transform", `translate(-19, -297)`).html(sign);

    this.DOM.defs.html(`
      <linearGradient id="progFade-${this.parent.name}" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="black"/>
        <stop offset="30%" stop-color="white"/>      
      </linearGradient>

      <linearGradient id="progFade1-${this.parent.name}" x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stop-color="#444"/>
        <stop offset="50%" stop-color="white"/>      
      </linearGradient>
      
      <mask class="progFadeMask" id="progFadeMask-${this.parent.name}" >
        <rect fill="url(#progFade-${this.parent.name})"  />
      </mask>

      <mask class="clipMask" id="clipMask-${this.parent.name}" >
        <rect fill="url(#progFade1-${this.parent.name})"  />
      </mask>
      
      <pattern id="vzb-pattern-billy-bridgeshape-${this.parent.name}" style="stroke: white; fill: transparent; stroke-width:10px;" x="0" y="0" patternUnits="userSpaceOnUse" width="25" height="25" viewBox="0 0 500 500"> 
<path d="m308.54 177.46a80 80 0 0 0-80 80 80 80 0 0 0 54.279 75.572 80 80 0 0 1-5.0957-7.959 80 80 0 0 1-0.63867-1.1699 80 80 0 0 1-3.6797-7.7324 80 80 0 0 1-0.83593-2.2422 80 80 0 0 1-2.4277-7.377 80 80 0 0 1-0.76758-3.5195 80 80 0 0 1-1.2832-6.5801 80 80 0 0 1-0.74023-10.371 80 80 0 0 1 3.2402-22.539 80 80 0 0 1 9.459-20.713 80 80 0 0 1 6.8398-9.1367 80 80 0 0 1 8.0723-8.0723 80 80 0 0 1 9.1367-6.8398 80 80 0 0 1 10.02-5.4707 80 80 0 0 1 10.693-3.9883 80 80 0 0 1 22.539-3.2402 80 80 0 0 1 8.6055 0.47851 80 80 0 0 1 0.40626 0.0508 80 80 0 0 1 8.2441 1.3789 80 80 0 0 1 0.32812 0.0742 80 80 0 0 1 8.2812 2.3359 80 80 0 0 0-64.676-32.939m191.46 316.62c-8.9547-3.3531-18.438-5.0737-28-5.0801-10.833 0.0651-29.786 6.2106-39.718 11.265m-350.28-430.26a80 80 0 0 0-27.434 5.0664 80 80 0 0 1 0 0.0059 80 80 0 0 1-15.6 41.514 80 80 0 0 1-0.57617 0.79492 80 80 0 0 1-5.0957 5.9863 80 80 0 0 1-1.416 1.4707 80 80 0 0 1-5.4844 5.127 80 80 0 0 1-1.6582 1.2988 80 80 0 0 1-19.064 11.264 80 80 0 0 1-3.2383 1.4062 80 80 0 0 0-0.43359 6.0664 80 80 0 0 0 80 80 80 80 0 0 0 80-80 80 80 0 0 0-80-80m6 236a80 80 0 0 0-80 80 80 80 0 0 0 80 80 80 80 0 0 0 80-80 80 80 0 0 0-0.2832-6.457 80 80 0 0 1-23.588-50.529 80 80 0 0 0-56.129-23.014m73.994-156.26a80 80 0 0 1 0.00586 0.26172 80 80 0 0 1-80 80 80 80 0 0 1-39.994-10.92 80 80 0 0 0 79.994 79.92 80 80 0 0 0 80-80 80 80 0 0 0-40.006-69.262m205.66-41.738a80 80 0 0 0-79.443 72.225 80 80 0 0 1 20.326-2.7598 80 80 0 0 1 64.676 32.939 80 80 0 0 1 45.297 39.18 80 80 0 0 0 29.145-61.584 80 80 0 0 0-80-80m-143.98 134.65a80 80 0 0 0-27.184 4.9746 80 80 0 0 1-47.305 46.402 80 80 0 0 0-5.5117 28.623 80 80 0 0 0 80 80 80 80 0 0 0 75.115-53.234 80 80 0 0 1-16.197-16.678 80 80 0 0 1-54.055-75.273 80 80 0 0 1 1.5-14.539 80 80 0 0 0-6.3633-0.27539m-161.26 29.613a80 80 0 0 0-12.418 42.736 80 80 0 0 0 0.052734 0.80273 80 80 0 0 1 37.947-9.8027 80 80 0 0 1 56.062 22.957 80 80 0 0 1-0.38867-6.3066 80 80 0 0 1 5.5117-28.623 80 80 0 0 0 0.30078-0.13476 80 80 0 0 1-27.486 5.1074 80 80 0 0 1-59.582-26.736m236.36 77.143a80 80 0 0 1-75.104 53.244 80 80 0 0 1-1.752-0.125 80 80 0 0 0-1.9219 16.475 80 80 0 0 0 80 80 80 80 0 0 0 80-80 80 80 0 0 0-21.002-53.787 80 80 0 0 1-11.65 0.87305 80 80 0 0 1-48.57-16.68m-55.777-224.41a80 80 0 0 0-66.482 35.656 80 80 0 0 1 25.482 58.344 80 80 0 0 1-5.4004 28.592 80 80 0 0 1 27.074-4.9414 80 80 0 0 1 6.3633 0.27539 80 80 0 0 0-0.0449 0.30469 80 80 0 0 1 58.219-63.006 80 80 0 0 1 10.512-32.393 80 80 0 0 0-55.723-22.832m106-66a80 80 0 0 0-79.344 70.816 80 80 0 0 1 29.066 18.016 80 80 0 0 1 68.932-39.832 80 80 0 0 1 61.287 28.605 80 80 0 0 0-79.941-77.605m-201-29a80 80 0 0 0-69.191 40.209 80 80 0 0 1 3.1914-0.20898 80 80 0 0 1 79.994 79.738 80 80 0 0 1 14.52 10.922 80 80 0 0 1 49.357-33.598 80 80 0 0 0 2.1289-17.062 80 80 0 0 0-80-80m-148 355.26a80 80 0 0 1 8.0664 2.0215 80 80 0 0 1-0.066406-1.2793 80 80 0 0 1 16.098-48.035 80 80 0 0 0-0.0098-0.0137l3.5e-5 3e-5a80 80 0 0 1-24.088 8.666m0-157.36a80 80 0 0 1 13.67 3.918 80 80 0 0 0 0.11523-1.4141 80 80 0 0 1-4.1607-7.7092m276.63 315.95a80 80 0 0 1 0.70117-2.1816 80 80 0 0 1-43.27-22.15 80 80 0 0 0-43.535 24.332m-88.682 0a80 80 0 0 1-10.871-32.582 80 80 0 0 0-4.3164-1.8516 80 80 0 0 1-8.2812 0.43359 80 80 0 0 1-22.086-3.209 80 80 0 0 1 0.085938 1.209 80 80 0 0 1-8.7402 36m-42.805 0a80 80 0 0 0-14.455-6.6387m500-303.93c-4.9438-0.94808-9.9661-1.4274-15-1.4316-13.307 0.0391-26.394 3.3969-38.076 9.7695-2.6282 20.176-12.845 38.593-28.572 51.502 5.904 11.374 8.9893 24 8.9961 36.814-0.0577 10.345-2.1212 20.58-6.0762 30.139 10.733 14.174 25.881 24.369 43.053 28.975m35.676 40.232c-4.9438-0.94808-9.9661-1.4274-15-1.4316-38.854 3e-3 -72.087 27.923-78.793 66.193 18.046 11.202 28.228 24.755 34.506 46.168m58.966-149.02c-43.984 4.9051-67.705-17.093-78.372-31.213-10.638 26.272-34.384 44.954-62.422 49.109 13.488 14.666 21.017 33.837 21.115 53.762-0.0361 7.0455-1.0028 14.055-2.875 20.848 0.0825-0.2392 0.1639-0.47878 0.24414-0.71875 10.372 1.8262 20.282 5.6826 29.16 11.348 6.5622-38.264 39.649-66.293 78.471-66.477 5.0339 4e-3 10.056 0.48356 15 1.4316m-68.141-385.43a80 80 0 0 0-39.859 69 80 80 0 0 0 0.1875 2.9883 80 80 0 0 1 34.086 47.352 80 80 0 0 0-2.8477-9.5859 80 80 0 0 1 10.574-0.75391 80 80 0 0 1 65.936 34.74 80 80 0 0 0 0.06445-0.01757m-299.85-143.72a80 80 0 0 0-19.184 37.133 80 80 0 0 1 47.033 72.867 80 80 0 0 1-2.0859 16.826 80 80 0 0 0 0.41406 0.1543 80 80 0 0 1 16.672-1.9805 80 80 0 0 1 28.967 5.8242 80 80 0 0 0-2.3106-1.0078 80 80 0 0 1 38.02-58.771 80 80 0 0 0-2.8047 1.6035 80 80 0 0 1-20.871-53.648 80 80 0 0 1 2.4707-19m-271.42 0a80 80 0 0 1 39.945 69 80 80 0 0 1-0.39258 6.0547 80 80 0 0 1 24.26-4.9395 80 80 0 0 1 65.26-39.867 80 80 0 0 1-32.658-30.248m-54.328 0a80 80 0 0 1-16.955 22.664 80 80 0 0 0-24.881-22.664" />
      </pattern>

      <pattern id="vzb-pattern-billy-bridgeshape-1${this.parent.name}" style="stroke: white; fill: transparent; stroke-width:10px;" x="0" y="0" patternUnits="userSpaceOnUse" width="25" height="25" viewBox="0 0 500 500"> 
          <circle cx="65" cy="39" r="80" />
          <circle cx="180" cy="-41" r="80" />
          <circle cx="259" cy="54" r="80" />
          <circle cx="364" cy="19" r="80" />
          <circle cx="472" cy="69" r="80" />
          <circle cx="434" cy="189" r="80" />
          <circle cx="427" cy="378" r="80" />
          <circle cx="485" cy="464" r="80" />
          <circle cx="485" cy="268" r="80" />
          <circle cx="65" cy="539" r="80" />
          <circle cx="180" cy="459" r="80" />
          <circle cx="259" cy="554" r="80" />
          <circle cx="364" cy="518" r="80" />
          <circle cx="-66" cy="189" r="80" />
          <circle cx="-45" cy="378" r="80" />
          <circle cx="-14" cy="464" r="80" />
          <circle cx="-14" cy="268" r="80" />
          <circle cx="148" cy="110" r="80" />
          <circle cx="349" cy="139" r="80" />
          <circle cx="243" cy="205" r="80" />
          <circle cx="300" cy="419" r="80" />
          <circle cx="345" cy="291" r="80" />
          <circle cx="130" cy="315" r="80" />
          <circle cx="247" cy="335" r="80" />
          <circle cx="85" cy="129" r="80" />
          <circle cx="122" cy="219" r="80" />
          <circle cx="88" cy="386" r="80" />
          <circle cx="82" cy="150" r="80" />
          <circle cx="-14" cy="464" r="80" />
          <circle cx="-14" cy="-36" r="80" />
          <circle cx="472" cy="569" r="80" />
          <circle cx="-25" cy="69" r="80" />
          <circle cx="-26" cy="569" r="80" />
          <circle cx="30" cy="300" r="80" />
          <circle cx="530" cy="300" r="80" />
        </pattern>
    `)


    this.DOM.defs.append("marker")
      .attr("id", "triangle")
      .attr("viewBox", "0 0 15 10")
      .attr("refX", "15")
      .attr("refY", "5")
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", "15")
      .attr("markerHeight", "10")
      .attr("orient", "-45deg")
      .html(`<path d="M 0 0 L 15 5 L 0 10 z" fill="grey" stroke="grey"/>`);      

    this.billyMarkerName = options.ultrarichMarkerName;
    this.billyEncName = options.ultrarichEncName;
    this.drilldowns = null;
    this.drilldownsReady = false;
    this.wholeWorld = false;
    this.relevantBilly = new Map();
    this.relevantBillyReady = false;
    this.colorMap = {};
    this.colorMapReady = false;
    this.imagesAvaiable = {};
    this.imagesReady = false;

    
    const start = this.parent.ui.xStart;
    const end = this.parent.ui.xEnd;
    const nbrackets = this.parent.ui.xPoints;
    const step = Math.pow(end/start, 1/nbrackets);
    this.mesh = d3.range(this.parent.ui.billyMeshXPoints).map(m => [start * Math.pow(step, m), start * Math.pow(step, m + 0.5), start * Math.pow(step, m + 1) ]);
    this.bins = this.mesh.map(m => 0);

    this._dataNotes = this.root.findChild({name: "datanotes"});
    utils.setIcon(this.DOM.info, ICON_QUESTION).select("svg").attr("width", "0px").attr("height", "0px");
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      color: this.model.encoding.color,
      billyMarker: this.root.model.markers[this.billyMarkerName],
      billyX: this.root.model.markers[this.billyMarkerName].encoding.x,
      billyFrame: this.root.model.markers[this.billyMarkerName].encoding.frame,
      billySlices: this.root.model.markers[this.billyMarkerName].encoding[this.billyEncName],
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    this.addReaction(this.updateSign);
    if(!this.parent.ui.showBilly || !this.MDL.billyX.data.concept) return;
    this.addReaction(this.copyframevalue);
    this.addReaction(this.getDrillDowns);
    this.addReaction(this.getRelevantBillies);
    this.addReaction(this.getColorMapping);
    this.addReaction(this.getBillyImages);
    this.addReaction(this.redraw);

    this.addReaction(this.disableReactions);
  }

  disableReactions(){
    if(this.parent.ui.showBilly) return;
    this.removeReaction(this.copyframevalue);
    this.removeReaction(this.getDrillDowns);
    this.removeReaction(this.getRelevantBillies);
    this.removeReaction(this.getColorMapping);
    this.removeReaction(this.getBillyImages);
    this.removeReaction(this.redraw);
    this.DOM.circlebox.selectAll("circle").remove();
    this.DOM.zoombox.classed("vzb-hidden", true);
    this.DOM.text.classed("vzb-hidden", true);
    this.DOM.bridgeShape.classed("vzb-hidden", true);
    this.DOM.bridgeShapeBlur.classed("vzb-hidden", true);
  }

  copyframevalue() {
    this.MDL.billyFrame.config.value = this.localise(this.MDL.frame.value);
  }

  updateSign(){
    this.services.layout.size; //watch
    this.parent.ui.inpercent;
    this.parent.ui.showBilly;
    let scale, shift;
    if(viz.services.layout.profile == "LARGE") {scale = 1.3; shift = 500; } ;
    if(viz.services.layout.profile == "MEDIUM") {scale = 1.3; shift = 500; };
    if(viz.services.layout.profile == "SMALL") {scale = 1.0; shift = 450; };
    this.DOM.sign.attr("transform", `translate(${this.parent.xScale(shift)}, ${this.parent.yScale(0)}) scale(${scale})`)
      .on("click", () => { 
        this.root.ui.chart.showBilly = !this.root.ui.chart.showBilly 
      });

    this.DOM.sign
      .select("#arrow").attr("transform", `rotate(${this.parent.ui.showBilly? 180: 0}) translate(${this.parent.ui.showBilly? "-34 -525": "0 -10"})`);
    this.DOM.sign
      .select("#text div").html(this.parent.ui.showBilly ? "hide" : "show<br/>the<br/>rich");

    this.DOM.arrow.attr("transform", `translate(${this.parent.xScale.range()[1]}, ${this.parent.yScale(0)})`)
      .on("click", () => { 
        this.root.ui.chart.showBilly = !this.root.ui.chart.showBilly 
      });

    this.DOM.arrow
      .select("svg")
      .attr("width", this.parent.profileConstants.infoElHeight)
      .attr("height", this.parent.profileConstants.infoElHeight)
    this.DOM.arrow
      .select("g").attr("transform", `rotate(${this.parent.ui.showBilly? 180: 0}) translate(${this.parent.ui.showBilly? "-500 -500": "0 0"})`);


    
  }

  getHardcodedWholeWorldShortcuts(){
    const dim = this.principalDimension;
    const filter = this.model.data.filter.config.dimensions[dim] || false;
    const notFacet = this.model.encoding.facet_row.data.constant === "none";

    return false
      //showing all countries in one chart
      || filter["un_state"] && notFacet
      //showing world as one shape
      || filter["is--global"] && notFacet;
  }

  getDrillDowns() {
    const dim = this.principalDimension;
    const entity = this.parent.atomicSliceData.map(m => m[dim]);
    
    //prevent recalcualaion if list of entities didn't change
    if(this.drilldownsReady == entity.join("")) return;

    this.drilldownsReady = false;
    const drilldownPromise = this.model.data.source.drilldown({dim, entity})
      .then( catalog => {
        if (catalog) {
          const drilldownEntitySet = Object.keys(catalog)[0]; //"country"
          this.drilldowns = catalog[drilldownEntitySet];
        }
      });

    this.wholeWorld = this.getHardcodedWholeWorldShortcuts();
    const isFullEntitySetPromise = this.wholeWorld ? Promise.resolve()
    : this.model.data.isFullEntitySet(dim, entity)
      .then(fullset => {
        this.wholeWorld = fullset;
      });

    Promise.all([drilldownPromise, isFullEntitySetPromise]).then(() => {
      this.drilldownsReady = entity.join("");
    })
  }

  getRelevantBillies() {
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady) return;

    this.relevantBillyReady = false;
    const allBilly = this.MDL.billySlices.data.domainData;
    const billySliceConcept = this.MDL.billySlices.data.concept;
    this.relevantBilly = new Map();
    for(let [, billy] of allBilly) {
      const intersection = d3.intersection(this.drilldowns, billy[billySliceConcept]?.split(";"));
      if(intersection.size){
        const [firstEntity] = intersection;
        this.relevantBilly.set(billy.person, firstEntity);
      } else {
        this.relevantBilly.delete(billy.person);
      }
    }
    this.relevantBillyReady = true;
  }

  getColorMapping(){
    const dim = this.principalDimension;

    this.colorMapReady = false;
    this.model.data.source.drillupCatalog.then(catalog => {
      const drilldownEntitySet = Object.keys(catalog[dim])[0]; //"country"
      const entities = catalog[dim][drilldownEntitySet].get(Symbol.for("drill_up"));
      for(let [key, entity] of entities) {
        this.colorMap[key] = entity[this.MDL.color.data.concept];
      }
      this.colorMapReady = true;
    });
  }

  getBillyImages(){
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady || !this.relevantBillyReady) return;

    if (!this.isShowFaces) return this.imagesReady = true;
    
    this.imagesReady = false;
    const promises = [];
    for (let billy of this._getBillyData()){
      const promise = this.fetchOneImage(billy.person);
      if (!promise) continue;
      promises.push(promise);
    }
    Promise.all(promises).then(() => {
      this.imagesReady = true;
    });
  }

  fetchOneImage(person){
    //this prevents checking and loading the images again for those who have been checked already
    if(this.imagesAvaiable[person] || this.imagesAvaiable[person] === false) return false;

    const reader = this.MDL.billyMarker.data.source.reader;      
    return reader.checkIfAssetExists(person + ".png")
      .then(response => {
        this.imagesAvaiable[person] = response.status === 200 && response.url;

        if(this.imagesAvaiable[person]){
          this.DOM.defs.append("pattern")
            .attr("id", "vzb-billy-image-" + person)
            .attr("x", "0%")
            .attr("y", "0%")
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("viewBox", "0 0 100 100")
            .html(`<image x="0%" y="0%" width="100" height="100" xlink:href="${response.url}"></image>`);

          return true;
        }
      })
      .catch(() => {
        throw ("Billy: error when fetching a portrait for: " + person);
      });
  }

  isOutsideOfTimeRange(){
    return this.MDL.billyFrame.scale.domain[0] - this.MDL.frame.value > 0 || this.MDL.frame.value - this.MDL.billyFrame.scale.domain[1] > 0;
  }

  _getBillyData() {     
    const getSortValue = (d) => {
      const color = this.colorMap[this.relevantBilly.get(d.person)];
      return this.parent.sortValuesForGroups[color] || this.parent.stickySortValues[color] || 0;
    }

    const processOneBilly = (d) => {
      d.color = this.colorMap[this.relevantBilly.get(d.person)];

      for (let i=0; i<this.mesh.length; i++){
        if (this.mesh[i][0] < d.x && d.x <= this.mesh[i][2]) {
          d.binNumber = i;
          d.binnedX = this.mesh[i][1];
          d.yInBin = this.bins[i];
          this.bins[i]++;
          if (!this.binsByColor[d.color]) this.binsByColor[d.color] = this.mesh.map(m => 0);
          d.yInBinByColor = this.binsByColor[d.color][i];
          this.binsByColor[d.color][i]++;
        }
      } 
      return d;
    }

    this.bins = this.mesh.map(m => 0);
    this.binsByColor = {};
    if (this.isOutsideOfTimeRange())
      return [];
    else
      return d3.shuffle(
        //shuffle for more pleasant distribution within stacked bars
         this.MDL.billyMarker.dataArray
          .filter(f => this.wholeWorld || this.relevantBilly.has(f.person))
          .slice(0, this.parent.ui.howManyBilly)
        )
        //sort billy to follow the colors of stacked mountains
        .sort((a,b) => getSortValue(a) - getSortValue(b))
        .map(processOneBilly)
  }



  get principalDimension() {
    const frameConcept = this.MDL.frame.data.concept;
    return this.model.data.space.filter(f => f !== frameConcept)[0];
  }

  get isShowFaces() {
    return this.parent.ui.howManyBilly < 11 && this.parent.ui.billyFaces;
  }

  redraw() {
    this.services.layout.size; //watch
    this.parent.ui.inpercent;
    this.imagesReady;
    
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady || !this.relevantBillyReady || !this.colorMapReady) return;

    const data = this._getBillyData();

    const params = this.computeLayout(data)
    const zoomboxParams = this.redrawZoombox(params);
    Object.assign(params, zoomboxParams);
    this.redrawBridgeShape(params);
    this.redrawCircles(data, params);
    this.redrawText(this.isOutsideOfTimeRange());
    this.updateBoxTopText(d3.format(".2r")(data.length) + " richest people", params);
    
  }



  computeLayout(data) {
    const DOT_R = 4;

    const h = 10;
    const gap = 20;
    const topMargin = this.parent.state.positionInFacet.row.first ? 50 : 10;
    const H = this.parent.yScale.range()[0] - h - gap - topMargin;

    let DOT_STEP = H * this.parent.ui.billyYScale / (d3.max(this.bins)||100);
    if (DOT_STEP > DOT_R * 2) DOT_STEP = DOT_R * 2;
    const PACK_HARDER = DOT_STEP < 4;
   
    const showZoombox = (DOT_STEP < 8 || d3.max(this.bins) > 7) && data.length > 0;

    return {showZoombox, DOT_STEP, DOT_R, PACK_HARDER, h, gap, H};
  }



  redrawZoombox({showZoombox, h, gap, H}) {
    const _this = this;

    const appearing = this.DOM.upperbox.classed("vzb-hidden") && showZoombox;

    this.DOM.zoombox.classed("vzb-hidden", !showZoombox);

    if (!showZoombox) return;

    const xmin = 4000; //this.mesh[this.bins.findIndex(f => f > 0)][0];
    const xmax = this.mesh.concat().reverse()[this.bins.concat().reverse().findIndex(f => f > 0) - 1][1];
    const W = this.parent.xScale(xmax) - this.parent.xScale(xmin);

    
    const X = this.parent.xScale(xmin);
    const Y = this.parent.yScale.range()[0] - gap - h - H;
    const y = this.parent.yScale.range()[0] - h;
    
    const upperboxT = this.parent.duration && !appearing
      ? this.DOM.upperbox.transition().duration(this.parent.duration).ease(d3.easeLinear) 
      : this.DOM.upperbox.interrupt();

    const lowerboxT = this.parent.duration && !appearing
      ? this.DOM.lowerbox.transition().duration(this.parent.duration).ease(d3.easeLinear) 
      : this.DOM.lowerbox.interrupt();

    const arcT = this.parent.duration && !appearing
      ? this.DOM.arc.transition().duration(this.parent.duration).ease(d3.easeLinear) 
      : this.DOM.arc.interrupt();      

    upperboxT.attr("x", X).attr("y", Y).attr("width", W).attr("height", H);
    lowerboxT.attr("x", X).attr("y", y).attr("width", W).attr("height", h);
    arcT.attr("d", `M ${X} ${y + h / 2} A ${h} ${2 * h}, 0, 0 1, ${X} ${y - 5 * h}`);

    const infoElHeight = this.parent.profileConstants.infoElHeight;
    this.DOM.info
      .on("click", () => {
        this._dataNotes.pin();
      })
      .on("mouseenter", function() {
        const rect = this.getBBox();
        const coord = utils.makeAbsoluteContext(this, this.farthestViewportElement)(rect.x - 10, rect.y + rect.height + 10);
        const toolRect = _this.root.element.node().getBoundingClientRect();
        const chartRect = _this.element.node().getBoundingClientRect();
        _this._dataNotes.setEncoding(_this.MDL.billyX).show().setPos(coord.x + chartRect.left - toolRect.left, coord.y);
      })
      .on("mouseout", () => {
        this._dataNotes.hide();
      })
      .classed("vzb-hidden", false)
      .attr("transform", `translate(${ X + W - infoElHeight * 1.5 }, ${ Y + infoElHeight * 0.5 })`)
      .select("svg")
      .attr("width", infoElHeight + "px")
      .attr("height", infoElHeight + "px")


    return ({xmin, xmax, W,X,Y,y});      
  }

  redrawBridgeShape({showZoombox, DOT_STEP, DOT_R, PACK_HARDER, X,Y,W,H,h,y,xmax,xmin, gap}) {
    const _this = this;
    this.DOM.bridgeShape.classed("vzb-hidden", !showZoombox);
    this.DOM.bridgeShapeBlur.classed("vzb-hidden", !showZoombox);

    if (!showZoombox) return;

    // define path generator
    const xScale = this.parent.xScale;
    const height = this.parent.yScale(0);
    const range0 = height - h - gap;
    this.yBridgeShapeScale = d3.scaleLinear().domain([0, d3.max(this.bins)]).range([range0, range0 - d3.max(this.bins) * DOT_STEP - DOT_R * 2]);
    const area = d3.area()
      .curve(d3.curveBasis)
      .x(d => xScale(d.x))
      .y0(d => this.yBridgeShapeScale(d.y0 ))
      .y1(d => this.yBridgeShapeScale((d.y + d.y0) ));
    //define d3 stack layout
    const stackLayout = d3.stack()
      //.order(d3.stackOrderReverse)
      .value((i, slice) => slice.shape[i].y);


      
    this.bridgeShapes = [];
    let stackBins = this.mesh.map(m => 0);
    Object.keys(this.binsByColor).forEach((color, i )=> {
      const bins = this.binsByColor[color];
      const shape = this.mesh.map((m,i) => ({x: m[1], y0: stackBins[i], y: bins[i]}));
      const startIndex = bins.indexOf(d3.max(bins));
      for(let i=startIndex; i>0; i--)  shape[i-1].y = shape[i].y * 1.1;
      stackBins = stackBins.map((m,i) => m + shape[i].y);
      this.bridgeShapes.push({color,shape});
    })
      //.filter(f => 1000 < f.x && f.x < 100e6);

     const getColor = (d) => this.parent.MDL.color.scale.d3Scale(d.color);

    this.DOM.defs.selectAll("mask rect")
      .attr("x", X).attr("y", Y).attr("width", W).attr("height", H);

    this.DOM.bridgeShapeBlur.selectAll("path")
      .data(this.bridgeShapes, d => d.color)
      .join("path")
      .attr("d", d => area(d.shape.filter(f => xmin < f.x && f.x < xmax)))
      .style("fill", d => getColor(d) || "#ccc")
      .on("mousemove", function(event, d){
        _this.updateUnknownHint(event, d, {showZoombox, X,Y,W});
      })
      .on("mouseout", function(){
        _this.updateUnknownHint();
      })
      .attr("mask", `url(#clipMask-${this.parent.name})`)
      .style("opacity", this.parent.ui.opacityRegular) //opacitySelectDim

    this.DOM.bridgeShape.selectAll("path")
      .data(this.bridgeShapes, d => d.color)
      .join("path")
      .style("pointer-events", "none")
      .attr("d", d => area(d.shape.filter(f => xmin < f.x && f.x < xmax)))
      .style("fill", `url(#vzb-pattern-billy-bridgeshape-${this.parent.name})`)
      .attr("mask", `url(#progFadeMask-${this.parent.name})`)
      .style("opacity", 1)  
  }


  redrawCircles(data, {showZoombox, DOT_STEP, DOT_R}) {
    const _this = this;
    const FACE_R = 10;
    const FACEHOVER_R = 50;

    const getColor = (d) => this.parent.MDL.color.scale.d3Scale(this.colorMap[this.relevantBilly.get(d.person)]);
    const hasFace = (d) => this.isShowFaces && this.DOM.defs.select(`#vzb-billy-image-${d.person}`).node();
    const getTooltip = (d) => (d.name || d.person).split(";")[0] + " " + _this.localise(d.x) + " $/day";

    const bridgeShapeByColor = {};
    if(showZoombox){
      this.bridgeShapes.forEach(d => {bridgeShapeByColor[d.color] = d.shape})
    }

    const shiftAllCircles = (showZoombox? -30 : 0) + _this.parent.yScale(0) - 1 - (_this.isShowFaces ? FACE_R : DOT_R);

    const getY = (d) => {
      if (!showZoombox) return shiftAllCircles - d.yInBinByColor * (_this.isShowFaces ? FACE_R * 2 : DOT_STEP)
      const bin = bridgeShapeByColor[d.color];
      return shiftAllCircles
        - bin[d.binNumber].y0 * DOT_STEP
        - bin[d.binNumber].y * DOT_STEP * d.yInBinByColor / this.binsByColor[d.color][d.binNumber];
    }


    const circles = this.DOM.circlebox.selectAll("circle")
      .data(d3.shuffle(data), d => d.person)

    circles.exit().remove();
    circles.enter().append("circle")
      .on("mouseenter", function(event, d){
        _this.parent._setTooltip(event, getTooltip(d));

        const face = _this.DOM.defs.select(`#vzb-billy-image-${d.person}`).node();
        if (face) 
          _this.highlightFace(event, d);
        else {
          const promise = _this.fetchOneImage(d.person);
          if(promise) promise.then((success) => {
            if(success) _this.highlightFace(event, d)
          });

        }
      })
      .on("mouseout", function(event, d) {
        _this.parent._setTooltip();
        _this.highlightFace();
      })
      .merge(circles)
      .style("stroke-width", d => hasFace(d) ? 2 : 0.25 )
      .style("stroke", d => hasFace(d) ? getColor(d) : "black")
      .attr("r", d => hasFace(d) ? FACE_R : DOT_R)
      .style("fill", d => hasFace(d) ? `url(#vzb-billy-image-${d.person})` : getColor(d) )
      .each(function(){
        const view = d3.select(this);

        const transition = _this.parent.duration && view.attr("cy")
          ? view.transition().duration(_this.parent.duration).ease(d3.easeLinear) 
          : view.interrupt();

        transition
          .attr("cy", d => getY(d))
          .attr("cx", d => _this.parent.xScale(d.x));
      });

      return;
  }

  highlightFace(event, d){

    this.DOM.hlLine.classed("vzb-hidden", !d);
    this.DOM.hlFace.classed("vzb-hidden", !d);
    if(!d) return;

    const target = d3.select(event.target);
    const cy = +target.attr("cy");
    const cx = +target.attr("cx");
    const r = +target.attr("r")
    const stroke = target.style("stroke")

    const position = cy > 150 ? "top" : "right";

    this.DOM.hlLine
      .attr("x1", cx)
      .attr("y1", cy)
      .attr("x2", position === "top" ? cx : this.parent.xScale.range()[1] - 50)
      .attr("y2", position === "top" ? cy - 100 : 50)
      .style("stroke", stroke)

    const length = this.DOM.hlLine.node().getTotalLength();
    this.DOM.hlLine.style("stroke-dasharray", `0 ${r} ${length - 50 - r} ${50}`)

    this.DOM.hlFace
      .attr("r", 50)
      .attr("cx", position === "top" ? cx : this.parent.xScale.range()[1] - 50)
      .attr("cy", position === "top" ? cy - 100 : 50)
      .style("stroke", stroke)
      .style("fill", `url(#vzb-billy-image-${d.person})` )
      
  }

  updateUnknownHint(event, d, params){
    const roundN = (x,n) => Math.ceil(x/n)*n;

     if(!event) {
       this.parent._setTooltip();
       this.DOM.unknownCircle.classed("vzb-hidden", true);
       this.DOM.boxTopText.classed("vzb-hidden", true)
       return;
     }
    this.parent._setTooltip(event, "Unknown rich person");
    const mouse = d3.pointer(event);
    this.DOM.unknownCircle
      .classed("vzb-hidden", false)
      .style("stroke-width", 0.5 )
      .style("stroke", "black")
      .style("pointer-events", "none")
      .style("fill", d3.select(event.target).style("fill"))
      .attr("cx", roundN(mouse[0] - 4, 3))
      .attr("cy", roundN(mouse[1] - 4, 3))
      .attr("r", 4)
      
    this.updateBoxTopText("Why unknown persons? →", params)
  }


  updateBoxTopText(text, {showZoombox, X,Y,W}={}){
    const infoElHeight = this.parent.profileConstants.infoElHeight;
    this.DOM.boxTopText.classed("vzb-hidden", !showZoombox)

    if(!showZoombox) return;

    this.DOM.boxTopText
      .text(text)
      .style("text-anchor", "end")
      .attr("x", X + W - infoElHeight * 2)
      .attr("y", Y + infoElHeight)
      .attr("dy", "0.3em");
  }



  redrawText(show){
    this.DOM.text
      .classed("vzb-hidden", !show)
      .attr("transform", `translate(${this.parent.xScale.range()[1] - 100}, ${this.parent.yScale.range()[0]}) `)
      .select("text")
      .attr("y", "-3.5em")
      .html(`
        <tspan x="0" dy=".6em">Billionaire data is</tspan>
        <tspan x="0" dy="1.2em">available between</tspan>
        <tspan x="0" dy="1.2em">${this.localise(this.MDL.billyFrame.scale.domain[0])} and ${this.localise(this.MDL.billyFrame.scale.domain[1])}</tspan>
        `)
  }


}

const decorated = decorate(MCUltraRich, {
  "MDL": computed,
  "drilldownsReady": observable,
  "relevantBillyReady": observable,
  "billyReady": observable,
  "colorMapReady": observable,
  "imagesReady": observable,
  "isShowFaces": computed,
  "principalDimension": computed,
});
export { decorated as MCUltraRich };
