import {
  BaseComponent,
  Utils
} from "VizabiSharedComponents";

import {decorate, computed} from "mobx";

class MCProbe extends BaseComponent {

  constructor(config){
    config.template = `
      <text class="vzb-mc-probe-extremepoverty"></text>
      <line></line>
      <g class="vzb-mc-probe-details">
        <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-ul"></text>
        <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-ur"></text>
        <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-dl"></text>
        <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-dr"></text>
        <text class="vzb-mc-probe-value vzb-mc-probe-value-ul"></text>
        <text class="vzb-mc-probe-value vzb-mc-probe-value-ur"></text>
        <text class="vzb-mc-probe-value vzb-mc-probe-value-dl"></text>
        <text class="vzb-mc-probe-value vzb-mc-probe-value-dr"></text>
      </g>
      <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-head"></text>
      <text class="vzb-mc-probe-value vzb-mc-probe-value-head"></text>
    `;

    super(config);
  }

  setup(options) {
    this.DOM = {
      probe: this.element,
      probeLine: this.element.select("line"),
      extremepovertyText: this.element.select(".vzb-mc-probe-extremepoverty"),
      probeBlocks: this.element.selectAll(".vzb-mc-probe-details"),
      probeValues: this.element.selectAll(".vzb-mc-probe-value:not(.vzb-mc-probe-value-head)"),
      probeValuesHead: this.element.selectAll(".vzb-mc-probe-value-head")
    };

    this.povertylineMarkerName = options.povertylineMarkerName;
    this.povertylineEncName = options.povertylineEncName;
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      stack: this.model.encoding.stack,
      povertylineMarker: this.root.model.markers[this.povertylineMarkerName]
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    //this.addReaction(this.redraw);
  }

  _isProbeModelReady() {
    return this.MDL.povertylineMarker.state == Utils.STATUS.READY;
  }

  _getNationalLevel(markerItem){
    const frameConcept = this.MDL.frame.data.concept;
    const dims = this.MDL.povertylineMarker.data.space.filter(f => f != frameConcept);
    const getKey = (d) => dims.map(dim => d[dim]).join("¬");
        
    const povertyLineData = this.MDL.povertylineMarker.dataArray
      //filter only the items that match the mountain in the chart
      .filter(f => getKey(f) === getKey(markerItem) && f[this.povertylineEncName])
      //take nearest item to current frame value
      .sort((a,b) => Math.abs(this.MDL.frame.value - b[frameConcept]) - Math.abs(this.MDL.frame.value - a[frameConcept]))
      .pop() || {};
    
    return {level: povertyLineData[this.povertylineEncName], time: povertyLineData[frameConcept]};
  }

