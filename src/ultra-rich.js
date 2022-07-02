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
      container: this.element
    };

    this.ultrarichMarkerName = options.ultrarichMarkerName;
    this.ultrarichEncName = options.ultrarichEncName;
    this.drilldowns = null;
    this.billy = new Set();
    this.drilldownsReady = false;
    this.billyReady = false;
    this.colorMap = {};
    this.colorMapReady = false;
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      color: this.model.encoding.color,
      ultrarichMarker: this.root.model.markers[this.ultrarichMarkerName],
      ultrarichFrame: this.root.model.markers[this.ultrarichMarkerName].encoding.frame
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    this.addReaction(this.copyframevalue);
    this.addReaction(this.getDrillDowns);
    this.addReaction(this.getBillies);
    this.addReaction(this.getColorMapping);
    this.addReaction(this.redraw);
  }


  getDrillDowns() {

    const DRILLDOWN_CONCEPT = "country";
    const dim = this.model.data.space[0];
    const entity = this.parent.atomicSliceData.map(m => m[dim]);
    
    if(this.drilldownsReady == entity.join("")) return;
    this.drilldownsReady = false;
    this.model.data.source.drilldown({dim, entity})
      .then( catalog => {
        this.drilldowns = catalog[DRILLDOWN_CONCEPT];
        this.drilldownsReady = entity.join("");
      }); 

  }

  copyframevalue() {
    this.MDL.ultrarichFrame.config.value = this.MDL.frame.value;
  }

  getBillies() {
    if(this.MDL.ultrarichMarker.state !== Utils.STATUS.READY || !this.drilldownsReady) return;

    this.billyReady = false;
    const allBilly = this.MDL.ultrarichMarker.encoding.geos.data.domainData;
    for(let [_, billy] of allBilly) {
      if(d3.intersection(this.drilldowns, billy.countries.split(";")).size) 
        this.billy.add(billy.person);
      else
        this.billy.delete(billy.person);
    }
    this.billyReady = true;
  }

  getColorMapping(){
    const dim = "geo";
    const entitySet = "country";

    this.colorMapReady = false;
    this.model.data.source.drillupCatalog.then(c => {
      const entities = c[dim][entitySet].get(Symbol.for("drill_up"));
      for(let [key, entity] of entities) {
        this.colorMap[key] = entity[this.MDL.color.data.concept];
      }
      this.colorMapReady = true;
    });
    
  }


  redraw(options = {}) {
    const _this = this;
    this.services.layout.size; //watch
    this.parent.ui.inpercent;

    if(this.MDL.ultrarichMarker.state !== Utils.STATUS.READY || !this.drilldownsReady || !this.billyReady || !this.colorMapReady) return;

    const r = 4;
    const hash = (string) => {
      return d3.sum(string.split("").map(m=>m.charCodeAt(0)) )  
    }

    const getBillyData = () => { 
      if (this.MDL.ultrarichFrame.scale.domain[0] - this.MDL.frame.value > 0 || this.MDL.frame.value - this.MDL.ultrarichFrame.scale.domain[1] > 0)
        return [];
      else
        return this.MDL.ultrarichMarker.dataArray
          .filter(f => this.billy.has(f.person))
          .slice(0, this.parent.ui.howManyBilly)
    }

    let circles = this.DOM.container.selectAll("circle")
      .data(getBillyData(), d => d.person);

    circles.join("circle")
      .style("stroke", "black")
      .on("mouseenter", (event, d) => {
        this.parent._setTooltip(event, d.name.split(";")[0] + " " + this.localise(d.x) + " $/day");
        // this.parent.runHereOrPossiblyInAllFacets(function (context) {
        //   context.DOM.xAxis.call(context.xAxis.highlightValue(d.x));
        // })
      })
      .on("mouseout", (event, d) => {
        this.parent._setTooltip();
        // this.parent.runHereOrPossiblyInAllFacets(function (context) {
        //   context.DOM.xAxis.call(context.xAxis.highlightValue("none"));
        // })
      })
      .style("fill", d => 
        this.parent.MDL.color.scale.d3Scale(this.colorMap[d.geos.split(";")[0]])
      )
      .attr("r", r)
      .attr("cy", d => this.parent.yScale(0) - hash(d.person) % this.parent.profileConstants.minHeight - r)
      .each(function(d){
        const view = d3.select(this);

        const transition = _this.parent.duration && view.attr("cx")
          ? view.transition().duration(_this.parent.duration).ease(d3.easeLinear) 
          : view.interrupt();

        transition.attr("cx", d => _this.parent.xScale(d.x));
      })
      





  }
}

const decorated = decorate(MCUltraRich, {
  "MDL": computed,
  "drilldownsReady": observable,
  "billyReady": observable,
  "colorMapReady": observable,
});
export { decorated as MCUltraRich };
