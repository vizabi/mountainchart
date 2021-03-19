import {
  BaseComponent
} from "VizabiSharedComponents";

import {decorate, computed} from "mobx";

class MCProbe extends BaseComponent {

  constructor(config){
    config.template = `
      <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-ul"></text>
      <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-ur"></text>
      <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-dl"></text>
      <text class="vzb-mc-probe-value vzb-shadow vzb-mc-probe-value-dr"></text>
      <text class="vzb-mc-probe-value vzb-mc-probe-value-ul"></text>
      <text class="vzb-mc-probe-value vzb-mc-probe-value-ur"></text>
      <text class="vzb-mc-probe-value vzb-mc-probe-value-dl"></text>
      <text class="vzb-mc-probe-value vzb-mc-probe-value-dr"></text>
      <text class="vzb-mc-probe-extremepoverty"></text>
      <line></line>
    `;

    super(config);
  }

  setup() {
    this.DOM = {
      probe: this.element,
      probeLine: this.element.select("line"),
      probeValues: this.element.selectAll(".vzb-mc-probe-value"),
      extremepovertyText: this.element.select(".vzb-mc-probe-extremepoverty")
    };
  }


  get MDL() {
    return {
      frame: this.model.encoding.frame,
      stack: this.model.encoding.stack,
      x: this.model.encoding.x
    };
  }

  draw() {
    this.localise = this.services.locale.auto();
    this.addReaction(this.redraw);
  }


  redraw(options = {}) {
    this.services.layout.size; //watch
    this.MDL.frame.value; //watch

    const stackMode = this.MDL.stack.data.constant;
    const height = this.parent.height - this.parent.profileConstants.margin.top - this.parent.profileConstants.margin.bottom;
    

    if (!options.level) options.level = this.parent.ui.probeX; //TODO: move inside

    this.DOM.probe.classed("vzb-hidden", !options.level || !this.parent.ui.showProbeX);
    if (!options.level) return;

    this.parent.DOM.xAxis.call(this.parent.xAxis.highlightValue(options.full ? options.level : "none"));

    let sumValue = 0;
    let totalArea = 0;
    let leftArea = 0;

    const _computeAreas = (d) => {
      sumValue += d.y;
      d.shape.forEach(vertex => {
        totalArea += vertex.y;
        if (this.parent._math.rescale(vertex.x) < options.level) leftArea += vertex.y;
      });
    };

    if (stackMode === "all")
      this.parent.stackedSliceData.forEach(_computeAreas);
    else if (stackMode === "none")
      this.parent.atomicSliceData.forEach(_computeAreas);
    else
      this.parent.groupedSliceData.forEach(_computeAreas);

    const formatterPercent = d3.format(".3r");

    this.DOM.extremepovertyText
      .text(this.localise("mount/extremepoverty"))
      .classed("vzb-hidden", options.full)
      .attr("x", -height)
      .attr("y", this.parent.xScale(options.level))
      .attr("dy", "-1.15em")
      .attr("dx", "0.5em")
      .attr("transform", "rotate(-90)");

    if(!options.full) 
      this.heightOfLabels = height - this.DOM.extremepovertyText.node().getBBox().width - this.DOM.extremepovertyText.node().getBBox().height * 1.75;


    this.DOM.probeValues
      .text((d, i)=>{
        if (i === 0 || i === 4) return formatterPercent(leftArea / totalArea * 100) + "%";
        if (i === 1 || i === 5) return formatterPercent(100 - leftArea / totalArea * 100) + "%";
        if (i === 2 || i === 6) return this.localise(sumValue * leftArea / totalArea);
        if (i === 3 || i === 7) return this.localise(sumValue * (1 - leftArea / totalArea)) + " " + this.localise("mount/people");
      })
      .classed("vzb-hidden", (d, i) => !options.full && (this.parent.someSelected || (i !== 0 && i !== 4)))
      .attr("x", (d, i) => this.parent.xScale(options.level) + ([0, 4, 2, 6].includes(i) ? -6 : +5))
      .attr("y", this.heightOfLabels || (0.66 * height))
      .attr("dy", (d, i) => [0, 1, 4, 5].includes(i) ? 0 : "1.5em");

    this.DOM.probeLine
      .attr("x1", this.parent.xScale(options.level))
      .attr("x2", this.parent.xScale(options.level))
      .attr("y1", height + 6)
      .attr("y2", 0);
  }
}

const decorated = decorate(MCProbe, {
  "MDL": computed
});
export { decorated as MCProbe };