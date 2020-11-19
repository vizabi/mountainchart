import {
  BaseComponent,
  Icons,
  //Utils,
  LegacyUtils as utils,
  axisSmart,
  DynamicBackground,
  //Exporter as svgexport,
} from "VizabiSharedComponents";

import MountainChartMath from "./mountainchart-math";
//import Selectlist from "./mountainchart-selectlist";
//import Probe from "./mountainchart-probe";
//import RobinHood from "./mountainchart-robinhood";

const {ICON_WARN, ICON_QUESTION} = Icons;
//const COLOR_BLACKISH = "rgb(51, 51, 51)";
const COLOR_WHITEISH = "rgb(253, 253, 253)";

const THICKNESS_THRESHOLD = 0.001;

const PROFILE_CONSTANTS = {
  SMALL: {
    margin: { top: 10, right: 10, left: 10, bottom: 18 },
    infoElHeight: 16
  },
  MEDIUM: {
    margin: { top: 20, right: 20, left: 20, bottom: 30 },
    infoElHeight: 20
  },
  LARGE: {
    margin: { top: 30, right: 30, left: 30, bottom: 35 },
    infoElHeight: 22
  }
};

const PROFILE_CONSTANTS_FOR_PROJECTOR = {
  MEDIUM: {
    margin: { top: 20, right: 20, left: 20, bottom: 50 },
    infoElHeight: 26
  },
  LARGE: {
    margin: { top: 30, right: 30, left: 30, bottom: 50 },
    infoElHeight: 32
  }
};

// MOUNTAIN CHART COMPONENT
export default class VizabiMountainChart extends BaseComponent {

  constructor(config) {
    config.subcomponents = [{
      type: DynamicBackground,
      placeholder: ".vzb-mc-year"
    }];

    config.name = "mountainchart";

    config.template = `
      <!-- MountainChart Component -->
      <div class="vzb-mountainchart">
          <svg class="vzb-mountainchart-svg vzb-export">
              <g class="vzb-mc-graph">
                  <rect class="vzb-mc-eventarea"></rect>
                  <g class="vzb-mc-year"></g>

                  <g class="vzb-mc-mountains-mergestacked"></g>
                  <g class="vzb-mc-mountains-mergegrouped"></g>
                  <g class="vzb-mc-mountains"></g>

                  <g class="vzb-mc-decorations">
                      <g class="vzb-mc-x-axis-groups"></g>
                  </g>
          
                  <g class="vzb-mc-mountains-labels"></g>


                  <g class="vzb-mc-axis-y-title">
                      <text></text>
                  </g>

                  <g class="vzb-mc-axis-x-title">
                      <text></text>
                  </g>

                  <g class="vzb-mc-axis-info vzb-noexport">
                  </g>

                  <g class="vzb-data-warning vzb-noexport">
                      <svg></svg>
                      <text></text>
                  </g>

                  <g class="vzb-mc-axis-x"></g>

                  <g class="vzb-mc-axis-labels"></g>
                  <g class="vzb-mc-probe">
                      <text class="vzb-shadow vzb-mc-probe-value-ul"></text>
                      <text class="vzb-shadow vzb-mc-probe-value-ur"></text>
                      <text class="vzb-shadow vzb-mc-probe-value-dl"></text>
                      <text class="vzb-shadow vzb-mc-probe-value-dr"></text>
                      <text class="vzb-mc-probe-value-ul"></text>
                      <text class="vzb-mc-probe-value-ur"></text>
                      <text class="vzb-mc-probe-value-dl"></text>
                      <text class="vzb-mc-probe-value-dr"></text>
                      <text class="vzb-mc-probe-extremepoverty"></text>
                      <line></line>
                  </g>

                  <g class="vzb-mc-tooltip vzb-hidden">
                      <rect class="vzb-tooltip-border"></rect>
                      <text class="vzb-tooltip-text"></text>
                  </g>
              </g>
              <rect class="vzb-mc-forecastoverlay vzb-hidden" x="0" y="0" width="100%" height="100%" fill="url(#vzb-mc-pattern-lines)" pointer-events='none'></rect>
          </svg>
          <svg>
              <defs>
                  <pattern id="vzb-mc-pattern-lines" x="0" y="0" patternUnits="userSpaceOnUse" width="50" height="50" viewBox="0 0 10 10"> 
                      <path d='M-1,1 l2,-2M0,10 l10,-10M9,11 l2,-2' stroke='black' stroke-width='3' opacity='0.08'/>
                  </pattern> 
              </defs>
          </svg>
      </div>
    `;

    super(config);
  }


  setup() {
    const _this = this;

    this.DOM = {
      graph: this.element.select(".vzb-mc-graph"),
      xAxis: this.element.select(".vzb-mc-axis-x"),
      xTitle: this.element.select(".vzb-mc-axis-x-title"),
      yTitle: this.element.select(".vzb-mc-axis-y-title"),
      info: this.element.select(".vzb-mc-axis-info"),
      dataWarning: this.element.select(".vzb-data-warning"),
      year: this.element.select(".vzb-mc-year"),      
      mountainMergeStackedContainer: this.element.select(".vzb-mc-mountains-mergestacked"),
      mountainMergeGroupedContainer: this.element.select(".vzb-mc-mountains-mergegrouped"),
      mountainAtomicContainer: this.element.select(".vzb-mc-mountains"),
      mountainLabelContainer: this.element.select(".vzb-mc-mountains-labels"),
      tooltip: this.element.select(".vzb-mc-tooltip"),
      eventArea: this.element.select(".vzb-mc-eventarea"),
      probe: this.element.select(".vzb-mc-probe"),
      probeLine: this.element.select("line"),
      probeText: this.element.selectAll("text"),
      forecastOverlay: this.element.select(".vzb-mc-forecastoverlay"),
      decorations: this.element.select(".vzb-mc-decorations"),
      xAxisGroups: this.element.select(".vzb-mc-x-axis-groups")
    };

    this._year = this.findChild({type: "DynamicBackground"});
    // this.element.onTap((d, i) => {
    //   _this._interact()._mouseout(d, i);
    // });

    this._math = new MountainChartMath(this);
    //this._export = new Exporter(this);
    //this._export
    //  .prefix("vzb-mc-")
    //  .deleteClasses(["vzb-mc-mountains-mergestacked", "vzb-mc-mountains-mergegrouped", "vzb-mc-mountains", "vzb-mc-year", "vzb-mc-mountains-labels", "vzb-mc-axis-labels"]);
    //this._probe = new Probe(this);
    //this._selectlist = new Selectlist(this);
    //this._robinhood = new RobinHood(this);

    // define path generator
    this.area = d3.area()
      .curve(d3.curveBasis)
      .x(d => _this.xScale(_this._math.rescale(d.x)))
      .y0(d => _this.yScale(d.y0))
      .y1(d => _this.yScale(d.y0 + d.y));

    //define d3 stack layout
    this.stack = d3.stack()
      .order(d3.stackOrderReverse)
      .value((d, key) => _this.cached[key][d].y);

    // init internal variables
    this.xScale = null;
    this.yScale = null;
    this.cScale = null;

    this.xAxis = axisSmart("bottom");

    this.rangeRatio = 1;
    this.rangeShift = 0;
    this.cached = {};
    this.mesh = [];
    this.yMax = 0;

    //remove pre-rendered world shape
    //this.mountainAtomicContainer.select(".vzb-mc-prerender").remove();
    this.wScale = d3.scaleLinear()
      .domain(this.ui.datawarning.doubtDomain)
      .range(this.ui.datawarning.doubtRange);
  }


