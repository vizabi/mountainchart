import {
  BaseComponent
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
        <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-head"></text>
        <text class="vzb-mc-probe-value vzb-mc-probe-value-head"></text>
      </g>
    `;

    super(config);
  }

  setup() {
    this.DOM = {
      probe: this.element,
      probeLine: this.element.select("line"),
      extremepovertyText: this.element.select(".vzb-mc-probe-extremepoverty"),
      probeBlocks: this.element.selectAll(".vzb-mc-probe-details"),
      probeValues: this.element.selectAll(".vzb-mc-probe-value:not(.vzb-mc-probe-value-head)"),
      probeValuesHead: this.element.selectAll(".vzb-mc-probe-value-head")
    };
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      stack: this.model.encoding.stack,
      color: this.model.encoding.color,
      selectedF: this.model.encoding.selected.data.filter
    };
  }

  draw() {
    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    //this.addReaction(this.redraw);
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

    if (nationalMode) {
      if (this.parent.atomicSliceData.length == 1) {
        if (!options.level) {
          options.level = this.parent.atomicSliceData[0]["povertyline"];
        }
      } else {
        this.DOM.probe.classed("vzb-hidden", true);
        return;
      }
    } else if (customMode && !options.level) {
      options.level = this.parent.ui.probeXCustom;
    } else if (!options.level) {
      options.level = this.parent.ui.probeX; //TODO: move inside
    }

    this.DOM.probe.classed("vzb-hidden", !options.level || !this.parent.ui.showProbeX);
    if (!options.level) return;

    this.element.attr("transform", `translate(${this.parent.xScale(options.level)}, 0)`);
    
    if(this.parent.xAxis.scale())
      this.parent.DOM.xAxis.call(this.parent.xAxis.highlightValue(options.full ? options.level : "none"));

    const _computeAreas = (d, result) => {
      result.sumValue += d.norm;
      if (d.shape) d.shape.forEach(vertex => {
        result.totalArea += vertex.y;
        if (this.parent._math.rescale(vertex.x) < options.level) result.leftArea += vertex.y;
      });
    };

    const values = {
        sumValue: 0,
        totalArea: 0,
        leftArea: 0
      }

    if (stackMode === "all")
      this.parent.stackedSliceData.forEach(d => _computeAreas(d, values));
    else if (stackMode === "none")
      this.parent.atomicSliceData.forEach(d => _computeAreas(d, values));
    else
      this.parent.groupedSliceData.forEach(d => _computeAreas(d, values));

    const formatterPercent = (value) => value < 0.1 ? 0 : d3.format(".2r")(value);

    this.DOM.extremepovertyText
      .classed("vzb-hidden", options.full || nationalMode || customMode)
      .text(this.localise("mount/extremepoverty"))
      .attr("x", -height)
      .attr("y", 0)
      .attr("dy", "-1.15em")
      .attr("dx", "0.5em")
      .attr("transform", "rotate(-90)");

    let epTextBBox = this.DOM.extremepovertyText.node().getBBox();

    if(epTextBBox.width > height * 0.5) {
      this.DOM.extremepovertyText.classed("vzb-hidden", true);
      epTextBBox = {width: 0, height: 0};
    }


    if(!options.full) 
      this.heightOfLabels = nationalMode ? height : height - epTextBBox.width - epTextBBox.height * 1.75;

    this.DOM.probeValues
      .text((d, i) => {
        if (i === 0 || i === 4) return formatterPercent(values.leftArea / values.totalArea * 100) + "%";
        if (i === 1 || i === 5) return formatterPercent(100 - values.leftArea / values.totalArea * 100) + "%";
        if (i === 2 || i === 6) return this.localise(values.sumValue * values.leftArea / values.totalArea);
        if (i === 3 || i === 7) return this.localise(values.sumValue * (1 - values.leftArea / values.totalArea)) + " " + this.localise("mount/people");
      })
      //!options.full && (this.parent.someSelected || (i !== 0 && i !== 4)) ||
      .classed("vzb-hidden", (d, i) => !options.full &&
        (((i === 0 || i === 4) && !this.parent.ui.probeXDetails.belowProc) ||
        ((i === 1 || i === 5) && !this.parent.ui.probeXDetails.aboveProc) ||
        ((i === 2 || i === 6) && !this.parent.ui.probeXDetails.belowCount) ||
        ((i === 3 || i === 7) && !this.parent.ui.probeXDetails.aboveCount))
      )
      .attr("x", (d, i) => ([0, 4, 2, 6].includes(i) ? -6 : +5))
      .attr("dy", (d, i) => [0, 1, 4, 5].includes(i) ? (nationalMode ? "-2.3em" : "-2.5em") : "-1.2em");

    this.DOM.probeValuesHead
      .text((d, i) => "$" + this.localise(options.level))
      .classed("vzb-hidden", (d, i) => !nationalMode)
      .attr("dy", "0.5em")
      .attr("y", (d, i) => nationalMode ? -height : null);

    this.DOM.probeLine
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", height + 6)
      .attr("y2", 0);

    const povertyLabelHeight = extremeMode ? epTextBBox.width + epTextBBox.height * 0.5 : (height * 0.25);
  
    if (!options.full) {
      this.DOM.probeBlocks.attr("transform", (d, i) => `translate (0, ${height - (nationalMode ? 0 : povertyLabelHeight)})`);
    }
  
  }

}

const decorated = decorate(MCProbe, {
  "MDL": computed
});
export { decorated as MCProbe };
