import {
  Icons,
  LegacyUtils as utils,
  BaseComponent
} from "VizabiSharedComponents";
const {ICON_CLOSE} = Icons;

import {decorate, computed} from "mobx";

class _MCSelectList extends BaseComponent {


  setup() {

  }

  get MDL(){
    return {
      frame: this.model.encoding.frame,
      color: this.model.encoding.color,
      selectedF: this.model.encoding.selected.data.filter,
      highlightedF: this.model.encoding.highlighted.data.filter
    };
  }

  draw() {


    this.localise = this.services.locale.auto(this.MDL.frame.interval);

    this.addReaction(this.addAndRemoveLabels);
    this.addReaction(this.updateHighlighted);
  }

  isManyFacetsAndLonely(){
    return this.parent.isManyFacets && this.parent.atomicSliceData.length == 1;
  }

  isChartTooSmall(){
    return this.parent.height <= this.parent.profileConstants.minHeight;
  }

  addAndRemoveLabels(){
    const _this = this;
    this.MDL.selectedF.markers; //watch
    this.MDL.frame.value; //watch
    this.services.layout.size; //watch

    const listData = this.isManyFacetsAndLonely() || this.isChartTooSmall()
      ? []
      : this.parent.atomicSliceData
        .concat(this.parent.groupedSliceData)
        .concat(this.parent.stackedSliceData)
        .filter(d => this.MDL.selectedF.has(d))
        .sort(this._sortLabels);

    this.labels = this.element.selectAll("g.vzb-mc-label")
      .data(listData, d => d.KEY());

    this.labels.exit().remove();
    this.labels = this.labels.enter().append("g")
      .attr("class", "vzb-mc-label")
      .each(function(d) {
        const view = d3.select(this);
        _this._buildOneLabel(view, d);
      })
      .merge(this.labels);
    
    this.redraw();
  }

  _sortLabels(a, b){
    if (a.sortValue && b.sortValue) {
      if (a.sortValue[1] === b.sortValue[1]) {
        return d3.descending(a.sortValue[0], b.sortValue[0]);
      }
      return d3.descending(a.sortValue[1], b.sortValue[1]);
    }

    if (a.aggrLevel != b.aggrLevel) {
      return d3.descending(a.aggrLevel, b.aggrLevel);
    } else if (a.aggrLevel == b.aggrLevel) {
      return d3.descending(a.yMax, b.yMax);
    }

    return 0;
  }

  _buildOneLabel(view, d){
    
    view.append("circle").attr("class", "vzb-mc-label-legend");
    view.append("text").attr("class", "vzb-mc-label-shadow vzb-mc-label-text");
    view.append("text").attr("class", "vzb-mc-label-text");

    const labelCloseGroup = view.append("g")
      .attr("class", "vzb-mc-label-x vzb-label-shadow vzb-invisible")
      .on("click", (event) => {
        if (utils.isTouchDevice()) return;
        event.stopPropagation();
        this.MDL.highlightedF.delete(d);
        this.MDL.selectedF.toggle(d);
      });
      // .onTap(() => {
      //   this.MDL.highlightedF.delete(d);
      //   this.MDL.selectedF.toggle(d);
      // });

    if (!utils.isTouchDevice()) {
      utils.setIcon(labelCloseGroup, ICON_CLOSE)
        .select("svg")
        .attr("class", "vzb-mc-label-x-icon")
        .attr("width", "0px")
        .attr("height", "0px");

      labelCloseGroup.insert("circle", "svg");

    } else {
      labelCloseGroup.append("rect");
      labelCloseGroup.append("text")
        .attr("class", "vzb-mc-label-x-text")
        .text("Deselect");
    }

    view
      .on("mousemove", () => {
        if (utils.isTouchDevice()) return;
        this.showCloseCross(d, true);
        this.MDL.highlightedF.set(d);
      })
      .on("mouseout", () => {
        if (utils.isTouchDevice()) return;
        this.showCloseCross(d, false);
        this.MDL.highlightedF.delete(d);
      })
      .on("click", () => {
        if (utils.isTouchDevice()) return;
        this.MDL.highlightedF.delete(d);
        this.MDL.selectedF.toggle(d);
      });

  }


  updateHighlighted(){
    this.MDL.highlightedF.markers; //watch
    this.labels.classed("vzb-highlight", d => this.MDL.highlightedF.has(d));
  }