  draw() {
    this.MDL = {
      frame: this.model.encoding.get("frame"),
      selected: this.model.encoding.get("selected"),
      highlighted: this.model.encoding.get("highlighted"),
      superHighlighted: this.model.encoding.get("superhighlighted"),
      y: this.model.encoding.get("y"),
      x: this.model.encoding.get("x"),
      s: this.model.encoding.get("s"),
      color: this.model.encoding.get("color"),
      label: this.model.encoding.get("label"),
      stack: this.model.encoding.get("stack"),
      group: this.model.encoding.get("group")
    };
    this.localise = this.services.locale.auto();

    this.TIMEDIM = this.MDL.frame.data.concept;
    this.KEYS = this.model.data.space.filter(dim => dim !== this.TIMEDIM);
    this.KEY = this.KEYS.join(",");    

    this.addReaction(this._drawForecastOverlay);

    if (this._updateLayoutProfile()) return; //return if exists with error
    this.addReaction(this._updateUIStrings);
    this.addReaction(this._updateIndicators);
    this.addReaction(this._updateYear);
    this.addReaction(this._updateMathSettings);
    this.addReaction(this._drawData);
    this.addReaction(this._updateSize);
    this.addReaction(this._zoomToMaxMin);
    this.addReaction(this._spawnMasks);
    this.addReaction(this._updatePointers);

      
    //     _this._adjustMaxY({ force: true });
    //     _this.redrawDataPoints();
    //     _this.redrawDataPointsOnlyColors();
    //     _this.highlightMarkers();
    //     _this.selectMarkers();
    //     _this._selectlist.redraw();
    //     _this.updateOpacity();
    //     _this.updateDoubtOpacity();
    //     _this._probe.redraw();
  }

  init() { // all reactions bindings

    const _this = this;
    
    //attach event listeners to the model items
    this.model_binds = {
      "change:time.value": function() {
        if (!_this._readyOnce) return;
        _this.model.marker.getFrame(_this.model.time.value, _this.frameChanged.bind(_this));
      },
      "change:time.playing": function() {
        // this listener is a patch for fixing #1228. time.js doesn't produce the last event
        // with playing == false when paused softly
        if (!_this.model.time.playing) {
          _this.redrawDataPoints();
        }
      },
      "change:marker.axis_x.xScaleFactor": function() {
        _this.ready();
      },
      "change:marker.axis_x.xScaleShift": function() {
        _this.ready();
      },
      "change:marker.axis_x.tailFatX": function() {
        _this.ready();
      },
      "change:marker.axis_x.tailCutX": function() {
        _this.ready();
      },
      "change:marker.axis_x.tailFade": function() {
        _this.ready();
      },
      "change:ui.probeX": function() {
        _this.ready();
      },
      "change:ui.showProbeX": function() {
        _this.ready();
      },
      "change:ui.xPoints": function() {
        _this.ready();
      },
      "change:ui.xLogStops": function() {
        _this._updateSize();
      },
      "change:ui.yMaxMethod": function() {
        _this._adjustMaxY({ force: true });
        _this.redrawDataPoints();
      },
      "change:ui.decorations": function() {
        if (!_this._readyOnce) return;
        _this._updateDecorations(500);
      },
      "change:ui.showForecastOverlay": function() {
        if (!_this._readyOnce) return;
        _this._updateForecastOverlay();
      },
      "change:ui.robinhood": function() {
        _this.ready();
      },
      "change:time.record": function() {
        if (_this.model.time.record) {
          _this._export.open(this.element, this.name);
        } else {
          _this._export.reset();
        }
      },
      "change:marker.highlight": function() {
        if (!_this._readyOnce) return;
        _this.highlightMarkers();
        _this.updateOpacity();
      },
      "change:marker.select": function() {
        if (!_this._readyOnce) return;
        _this.selectMarkers();
        _this._selectlist.redraw();
        _this.updateOpacity();
        _this.updateDoubtOpacity();
        _this.redrawDataPoints();
        _this._probe.redraw();
      },
      "change:marker.opacitySelectDim": function() {
        _this.updateOpacity();
      },
      "change:marker.opacityRegular": function() {
        _this.updateOpacity();
      },
      "change:marker": function(evt, path) {
        if (!_this._readyOnce) return;
        if (path.indexOf("scaleType") > -1) {
          _this.ready();
        } else if (path.indexOf("zoomedMin") > -1 || path.indexOf("zoomedMax") > -1) {
          _this._zoomToMaxMin();
          _this.redrawDataPoints();
          _this._probe.redraw();
        }
      },
      "change:marker.group": function(evt, path) {
        if (!_this._readyOnce) return;
        if (path.indexOf("group.merge") > -1) return;
        _this.ready();
      },
      "change:marker.group.merge": function() {
        if (!_this._readyOnce) return;
        _this._updatePointers();
        _this.redrawDataPoints();
      },
      "change:marker.stack": function() {
        if (!_this._readyOnce) return;
        _this.ready();
      },
      "change:marker.stack.which": function() {
        if (!_this._readyOnce) return;
        if (_this.model.time.playing) {
          _this.model.time.pause();
        }
      },
      "change:marker.stack.use": function() {
        if (!_this._readyOnce) return;
        if (_this.model.time.playing) {
          _this.model.time.pause();
        }
      },
      "change:marker.color.palette": function() {
        if (!_this._readyOnce) return;
        _this.redrawDataPointsOnlyColors();
        _this._selectlist.redraw();
      },
    };
    
  }