  redraw(options = {}) {
    this.services.layout.size; //watch
    this.parent.ui.inpercent;
    this.MDL.frame.value; //watch

    const stackMode = this.MDL.stack.data.constant;
    const height = this.parent.height - this.parent.profileConstants.margin.top - this.parent.profileConstants.margin.bottom;

    const extremeMode = this.parent.ui.probeXType == "extreme";
    const nationalMode = this.parent.ui.probeXType == "national";
    const customMode = this.parent.ui.probeXType == "custom";

    const data = {
      level: options.level,
      time: null,
      sumValue: 0,
      totalArea: 0,
      leftArea: 0
    }

    if (options.full && data.level){
      //pass on without modifying          
    }
    else if (nationalMode) {
      if (this.parent.atomicSliceData.length == 1 && this._isProbeModelReady()) {
        Object.assign(data, this._getNationalLevel(this.parent.atomicSliceData[0]));
      } else {
        this.DOM.probe.classed("vzb-hidden", true);
        return;
      }
    } else if (customMode && !data.level) {
      data.level = this.parent.ui.probeXCustom;
    } else if (!data.level) {
      data.level = this.parent.ui.probeX; //TODO: move inside
    }

    this.DOM.probe.classed("vzb-hidden", !data.level || !this.parent.ui.showProbeX);
    if (!data.level) return;

    this.element.attr("transform", `translate(${this.parent.xScale(data.level)}, 0)`);
    
    if(this.parent.xAxis.scale())
      this.parent.DOM.xAxis.call(this.parent.xAxis.highlightValue(options.full ? data.level : "none"));

    const _computeAreas = (d, result) => {
      result.sumValue += d.norm;
      if (d.shape) d.shape.forEach(vertex => {
        result.totalArea += vertex.y;
        if (this.parent._math.rescale(vertex.x) < result.level) result.leftArea += vertex.y;
      });
    };

    if (stackMode === "all")
      this.parent.stackedSliceData.forEach(d => _computeAreas(d, data));
    else if (stackMode === "none")
      this.parent.atomicSliceData.forEach(d => _computeAreas(d, data));
    else
      this.parent.groupedSliceData.forEach(d => _computeAreas(d, data));

    const formatterPercent = (value) => value < 0.1 ? 0 : d3.format(".2r")(value);

    const notInLargestFacet = () => this.parent.isManyFacets && this.parent.parent.largetstFacetId !== this.parent.name;

    this.DOM.extremepovertyText
      .classed("vzb-hidden", options.full || !extremeMode || notInLargestFacet)
      .text(this.localise("mount/extremepoverty"))
      .attr("x", -height)
      .attr("y", 0)
      .attr("dy", "-1.15em")
      .attr("dx", "0.5em")
      .attr("transform", "rotate(-90)");

    let epTextBBox = extremeMode ? this.DOM.extremepovertyText.node().getBBox() : {width: 0, height: 0};

    if(epTextBBox.width > height * 0.5) {
      this.DOM.extremepovertyText.classed("vzb-hidden", true);
      epTextBBox = {width: 0, height: 0};
    }

    const suffix = !this.parent.isManyFacets || this.parent.state.positionInFacet.row.first ? " " + this.localise("mount/people") : "";
    this.DOM.probeValues
      .text((d, i) => {
        if (i === 0 || i === 4) return formatterPercent(data.leftArea / data.totalArea * 100) + "%";
        if (i === 1 || i === 5) return formatterPercent(100 - data.leftArea / data.totalArea * 100) + "%";
        if (i === 2 || i === 6) return this.localise(data.sumValue * data.leftArea / data.totalArea);
        if (i === 3 || i === 7) return this.localise(data.sumValue * (1 - data.leftArea / data.totalArea)) + suffix;
      })
      .classed("vzb-hidden", (d, i) => !options.full &&
        (((i === 0 || i === 4) && !this.parent.ui.probeXDetails.belowProc) ||
        ((i === 1 || i === 5) && !this.parent.ui.probeXDetails.aboveProc) ||
        ((i === 2 || i === 6) && !this.parent.ui.probeXDetails.belowCount) ||
        ((i === 3 || i === 7) && !this.parent.ui.probeXDetails.aboveCount))
      )
      .attr("x", (d, i) => ([0, 4, 2, 6].includes(i) ? -6 : +5))
      .attr("dy", (d, i) => [0, 1, 4, 5].includes(i) ? "-2.5em" : "-1.2em");

    this.DOM.probeValuesHead
      .text(`${this.localise(data.level)}$ (${this.localise(data.time)})`)
      .classed("vzb-hidden", !nationalMode || options.full)
      .attr("dy", "0.3em")
      .attr("y", 0);

    this.DOM.probeLine
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", height + 6)
      .attr("y2", 0);

    const riseAllValues = height > this.parent.profileConstants.minHeight 
      ? Math.max(epTextBBox.width + epTextBBox.height * 0.5, height / 4 )
      : 0; 
    
    this.DOM.probeBlocks.attr("transform", `translate (0, ${height - riseAllValues})`);
  
  }
}

const decorated = decorate(MCProbe, {
  "MDL": computed
});
export { decorated as MCProbe };
