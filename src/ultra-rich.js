import {
  BaseComponent,
  Utils
} from "VizabiSharedComponents";

import { decorate, computed, observable } from "mobx";

class MCUltraRich extends BaseComponent {

  constructor(config) {
    config.template = ``;

    super(config);
  }

  setup(options) {
    this.DOM = {
      container: this.element,
      defs: this.element.append("defs")
    };

    this.billyMarkerName = options.ultrarichMarkerName;
    this.billyEncName = options.ultrarichEncName;
    this.drilldowns = null;
    this.drilldownsReady = false;
    this.relevantBilly = new Set();
    this.relevantBillyReady = false;
    this.colorMap = {};
    this.colorMapReady = false;
    this.imagesAvaiable = {};
    this.imagesReady = false;
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      color: this.model.encoding.color,
      billyMarker: this.root.model.markers[this.billyMarkerName],
      billyFrame: this.root.model.markers[this.billyMarkerName].encoding.frame,
      billySlices: this.root.model.markers[this.billyMarkerName].encoding[this.billyEncName],
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    if(!this.parent.ui.showBilly) return;
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
    this.DOM.container.selectAll("circle").remove();
  }

  copyframevalue() {
    this.MDL.billyFrame.config.value = this.MDL.frame.value;
  }

  getDrillDowns() {
    const dim = this.principalDimension;
    const entity = this.parent.atomicSliceData.map(m => m[dim]);
    
    if(this.drilldownsReady == entity.join("")) return;
    this.drilldownsReady = false;
    this.model.data.source.drilldown({dim, entity})
      .then( catalog => {
        const drilldownEntitySet = Object.keys(catalog)[0]; //"country"
        this.drilldowns = catalog[drilldownEntitySet];
        this.drilldownsReady = entity.join("");
      }); 

  }

  getRelevantBillies() {
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady) return;

    this.relevantBillyReady = false;
    const allBilly = this.MDL.billySlices.data.domainData;
    const billySliceConcept = this.MDL.billySlices.data.concept;
    for(let [_, billy] of allBilly) {
      if(d3.intersection(this.drilldowns, billy[billySliceConcept].split(";")).size) 
        this.relevantBilly.add(billy.person);
      else
        this.relevantBilly.delete(billy.person);
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
      const person = billy.person;

      //this prevents checking and loading the images again for those who have been checked already
      if(this.imagesAvaiable[person] || this.imagesAvaiable[person] === false) continue;

      const reader = this.MDL.billyMarker.data.source.reader;      
      const promise = reader.checkIfAssetExists(person + ".png")
        .then(response => {
          this.imagesAvaiable[person] = response.status === 200 && response.url;

          if(this.imagesAvaiable[person])
            this.DOM.defs.append("pattern")
              .attr("id", "vzb-billy-image-" + person)
              .attr("x", "0%")
              .attr("y", "0%")
              .attr("height", "100%")
              .attr("width", "100%")
              .attr("viewBox", "0 0 100 100")
              .html(`<image x="0%" y="0%" width="100" height="100" xlink:href="${response.url}"></image>`);
        })
        .catch(() => {
          throw ("Billy: error when fetching a portrait for: " + person);
        });

      promises.push(promise);
    }
    Promise.all(promises).then(() => {
      this.imagesReady = true;
    })
  }

  _getBillyData() { 
    if (this.MDL.billyFrame.scale.domain[0] - this.MDL.frame.value > 0 || this.MDL.frame.value - this.MDL.billyFrame.scale.domain[1] > 0)
      return [];
    else
      return this.MDL.billyMarker.dataArray
        .filter(f => this.relevantBilly.has(f.person))
        .slice(0, this.parent.ui.howManyBilly)
  }

  get principalDimension() {
    const frameConcept = this.MDL.frame.data.concept;
    return this.model.data.space.filter(f => f !== frameConcept)[0];
  }

  get isShowFaces() {
    return this.parent.ui.howManyBilly < 11;
  }

  redraw() {
    const _this = this;
    this.services.layout.size; //watch
    this.parent.ui.inpercent;
    this.imagesReady;
    
    if(this.MDL.billyMarker.state !== Utils.STATUS.READY || !this.drilldownsReady || !this.relevantBillyReady || !this.colorMapReady) return;

    const DOT_R = 4;
    const FACE_R = 12;
    const FACEHOVER_R = 50;

    const namehash = (string) => d3.sum(string.split("").map(m=>m.charCodeAt(0)) );
    const getColor = (d) => this.parent.MDL.color.scale.d3Scale(this.colorMap[d.slices.split(";").filter(f => this.drilldowns.includes(f))[0]]);
    const hasFace = (d) => this.isShowFaces && this.DOM.defs.select(`#vzb-billy-image-${d.person}`).node();
    const getTooltip = (d) => d.name.split(";")[0] + " " + _this.localise(d.x) + " $/day";

    const data = this._getBillyData();
    this.DOM.container.selectAll("circle")
      .data(data, d => d.person)
      .join("circle")
      .on("mouseenter", function(event, d){
        _this.parent._setTooltip(event, getTooltip(d));
        if (hasFace(d)) d3.select(this).attr("r", FACEHOVER_R);
      })
      .on("mouseout", function(event, d) {
        _this.parent._setTooltip();
        if (hasFace(d)) d3.select(this).attr("r", FACE_R);
      })
      .attr("cy", d => this.parent.yScale(0) - namehash(d.person) % (this.parent.yScale(1) / 2) - 2 * DOT_R)
      .style("stroke", d => hasFace(d) ? getColor(d) : "black" )
      .attr("r", d => hasFace(d) ? FACE_R : DOT_R)
      .style("fill", d => hasFace(d) ? `url(#vzb-billy-image-${d.person})` : getColor(d) )
      .each(function(d){
        const view = d3.select(this);

        const transition = _this.parent.duration && view.attr("cx")
          ? view.transition().duration(_this.parent.duration).ease(d3.easeLinear) 
          : view.interrupt();

        transition.attr("cx", d => _this.parent.xScale(d.x));
      });
  }
}

const decorated = decorate(MCUltraRich, {
  "MDL": computed,
  "drilldownsReady": observable,
  "billyReady": observable,
  "colorMapReady": observable,
  "imagesReady": observable,
  "isShowFaces": computed,
  "principalDimension": computed,
});
export { decorated as MCUltraRich };