  preload() { // loading info for the whole world to show image before splash
    const preload = utils.getProp(this, ["model", "ui", "chart", "preload"]);
    const preloadKey = utils.getProp(this, ["model", "ui", "chart", "preloadKey"]);
    if(!preload) return Promise.resolve();
    
    const KEY = this.model.marker._getFirstDimension({ exceptType: "time" });
    const TIMEDIM = this.model.time.dim;

    //build a query to the reader to fetch preload info
    const query = {
      language: this.model.locale.id,
      from: "datapoints",
      select: {
        key: [KEY, TIMEDIM],
        value: [preload]
      },
      where: { $and: [
        { [KEY]: "$" + KEY },
        { [TIMEDIM]: "$" + TIMEDIM }
      ] },
      join: {
        ["$" + KEY]: { key: KEY, where: { [KEY]: { $in: [preloadKey||"world"] } } },
        ["$" + TIMEDIM]: { key: TIMEDIM, where: { [TIMEDIM]: this.model.time.formatDate(this.model.time.value) } }
      },
      order_by: [TIMEDIM]
    };
    
    return new Promise((resolve, reject) => {

      const dataPromise = this.model.data.load(query, {[preload]: d => JSON.parse(d)});

      dataPromise
        .then(dataId => {
          this.precomputedShape = this.model.data.getData(dataId);
          resolve();
        })
        .catch(err => {
          utils.warn("Problem with Preload mountainchart query: ", err, JSON.stringify(query));
          reject();
        });
    });
  }

  afterPreload() { // show the world shape before splash
    const _this = this;

    if (!this.precomputedShape || !this.precomputedShape[0] || !this.precomputedShape[0].income_mountains) return;

    const yMax = this.precomputedShape[0].income_mountains["yMax_" + this.ui.yMaxMethod];
    let shape = this.precomputedShape[0].income_mountains.shape;

    if (!yMax || !shape || shape.length === 0) return;

    this.xScale = d3.scaleLog().domain([this.MDL.x.domainMin, this.MDL.x.domainMax]);
    this.yScale = d3.scaleLinear().domain([0, Math.round(yMax)]);

    _this._updateSize(shape.length);
    _this._zoomToMaxMin();

    shape = shape.map((m, i) => ({ x: _this.mesh[i], y0: 0, y: +m }));

    this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-prerender")
      .data([0])
      .enter().append("path")
      .attr("class", "vzb-mc-prerender")
      .style("fill", "pink")
      .style("opacity", 0)
      .attr("d", _this.area(shape))
      .transition().duration(1000).ease(d3.easeLinear)
      .style("opacity", 1);
  }

  readyOnce() { //user actions bindings 
    const _this = this;

    this.eventAreaEl
      .on("mousemove", function() {
        if (_this.model.time.dragging) return;
        if (!_this.ui.showProbeX) return;
        _this._probe.redraw({
          level: _this.xScale.invert(d3.mouse(this)[0]),
          full: true
        });
      })
      .on("mouseout", () => {
        if (this.model.time.dragging) return;
        if (!this.ui.showProbeX) return;
        this._probe.redraw();
      });

    this.on("resize", () => {
      //console.log("acting on resize");
      //return if _updatesize exists with error
      if (this._updateSize()) return;
      this._updatePointers(); // respawn is needed
      this.redrawDataPoints();
      this._selectlist.redraw();
      this._probe.redraw();
    });
  }


  _updateLayoutProfile(){
    this.services.layout.width + this.services.layout.height;

    this.profileConstants = this.services.layout.getProfileConstants(PROFILE_CONSTANTS, PROFILE_CONSTANTS_FOR_PROJECTOR);
    this.height = this.element.node().clientHeight || 0;
    this.width = this.element.node().clientWidth || 0;
    if (!this.height || !this.width) return utils.warn("Chart _updateProfile() abort: container is too little or has display:none");
  }

  _updateUIStrings() {
    const _this = this;

    this.DOM.xTitle.select("text")
      .text(this.localise("unit/mountainchart_hardcoded_income_per_day"));

    this.DOM.yTitle.select("text")
      .text(this.localise("mount/title"));

    utils.setIcon(this.DOM.dataWarning, ICON_WARN).select("svg").attr("width", "0px").attr("height", "0px");
    this.DOM.dataWarning.append("text")
      .text(this.localise("hints/dataWarning"));

    utils.setIcon(this.DOM.info, ICON_QUESTION).select("svg").attr("width", "0px").attr("height", "0px");

    //TODO: move away from UI strings, maybe to ready or ready once
    this.DOM.info.on("click", () => {
      _this.parent.findChildByName("gapminder-datanotes").pin();
    });
    this.DOM.info.on("mouseover", function() {
      const rect = this.getBBox();
      const coord = utils.makeAbsoluteContext(this, this.farthestViewportElement)(rect.x - 10, rect.y + rect.height + 10);
      const toolRect = _this.root.element.getBoundingClientRect();
      const chartRect = _this.element.node().getBoundingClientRect();
      _this.parent.findChildByName("gapminder-datanotes").setHook("axis_y").show().setPos(coord.x + chartRect.left - toolRect.left, coord.y);
    });
    this.DOM.info.on("mouseout", () => {
      _this.parent.findChildByName("gapminder-datanotes").hide();
    });

    this.DOM.dataWarning
      .on("click", () => {
        _this.parent.findChildByName("gapminder-datawarning").toggle();
      })
      .on("mouseover", () => {
        _this.updateDoubtOpacity(1);
      })
      .on("mouseout", () => {
        _this.updateDoubtOpacity();
      });
  }

  _updateIndicators() {
    //fetch scales, or rebuild scales if there are none, then fetch
    this.yScale = this.MDL.y.scale.d3Scale.copy();
    this.xScale = this.MDL.x.scale.d3Scale.copy();
    this.cScale = this.MDL.color.scale.d3Scale.copy();

    this.xAxis.tickFormat(this.localise);
  }

  _drawForecastOverlay() {
    this.DOM.forecastOverlay.classed("vzb-hidden", 
      !this.MDL.frame.endBeforeForecast || 
      !this.state.showForecastOverlay || 
      (this.MDL.frame.value <= this.MDL.frame.endBeforeForecast)
    );
  }

  _getDuration() {
    //smooth animation is needed when playing, except for the case when time jumps from end to start
    if(!this.MDL.frame) return 0;
    this.frameValue_1 = this.frameValue;
    this.frameValue = this.MDL.frame.value;
    return this.__duration = this.MDL.frame.playing && (this.frameValue - this.frameValue_1 > 0) ? this.MDL.frame.speed : 0;
  }