  redraw() {
    const _this = this;


    if (!this.labels || !this.MDL.selectedF.any()) return;

    const sample = this.element.append("g")
      .attr("class", "vzb-mc-label")
      .append("text")
      .text("0");

    let fontHeight = sample.node().getBBox().height * 1.2;
    const fontSizeToFontHeight = parseFloat(sample.style("font-size")) / fontHeight;
    d3.select(sample.node().parentNode).remove();

    const titleHeight = this.parent.DOM.yTitle.select("text").node().getBBox().height || 0;

    const maxFontHeight = (this.parent.height - titleHeight * 3) / (this.labels.data().length + 2);
    if (fontHeight > maxFontHeight) fontHeight = maxFontHeight;

    let currentAggrLevel = "null";
    let aggrLevelSpacing = 0;

    const isRTL = this.services.locale.isRTL();

    this.labels
      .attr("transform", (d, i) => {
        if (d.aggrLevel != currentAggrLevel) aggrLevelSpacing += fontHeight;
        const spacing = fontHeight * i + titleHeight * 2 + aggrLevelSpacing;
        currentAggrLevel = d.aggrLevel;
        return "translate(" + (isRTL ? this.parent.width : 0) + "," + spacing + ")";
      })
      .each(function(d, i) {

        const view = d3.select(this).attr("id", d.KEY() + "-label-" + _this.parent.id);
        let name = "";
        if (d.key) {
          name = d.key === "all" ? _this.localise("mount/merging/world") : _this.parent._getLabelText(d);
        } else {
          name = _this.parent._getLabelText(d);
        }

        const string = name + ": " + _this.localise(d.norm) + (i === 0 ? " " + _this.localise("mount/people") : "");

        const text = view.selectAll(".vzb-mc-label-text")
          .attr("x", (isRTL ? -1 : 1) * fontHeight)
          .attr("y", fontHeight)
          .text(string)
          .style("font-size", fontHeight === maxFontHeight ? (fontHeight * fontSizeToFontHeight + "px") : null);

        const contentBBox = text.node().getBBox();

        const closeGroup = view.select(".vzb-mc-label-x");

        if (utils.isTouchDevice()) {
          const closeTextBBox = closeGroup.select("text").node().getBBox();
          closeGroup
            .classed("vzb-revert-color", true)
            .select(".vzb-mc-label-x-text")
            .classed("vzb-revert-color", true)
            .attr("x", contentBBox.width + contentBBox.height * 1.12 + closeTextBBox.width * 0.5)
            .attr("y", contentBBox.height * 0.55);

          closeGroup.select("rect")
            .attr("width", closeTextBBox.width + contentBBox.height * 0.6)
            .attr("height", contentBBox.height)
            .attr("x", contentBBox.width + contentBBox.height * 0.9)
            .attr("y", 0)
            .attr("rx", contentBBox.height * 0.25)
            .attr("ry", contentBBox.height * 0.25);
        } else {
          closeGroup
            .attr("x", contentBBox.width + contentBBox.height * 1.1)
            .attr("y", contentBBox.height / 3);

          closeGroup.select("circle")
            .attr("r", contentBBox.height * 0.4)
            .attr("cx", (isRTL ? -1 : 1) * (contentBBox.width + contentBBox.height * 1.1))
            .attr("cy", contentBBox.height / 3);

          closeGroup.select("svg")
            .attr("x", (isRTL ? -1 : 1) * (contentBBox.width + contentBBox.height * (1.1 - (isRTL ? -0.4 : 0.4))))
            .attr("y", contentBBox.height * (1 / 3 - 0.4))
            .attr("width", contentBBox.height * 0.8)
            .attr("height", contentBBox.height * 0.8);
        }

        view.select(".vzb-mc-label-legend")
          .attr("r", fontHeight / 3)
          .attr("cx", (isRTL ? -1 : 1) * fontHeight * 0.4)
          .attr("cy", fontHeight / 1.5)
          .style("fill", _this.parent.MDL.color.scale.d3Scale(d.color || d[Symbol.for("key")]));

        // view.onTap((event, d) => {
        //   event.stopPropagation();
        //   _this.model.marker.highlightMarker(d.KEYS());
        //   setTimeout(() => {
        //     _this.model.marker.unhighlightMarker(d.KEYS());
        //   }, 2000);
        // });
      });
  }

  showCloseCross(d, show) {
    const key = d.KEY();
    //show the little cross on the selected label
    this.labels
      .filter(f => f.KEY() == key)
      .select(".vzb-mc-label-x")
      .classed("vzb-invisible", !show);
  }

}

export const MCSelectList = decorate(_MCSelectList, {
  "MDL": computed
});
