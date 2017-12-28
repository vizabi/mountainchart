const { utils } = Vizabi;

const MCProbe = Vizabi.Class.extend({

  init(context) {
    this.context = context;

  },

  redraw(options) {
    const _this = this.context;
    if (!options) options = {};

    if (!options.level) options.level = _this.model.ui.chart.probeX;

    _this.probeEl.classed("vzb-hidden", !options.level || !_this.model.ui.chart.showProbeX);
    if (!options.level) return;

    _this.xAxisEl.call(_this.xAxis.highlightValue(options.full ? options.level : "none"));

    let sumValue = 0;
    let totalArea = 0;
    let leftArea = 0;

    const _computeAreas = function(d) {
      sumValue += d.valuesPointer.axis_y[utils.getKey(d.KEYS(), _this.dataKeys.axis_y)];
      _this.cached[d.KEY()].forEach(d => {
        totalArea += d.y;
        if (_this._math.rescale(d.x) < options.level) leftArea += d.y;
      });
    };

    if (_this.model.marker.stack.which === "all") {
      _this.stackedPointers.forEach(_computeAreas);
    } else if (_this.model.marker.stack.which === "none") {
      _this.mountainPointers.forEach(_computeAreas);
    } else {
      _this.groupedPointers.forEach(_computeAreas);
    }

    const formatter1 = d3.format(".3r");
    const formatter2 = _this.model.marker.axis_y.getTickFormatter();
    _this.heightOfLabels = _this.heightOfLabels || (0.66 * _this.height);

    _this.probeTextEl.each(function(d, i) {
      if (i !== 8) return;
      const view = d3.select(this);

      if (!options.full && _this.model.ui.chart.probeX == _this.model.marker.axis_x.tailFatX) {

        view.text(_this.translator("mount/extremepoverty"))
          .classed("vzb-hidden", false)
          .attr("x", -_this.height)
          .attr("y", _this.xScale(options.level))
          .attr("dy", "-1.15em")
          .attr("dx", "0.5em")
          .attr("transform", "rotate(-90)");

        _this.heightOfLabels = _this.height - view.node().getBBox().width - view.node().getBBox().height * 1.75;
      } else {
        view.classed("vzb-hidden", true);
      }
    });


    _this.probeTextEl.each(function(d, i) {
      if (i === 8) return;
      const view = d3.select(this);

      let string;
      if (i === 0 || i === 4) string = formatter1(leftArea / totalArea * 100) + "%";
      if (i === 1 || i === 5) string = formatter1(100 - leftArea / totalArea * 100) + "%";
      if (i === 2 || i === 6) string = formatter2(sumValue * leftArea / totalArea);
      if (i === 3 || i === 7) string = formatter2(sumValue * (1 - leftArea / totalArea)) + " " + _this.translator("mount/people");

      view.text(string)
        .classed("vzb-hidden", !options.full && (_this.someSelected || (i !== 0 && i !== 4)))
        .attr("x", _this.xScale(options.level) + ([0, 4, 2, 6].indexOf(i) > -1 ? -6 : +5))
        .attr("y", _this.heightOfLabels)
        .attr("dy", [0, 1, 4, 5].indexOf(i) > -1 ? 0 : "1.5em");
    });


    _this.probeLineEl
      .attr("x1", _this.xScale(options.level))
      .attr("x2", _this.xScale(options.level))
      .attr("y1", _this.height + 6)
      .attr("y2", 0);


  },


});

export default MCProbe;