  _updateYear() {
    const duration = this._getDuration();
    this._year.setText(this.localise(this.MDL.frame.value), duration);    
  }

  _updateMathSettings(){
    this._math.xScaleFactor = this.MDL.x.xScaleFactor;
    this._math.xScaleShift = this.MDL.x.xScaleShift;
  }

  frameChanged(frame, time) {
    if (!frame) return utils.warn("change:time.value: empty data received from marker.getFrame(). doing nothing");
    if (time.toString() != this.model.time.value.toString()) return; // frame is outdated
    this.values = frame;
    this.updateTime();
    this._updatePointers();
    this.redrawDataPoints();
    this._selectlist.redraw();
    this._probe.redraw();
    this.updateDoubtOpacity();
  }

  _updateSize(meshLength) {
    const {
      margin,
      infoElHeight,
    } = this.profileConstants;

    //graph group is shifted according to margins (while svg element is at 100 by 100%)
    this.DOM.graph.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const isRTL = this.services.locale.isRTL();

    const yearLabelOptions = {
      topOffset: this.services.layout.profile === "LARGE" ? margin.top * 2 : 0,
      xAlign: this.services.layout.profile === "LARGE" ? (isRTL ? "left" : "right") : "center",
      yAlign: this.services.layout.profile === "LARGE" ? "top" : "center",
      widthRatio: this.services.layout.profile === "LARGE" ? 3 / 8 : 8 / 10
    };

    //year is centered and resized
    this._year
      .setConditions(yearLabelOptions)
      .resize(this.width, this.height);

    //update scales to the new range
    this.yScale.range([this.height, 0]);
    this.xScale.range([this.rangeShift, this.width * this.rangeRatio + this.rangeShift]);


    //need to know scale type of X to move on
    const scaleType = this.MDL.x.scale.type || "log";

    //axis is updated
    this.xAxis.scale(this.xScale)
      .tickSizeOuter(0)
      .tickPadding(9)
      .tickSizeMinor(3, 0)
      .labelerOptions({
        scaleType,
        toolMargin: margin,
        pivotingLimit: margin.bottom * 1.5,
        method: this.xAxis.METHOD_REPEATING,
        stops: this.ui.xLogStops,
        formatter: this.localise
      });


    this.DOM.xAxis
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.DOM.xTitle.select("text")
      .attr("transform", "translate(" + this.width + "," + this.height + ")")
      .attr("dy", "-0.36em");

    this.DOM.yTitle
      .style("font-size", infoElHeight + "px")
      .attr("transform", "translate(" + (isRTL ? this.width : 0) + "," + margin.top + ")");

    this.DOM.xAxisGroups
      .style("font-size", infoElHeight * 0.8 + "px");

    const warnBB = this.DOM.dataWarning.select("text").node().getBBox();
    this.DOM.dataWarning.select("svg")
      .attr("width", warnBB.height)
      .attr("height", warnBB.height)
      .attr("x", warnBB.height * 0.1)
      .attr("y", -warnBB.height * 1.0 + 1);

    this.DOM.dataWarning
      .attr("transform", "translate(" + (isRTL ? this.width - warnBB.width - warnBB.height * 2 : 0) + "," + (margin.top + warnBB.height * 1.5) + ")")
      .select("text")
      .attr("dx", warnBB.height * 1.5);

    if (this.DOM.info.select("svg").node()) {
      const titleBBox = this.DOM.yTitle.node().getBBox();
      const t = utils.transform(this.DOM.yTitle.node());
      const hTranslate = isRTL ? (titleBBox.x + t.translateX - infoElHeight * 1.4) : (titleBBox.x + t.translateX + titleBBox.width + infoElHeight * 0.4);

      this.DOM.info.select("svg")
        .attr("width", infoElHeight + "px")
        .attr("height", infoElHeight + "px");
      this.DOM.info.attr("transform", "translate("
        + hTranslate + ","
        + (t.translateY - infoElHeight * 0.8) + ")");
    }

    this.DOM.eventArea
      .attr("y", this.height)
      .attr("width", this.width)
      .attr("height", margin.bottom);

    if (!meshLength) meshLength = this.ui.xPoints;
    this.mesh = this._math.generateMesh(meshLength, scaleType, this.xScale.domain());
    
    //rbh
    //this._robinhood.findMeshIndexes(this.mesh);
  }

