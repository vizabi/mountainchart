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
    this.catalog = null;
    this.catalogReady = false;
    this._getCatalog();
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      color: this.model.encoding.color,
      ultrarichMarker: this.root.model.markers[this.ultrarichMarkerName]
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    this.addReaction(this.redraw);
    //this.addReaction(this._getCatalog);
    this.addReaction(this._copyframevalue);
  }

  _isModelReady() {
    return this.MDL.ultrarichMarker.state == Utils.STATUS.READY && this.catalogReady;
  }


  _getCatalog() {
    // this.model.data.spaceCatalog.then(spaceCatalog => {
    //     console.log(spaceCatalog)
    // })
    const setMembershipFlags = this.model.data.source.availability.data
      .map(m => m.value)
      .filter(f => f.includes("is--"))
    const countryprops = this.model.data.source.availability.data
      .filter(f => f.key.includes("country") && setMembershipFlags.includes("is--" + f.value))
      .map(m => m.value)

    this.model.data.source.query({
      select: {
        key: ["geo"],
        value: countryprops
      },
      from: "entities"
    }).then(data => {
      this.catalog = data.forKey(["geo"]);
      this.catalogReady = true
    });
  }
  _copyframevalue() {
    this.MDL.ultrarichMarker.encoding.frame.config.value =
      this.MDL.frame.value;
  }

  _getBillyData(mountains) {
    return this.MDL.ultrarichMarker.dataArray
        .filter(f => 
          d3.intersection(mountains.map(m => m.geo), Object.values(this.catalog.get(f.geo))).size
          && this.MDL.frame.value - f.time == 0)
        .slice(0, 10)
  }

  redraw(options = {}) {
    const _this = this;

    if (!this._isModelReady()) return;

    const r = 4;
    const hash = (string) => {
      return d3.sum(string.split("").map(m=>m.charCodeAt(0)) ) % this.parent.profileConstants.minHeight 
    }


    let circles = this.DOM.container.selectAll("circle")
      .data(this._getBillyData(this.parent.atomicSliceData), d => d.person);

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
      .style("fill", d => this.parent.MDL.color.scale.d3Scale(this.catalog.get(d.geo)[this.MDL.color.data.concept]))
      .attr("r", r)
      .attr("cy", d => this.parent.yScale(0) - hash(d.person) - r)
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
  "catalogReady": observable
});
export { decorated as MCUltraRich };