  _updateDecorations(duration) {
    const _this = this;
    
    // x axis groups used for incomes
    const showxAxisGroups = this.ui.decorations.xAxisGroups 
      && this.ui.decorations.xAxisGroups[this.MDL.x.which] 
      && this.ui.decorations.enabled
      && this.services.layout.profile !== "SMALL";
    
    this.DOM.xAxisGroups.classed("vzb-invisible", !showxAxisGroups);
    if (showxAxisGroups) {
      const axisGroupsData = this.ui.decorations.xAxisGroups[this.MDL.x.which];
      let xAxisGroups = this.DOM.xAxisGroups.selectAll(".vzb-mc-x-axis-group").data(axisGroupsData);
      
      xAxisGroups.exit().remove();
      xAxisGroups = xAxisGroups.enter().append("g").attr("class", "vzb-mc-x-axis-group")
        .each(function(){
          const view = d3.select(this);
          view.append("text").attr("class", "vzb-mc-x-axis-group-line").text("◆").style("text-anchor","middle");
          view.append("text").attr("class", "vzb-mc-x-axis-group-text");
        })
        .merge(xAxisGroups);
      
      const xAxisGroups_calcs = [];
      let useShorterLabels = false;
      
      // first pass: calculate label text sizes and margins
      xAxisGroups.each(function(d, i){
        const view = d3.select(this);
        
        const text = view.select("text.vzb-mc-x-axis-group-text")
          .text(_this.translator(d.label));
        
        const calcs = {min: d.min, max: d.max};
        
        calcs.textHeight = text.node().getBBox().height;
        calcs.textWidth = text.node().getBBox().width;
        
        calcs.boundaryMinX_px = _this.xScale(d.min || d.min === 0? d.min : d3.min(_this.xScale.domain()));
        calcs.boundaryMaxX_px = _this.xScale(d.max || d.max === 0? d.max : d3.max(_this.xScale.domain()));
        
        calcs.centerX_px = (calcs.boundaryMinX_px + calcs.boundaryMaxX_px) / 2;
        calcs.marginX_px = (Math.abs(calcs.boundaryMinX_px - calcs.boundaryMaxX_px) - calcs.textWidth) / 2;
        
        if (calcs.marginX_px - calcs.textHeight < 0) useShorterLabels = true;
        
        xAxisGroups_calcs[i] = calcs;
      });
      
      // second pass: if at least one of labels doesn't fit, switch to compact mode and recalculate text sizes and margins
      if (useShorterLabels) {
        xAxisGroups.each(function(d, i){
          const view = d3.select(this);

          const text = view.select("text.vzb-mc-x-axis-group-text")
            .text(_this.translator(d.label_short));

          const calcs = xAxisGroups_calcs[i];

          calcs.textWidth = text.node().getBBox().width;
          calcs.marginX_px = (Math.abs(calcs.boundaryMinX_px - calcs.boundaryMaxX_px) - calcs.textWidth) / 2;

          xAxisGroups_calcs[i] = calcs;
        });
      }
      
      // third pass: actually put labels in places
      xAxisGroups.each(function(d, i){
        const view = d3.select(this);
        
        const isFirst = (i == 0);
        const isLast = (i == xAxisGroups_calcs.length - 1);
        const calcs = xAxisGroups_calcs[i];
        const minMargin = calcs.textHeight/4;
        let x = calcs.centerX_px;
        
        if (isFirst) x = xAxisGroups_calcs[i+1].boundaryMinX_px - Math.max(xAxisGroups_calcs[i+1].marginX_px, minMargin);
        if (isLast) x = xAxisGroups_calcs[i-1].boundaryMaxX_px + Math.max(xAxisGroups_calcs[i-1].marginX_px, minMargin);
        
        view.select("text.vzb-mc-x-axis-group-text")
          .transition()
          .duration(duration || 0)
          .style("text-anchor", isFirst ? "end" : isLast ? "start" : "middle")
          .attr("dy", "-1.2em")
          .attr("y", calcs.textHeight)
          .attr("x", x);
        
        view.select("text.vzb-mc-x-axis-group-line")
          .classed("vzb-invisible", isLast)
          .transition()
          .duration(duration || 0)
          .attr("dy", "-1.2em")
          .attr("y", calcs.textHeight * 0.9)
          .attr("x", calcs.boundaryMaxX_px);
      });

      xAxisGroups.select("text.vzb-mc-x-axis-group-text").on("mouseenter", function(d, i) {
        const calcs = xAxisGroups_calcs[i];
        const parentView = d3.select(this.parentNode);

        d3.select(this).attr("font-weight", "bold");
        parentView.append("rect").lower()
          .attr("x", calcs.boundaryMinX_px)
          .attr("width", calcs.boundaryMaxX_px - calcs.boundaryMinX_px)
          .attr("y", -_this.activeProfile.margin.top)
          .attr("height", _this.height + _this.activeProfile.margin.top);

        if (calcs.min || calcs.min === 0) parentView.append("line").lower()
          .attr("x1", calcs.boundaryMinX_px)
          .attr("x2", calcs.boundaryMinX_px)
          .attr("y1", -_this.activeProfile.margin.top)
          .attr("y2", _this.height);

        if (calcs.max || calcs.max === 0) parentView.append("line").lower()
          .attr("x1", calcs.boundaryMaxX_px)
          .attr("x2", calcs.boundaryMaxX_px)
          .attr("y1", -_this.activeProfile.margin.top)
          .attr("y2", _this.height);

      }).on("mouseleave", function() {
        const parentView = d3.select(this.parentNode);

        d3.select(this).attr("font-weight", null);
        parentView.selectAll("rect").remove();
        parentView.selectAll("line").remove();
      });
    }
    
  }

  _zoomToMaxMin() {
    const mdl = this.MDL.x;

    if (mdl.zoomedMin == null && mdl.domainMin == null || mdl.zoomedMax == null && mdl.domainMin == null) return;

    const x1 = this.xScale(mdl.zoomedMin || mdl.domainMin);
    const x2 = this.xScale(mdl.zoomedMax || mdl.domainMax);
    // if we have same x1 and x2 then divider will be 0 and rangeRation will become -Infinity
    if (!isFinite(x1) || !isFinite(x2) || x1 === x2) return;

    this.rangeRatio = this.width / (x2 - x1) * this.rangeRatio;
    this.rangeShift = (this.rangeShift - x1) / (x2 - x1) * this.width;

    this.xScale.range([this.rangeShift, this.width * this.rangeRatio + this.rangeShift]);

    this.DOM.xAxis.call(this.xAxis);
  }



  updateDoubtOpacity(opacity) {
    if (opacity == null) opacity = this.wScale(+this.time.getUTCFullYear().toString());
    if (this.someSelected) opacity = 1;
    this.DOM.dataWarning.style("opacity", opacity);
  }

  _processFrameData() {
    this.valuesAggregated = { color: {}, axis_y: {} };

    return this.__dataProcessed = this.model.dataArray
      //copy array in order to not sort in place
      .concat();
  }

  _drawData() {
    this._processFrameData();
    this._createAndDeleteSlices();
  }

  _createAndDeleteSlices() {
    const _this = this;

    // construct pointers
    this.mountainPointers = this.__dataProcessed
      .filter(d => d.x && d.y && d.s)
      .map(d => {
        d.KEY = function() {
          return d[Symbol.for("key")];
        };
        d.sortValue = [d.y || 0, 0];
        d.aggrLevel = 0;
        return d;
      });


    //TODO: optimise this!
    this.groupedPointers = d3.nest()
      .key(d => _this.MDL.stack.use === "property" ? d.stack: d.group)
      .sortValues((a, b) => b.sortValue[0] - a.sortValue[0])
      .entries(this.mountainPointers);


    const groupManualSort = this.MDL.group.manualSorting;
    const isManualSortCorrect = utils.isArray(groupManualSort) && groupManualSort.length > 1;
    this.groupedPointers.forEach(group => {
      const groupSortValue = isManualSortCorrect ?
        groupManualSort.includes(group.key) ?
          groupManualSort.length - 1 - groupManualSort.indexOf(group.key) :
          -1 :
        d3.sum(group.values.map(m => m.sortValue[0]));

      group.values.forEach(d => {
        d.sortValue[1] = groupSortValue;
      });

      group._keys = { [_this.KEY]: group.key }; // hack to get highlihgt and selection work
      group.KEYS = function() {
        return this._keys;
      };
      group.KEY = function() {
        return this.key;
      };
      group.aggrLevel = 1;
    });

    const sortGroupKeys = {};
    _this.groupedPointers.forEach(m => {
      sortGroupKeys[m.key] = m.values[0].sortValue[1];
    });


    // update the stacked pointers
    if (_this.MDL.stack.which === "none") {
      this.stackedPointers = [];
      this.mountainPointers.sort((a, b) => b.sortValue[0] - a.sortValue[0]);

    } else {
      this.stackedPointers = d3.nest()
        .key(d => d.stack)
        .key(d => d.group)
        .sortKeys((a, b) => sortGroupKeys[b] - sortGroupKeys[a])
        .sortValues((a, b) => b.sortValue[0] - a.sortValue[0])
        .entries(this.mountainPointers);

      this.mountainPointers.sort((a, b) => b.sortValue[1] - a.sortValue[1]);


      this.stackedPointers.forEach(stack => {
        stack._keys = { [_this.KEY]: stack.key }; // hack to get highlihgt and selection work
        stack.KEYS = function() {
          return this._keys;
        };
        stack.KEY = function() {
          return this.key;
        };
        stack.aggrLevel = 2;
      });
    }

    //bind the data to DOM elements
    this.mountainsMergeStacked = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel2")
      .data(this.stackedPointers);
    this.mountainsMergeGrouped = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel1")
      .data(this.groupedPointers);
    this.mountainsAtomic = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel0")
      .data(this.mountainPointers);

    //exit selection -- remove shapes
    this.mountainsMergeStacked.exit().remove();
    this.mountainsMergeGrouped.exit().remove();
    this.mountainsAtomic.exit().remove();

    //enter selection -- add shapes
    this.mountainsMergeStacked = this.mountainsMergeStacked.enter().append("path")
      .attr("class", "vzb-mc-mountain vzb-mc-aggrlevel2")
      .merge(this.mountainsMergeStacked);
    this.mountainsMergeGrouped = this.mountainsMergeGrouped.enter().append("path")
      .attr("class", "vzb-mc-mountain vzb-mc-aggrlevel1")
      .merge(this.mountainsMergeGrouped);
    this.mountainsAtomic = this.mountainsAtomic.enter().append("path")
      .attr("class", "vzb-mc-mountain vzb-mc-aggrlevel0")
      .merge(this.mountainsAtomic);

    //add interaction
    this.mountains = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain");

    this.mountains
      .on("mousemove", (d, i) => {
        if (utils.isTouchDevice()) return;
        _this._interact()._mousemove(d, i);
      })
      .on("mouseout", (d, i) => {
        if (utils.isTouchDevice()) return;
        _this._interact()._mouseout(d, i);
      })
      .on("click", (d, i) => {
        if (utils.isTouchDevice()) return;
        _this._interact()._click(d, i);
        _this.highlightMarkers();
      });
    // .onTap((d, i) => {
    //   _this._interact()._click(d, i);
    //   d3.event.stopPropagation();
    // })
    // .onLongTap(() => {
    // });
  }

  _getLabelText(d) {
    return Object.values(d.label).join(", ");
  }

  _interact() {
    const _this = this;

    return {
      _mousemove(d) {
        if (_this.model.time.dragging || _this.model.time.playing) return;

        _this.model.marker.highlightMarker(d.KEYS());

        //const mouse = d3.mouse(_this.graph.node()).map(d => parseInt(d));

        //position tooltip
        _this._setTooltip(d.key ? _this.MDL.color.getColorlegendMarker().label.getItems()[d.key] : _this._getLabelText(d));
        _this._selectlist.showCloseCross(d, true);

      },
      _mouseout(d) {
        if (_this.model.time.dragging || _this.model.time.playing) return;

        _this._setTooltip("");
        _this.model.marker.clearHighlighted();
        _this._selectlist.showCloseCross(d, false);

      },
      _click(d) {
        const isPlayingOrDragging = _this.model.time.dragging || _this.model.time.playing;
        if (!isPlayingOrDragging || _this.model.marker.isSelected(d.KEYS())) {
          _this.model.marker.selectMarker(d.KEYS());
        }
      }
    };

  }

  highlightMarkers() {
    this.someHighlighted = (this.model.marker.highlight.length > 0);

    if (!this.selectList || !this.someSelected) return;
    this.selectList.classed("vzb-highlight", d => this.model.marker.isHighlighted(d));

  }

  selectMarkers() {
    this.someSelected = (this.model.marker.select.length > 0);

    this._selectlist.rebuild();
    this.nonSelectedOpacityZero = false;
  }

  _sumLeafPointersByMarker(branch, marker) {
    const _this = this;
    if (!branch.key) return _this.values[marker][utils.getKey(branch.KEYS(), _this.dataKeys[marker])];
    return d3.sum(branch.values.map(m => _this._sumLeafPointersByMarker(m, marker)));
  }

  updateOpacity() {
    const _this = this;
    //if(!duration)duration = 0;

    const OPACITY_HIGHLT = 1.0;
    const OPACITY_HIGHLT_DIM = 0.3;
    const OPACITY_SELECT = 1.0;
    const OPACITY_REGULAR = this.model.marker.opacityRegular;
    const OPACITY_SELECT_DIM = this.model.marker.opacitySelectDim;

    this.mountains.style("opacity", d => {

      if (_this.someHighlighted) {
        //highlight or non-highlight
        if (_this.model.marker.isHighlighted(d.KEYS())) return OPACITY_HIGHLT;
      }

      if (_this.someSelected) {
        //selected or non-selected
        return _this.model.marker.isSelected(d.KEYS()) ? OPACITY_SELECT : OPACITY_SELECT_DIM;
      }

      if (_this.someHighlighted) return OPACITY_HIGHLT_DIM;

      return OPACITY_REGULAR;

    });

    this.mountains.classed("vzb-selected", d => _this.model.marker.isSelected(d.KEYS()));

    const nonSelectedOpacityZero = _this.model.marker.opacitySelectDim < 0.01;

    // when pointer events need update...
    if (nonSelectedOpacityZero !== this.nonSelectedOpacityZero) {
      this.mountainsAtomic.style("pointer-events", d => (!_this.someSelected || !nonSelectedOpacityZero || _this.model.marker.isSelected(d.KEYS())) ?
        "visible" : "none");
    }

    this.nonSelectedOpacityZero = _this.model.marker.opacitySelectDim < 0.01;
  }


  _updatePointers() {
    const _this = this;
    this.yMax = 0;


    //spawn the original mountains
    this.mountainPointers.forEach((d) => {
      const vertices = _this._spawn(d);
      _this.cached[d.KEY()] = vertices;
      d.hidden = vertices.length === 0;
    });

    //rbh
    //_this._robinhood.adjustCached();

    //recalculate stacking
    if (_this.MDL.stack.which !== "none") {
      this.stackedPointers.forEach(group => {
        let toStack = [];
        group.values.forEach(subgroup => {
          toStack = toStack.concat(subgroup.values.filter(f => !f.hidden));
        });
        _this.stack.keys(toStack.map(d => d.KEY()))(d3.range(_this.mesh.length))
          .forEach((vertices, keyIndex) => {
            const key = toStack[keyIndex].KEY();
            vertices.forEach((d, verticesIndex) => {
              _this.cached[key][verticesIndex].y0 = d[0];
            });
          });
      });
    }

    this.mountainPointers.forEach(d => {
      d.valuesPointer = _this.values;
      d.yMax = d3.max(_this.cached[d.KEY()].map(m => m.y0 + m.y));
      if (_this.yMax < d.yMax) _this.yMax = d.yMax;
    });

    const mergeGrouped = _this.MDL.group.merge;
    const mergeStacked = _this.MDL.stack.merge;
    //var dragOrPlay = (_this.model.time.dragging || _this.model.time.playing) && this.model.marker.stack.which !== "none";

    //if(mergeStacked){
    this.stackedPointers.forEach(d => {
      d.valuesPointer = _this.valuesAggregated;
      const firstLast = _this._getFirstLastPointersInStack(d);
      _this.cached[d.key] = _this._getVerticesOfaMergedShape(firstLast);
      _this.valuesAggregated.color[d.key] = "_default";
      _this.valuesAggregated.axis_y[d.key] = _this._sumLeafPointersByMarker(d, "axis_y");
      d.yMax = firstLast.first.yMax;
    });
    //} else if (mergeGrouped || dragOrPlay){
    this.groupedPointers.forEach(d => {
      d.valuesPointer = _this.valuesAggregated;
      const firstLast = _this._getFirstLastPointersInStack(d);
      _this.cached[d.key] = _this._getVerticesOfaMergedShape(firstLast);
      _this.valuesAggregated.color[d.key] = _this.values.color[firstLast.first.KEY()];
      _this.valuesAggregated.axis_y[d.key] = _this._sumLeafPointersByMarker(d, "axis_y");
      d.yMax = firstLast.first.yMax;
    });
    //}

    if (!mergeStacked && !mergeGrouped && this.MDL.stack.use === "property") {
      this.groupedPointers.forEach(d => {
        const visible = d.values.filter(f => !f.hidden);
        d.yMax = visible[0].yMax;
        d.values.forEach(e => {
          e.yMaxGroup = d.yMax;
        });
      });
    }


  }
  

  _getFirstLastPointersInStack(group) {
    let visible, visible2;
    let first, last;

    if (group.values[0].values) {
      visible = group.values[0].values.filter(f => !f.hidden);
      visible2 = group.values[group.values.length - 1].values.filter(f => !f.hidden);
      first = visible[0];
      last = visible2[visible2.length - 1];
    } else {
      visible = group.values.filter(f => !f.hidden);
      first = visible[0];
      last = visible[visible.length - 1];
    }

    if (!visible.length || (visible2 && !visible2.length)) utils.warn("mountain chart failed to generate shapes. check the incoming data");

    return {
      first,
      last
    };
  }

  _getVerticesOfaMergedShape(arg) {
    const _this = this;

    const first = arg.first.KEY();
    const last = arg.last.KEY();

    return _this.mesh.map((m, i) => {
      const y = _this.cached[first][i].y0 + _this.cached[first][i].y - _this.cached[last][i].y0;
      const y0 = _this.cached[last][i].y0;
      return {
        x: m,
        y0,
        y
      };
    });
  }

  _spawnMasks() {
    const tailFatX = this._math.unscale(this.MDL.x.tailFatX);
    const tailCutX = this._math.unscale(this.MDL.x.tailCutX);
    const tailFade = this.MDL.x.tailFade;
    const k = 2 * Math.PI / (Math.log(tailFatX) - Math.log(tailCutX));
    const m = Math.PI - Math.log(tailFatX) * k;


    this.spawnMask = [];
    this.cosineShape = [];
    this.cosineArea = 0;

    this.mesh.forEach((dX, i) => {
      this.spawnMask[i] = dX < tailCutX ? 1 : (dX > tailFade * 7 ? 0 : Math.exp((tailCutX - dX) / tailFade));
      this.cosineShape[i] = (dX > tailCutX && dX < tailFatX ? (1 + Math.cos(Math.log(dX) * k + m)) : 0);
      this.cosineArea += this.cosineShape[i];
    });
  }

  _spawn(d) {
    const _this = this;

    const norm = d.y;
    const sigma = _this.ui.directSigma ?
      d.s :
      _this._math.giniToSigma(d.s);
    
    const mu = _this.ui.directMu ?
      d.x :
      _this._math.gdpToMu(d.x, sigma);

    if (!norm || !mu || !sigma) return [];

    const distribution = [];
    let acc = 0;

    this.mesh.forEach((dX, i) => {
      distribution[i] = _this._math.pdf().lognormal(dX, mu, sigma);
      acc += _this.spawnMask[i] * distribution[i];
    });

    const result = this.mesh.map((dX, i) => ({
      x: dX,
      y0: 0,
      y: norm * (distribution[i] * (1 - _this.spawnMask[i]) + _this.cosineShape[i] / _this.cosineArea * acc)
    }));

    return result;
  }

  _adjustMaxY(options) {
    if (!options) options = {};
    const _this = this;
    const method = this.ui.yMaxMethod;

    if (method !== "immediate" && !options.force) return;
    if (method === "latest") {
      const prevValues = _this.values;
      _this.model.marker.getFrame(_this.model.time.end, values => {
        if (!values) return;

        //below is a complicated issue when _updatePointers() is first calculated for one set of values (at the end of time series), then yMax is taken from that data (assuming that population always grows, so the last year has the highest mountain)
        _this.values = values;
        _this._updatePointers();

        //after that _updatePointers() is called with the actual data of the current time point
        _this.values = prevValues;
        _this.yScale.domain([0, Math.round(_this.yMax)]);
        _this._updatePointers();
        _this.redrawDataPoints();
      });
    } else {
      if (!_this.yMax) utils.warn("Setting yMax to " + _this.yMax + ". You failed again :-/");
      _this.yScale.domain([0, Math.round(_this.yMax)]);
    }
  }

  redrawDataPoints() {
    const _this = this;
    const mergeGrouped = this.MDL.group.merge;
    const mergeStacked = this.MDL.stack.merge;
    const stackMode = this.MDL.stack.which;
    //it's important to know if the chart is dragging or playing at the moment.
    //because if that is the case, the mountain chart will merge the stacked entities to save performance
    const dragOrPlay = (this.model.time.dragging || this.model.time.playing)
      //never merge when no entities are stacked
      && stackMode !== "none";

    this._adjustMaxY();

    this.mountainsMergeStacked.each(function(d) {
      const view = d3.select(this);
      const hidden = !mergeStacked;
      _this._renderShape(view, d.KEY(), hidden);
    });

    this.mountainsMergeGrouped.each(function(d) {
      const view = d3.select(this);
      const hidden = (!mergeGrouped && !dragOrPlay) || (mergeStacked && !_this.model.marker.isSelected(d));
      _this._renderShape(view, d.KEY(), hidden);
    });

    this.mountainsAtomic.each(function(d) {
      const view = d3.select(this);
      const hidden = d.hidden || ((mergeGrouped || mergeStacked || dragOrPlay) && !_this.model.marker.isSelected(d));
      _this._renderShape(view, d.KEY(), hidden);
    });

    if (stackMode === "none") {
      this.mountainsAtomic.sort((a, b) => b.yMax - a.yMax);

    } else if (stackMode === "all") {
      // do nothing if everything is stacked

    } else {
      if (mergeGrouped || dragOrPlay) {
        // this.mountainsMergeGrouped.sort(function (a, b) {
        //     return b.yMax - a.yMax;
        // });
      } else {
        this.mountainsAtomic.sort((a, b) => b.yMaxGroup - a.yMaxGroup);
      }
    }


    // exporting shapes for shape preloader. is needed once in a while
    // if (!this.shapes) this.shapes = {}
    // this.shapes[this.model.time.value.getUTCFullYear()] = {
    //     yMax: d3.format(".2e")(_this.yMax),
    //     shape: _this.cached["all"].map(function (d) {return d3.format(".2e")(d.y);})
    // }

    this._updateDecorations();
  }

  redrawDataPointsOnlyColors() {
    const _this = this;
    if (!this.mountains) return utils.warn("redrawDataPointsOnlyColors(): no mountains  defined. likely a premature call, fix it!");
    const isColorUseIndicator = this.MDL.color.use === "indicator";
    this.mountains.style("fill", d => {
      const color = d.valuesPointer.color;
      return color ? (isColorUseIndicator && color == "_default" ? _this.MDL.color.palette["_default"] : _this.cScale(color)) : COLOR_WHITEISH;
    });
  }

  _renderShape(view, key, hidden) {
    const stack = this.MDL.stack.which;
    const _this = this;
    const valuesPointer = view.datum().valuesPointer;

    view.classed("vzb-hidden", hidden);

    if (hidden) {
      if (stack !== "none") view.style("stroke-opacity", 0);
      return;
    }

    const filter = {};
    filter[this.KEY] = key;
    if (this.model.marker.isSelected(filter)) {
      view.attr("d", this.area(this.cached[key].filter(f => f.y > valuesPointer.axis_y[key] * THICKNESS_THRESHOLD)));
    } else {
      view.attr("d", this.area(this.cached[key]));
    }

    //color use indicator suggests that this should be updated on every timeframe
    if (this.MDL.color.use === "indicator") {
      view.style("fill", valuesPointer.color[key] ?
        (
          valuesPointer.color[key] !== "_default" ?
            _this.cScale(valuesPointer.color[key])
            :
            _this.MDL.color.palette["_default"]
        )
        :
        COLOR_WHITEISH
      );
    }

    if (stack !== "none") view
      .transition().duration(Math.random() * 900 + 100).ease(d3.easeCircle)
      .style("stroke-opacity", 0.5);

    if (this.model.time.record) this._export.write({
      type: "path",
      id: key,
      time: this.model.time.value.getUTCFullYear(),
      fill: this.cScale(valuesPointer.color[key]),
      d: this.area(this.cached[key])
    });
  }

  _setTooltip(tooltipText) {
    if (tooltipText) {
      const mouse = d3.mouse(this.graph.node()).map(d => parseInt(d));

      //position tooltip
      this.tooltip.classed("vzb-hidden", false)
        .attr("transform", "translate(" + (mouse[0]) + "," + (mouse[1]) + ")")
        .selectAll("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(tooltipText);

      const contentBBox = this.tooltip.select("text").node().getBBox();

      this.tooltip.select("rect")
        .attr("width", contentBBox.width + 8)
        .attr("height", contentBBox.height + 8)
        .attr("x", -contentBBox.width - 25)
        .attr("y", -contentBBox.height - 25)
        .attr("rx", contentBBox.height * 0.2)
        .attr("ry", contentBBox.height * 0.2);

      this.tooltip.selectAll("text")
        .attr("x", -contentBBox.width - 25 + ((contentBBox.width + 8) / 2))
        .attr("y", -contentBBox.height - 25 + ((contentBBox.height + 11) / 2)); // 11 is 8 for margin + 3 for strokes
      const translateX = (mouse[0] - contentBBox.width - 25) > 0 ? mouse[0] : (contentBBox.width + 25);
      const translateY = (mouse[1] - contentBBox.height - 25) > 0 ? mouse[1] : (contentBBox.height + 25);
      this.tooltip
        .attr("transform", "translate(" + translateX + "," + translateY + ")");

    } else {

      this.tooltip.classed("vzb-hidden", true);
    }
  }

}

VizabiMountainChart.DEFAULT_UI = {
  opacitySelectDim: 0.3,
  opacityRegular: 0.7,
  robinhood: {
    enabled: false,
    xTax: [100],
    yTax: [100]
  },
  decorations: {
    enabled: true,
    xAxisGroups: null
  },
  datawarning: {
    doubtDomain: [],
    doubtRange: []
  },
  manualSortingEnabled: true,
  yMaxMethod: "latest",
  showProbeX: true,
  probeX: 1.85,
  xLogStops: [1, 2, 5],
  xPoints: 50,
  directSigma: false, //false = input is gini, true = input is standatd deviation of the distribution
  directMu: false, //false = input is GDP/capita, true = input is mean of the distribution
  preload: "income_mountains",
  preloadKey: "world"
};
