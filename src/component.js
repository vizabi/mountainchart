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

          <g class="vzb-mc-axis-info vzb-noexport"></g>

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
    `;

    super(config);
  }


  setup() {

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
    //   this._interact()._mouseout(d, i);
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
      .x(d => this.xScale(this._math.rescale(d.x)))
      .y0(d => this.yScale(d.y0))
      .y1(d => this.yScale(d.y0 + d.y));

    //define d3 stack layout
    this.stackLayout = d3.stack()
      .order(d3.stackOrderReverse)
      .value((i, slice) => slice.shape[i].y);

    // init internal variables
    this.xScale = null;
    this.yScale = null;
    this.cScale = null;

    this.xAxis = axisSmart("bottom");

    this.rangeRatio = 1;
    this.rangeShift = 0;
    this.mesh = [];
    this.yMaxGlobal = 0;

    //remove pre-rendered world shape
    //this.mountainAtomicContainer.select(".vzb-mc-prerender").remove();
    this.wScale = d3.scaleLinear()
      .domain(this.ui.datawarning.doubtDomain)
      .range(this.ui.datawarning.doubtRange);
  }


  draw() {

    this.MDL = {
      frame: this.model.encoding.get("frame"),
      selectedF: this.model.encoding.get("selected").data.filter,
      highlightedF: this.model.encoding.get("highlighted").data.filter,
      //superHighlightedF: this.model.encoding.get("superhighlighted").data.filter,
      y: this.model.encoding.get("y"),
      x: this.model.encoding.get("x"),
      s: this.model.encoding.get("s"),
      color: this.model.encoding.get("color"),
      label: this.model.encoding.get("label"),
      stack: this.model.encoding.get("stack"),
      group: this.model.encoding.get("group")
    };
    this.localise = this.services.locale.auto();

    this.addReaction(this.drawForecastOverlay);

    if (this.updateLayoutProfile()) return; //return if exists with error
    this.addReaction(this.updateHeaderAndFooter);
    this.addReaction(this.updateScales);
    this.addReaction(this.updateYear);
    this.addReaction(this.updateDoubtOpacity);
    this.addReaction(this.updateMathSettings);
    this.addReaction(this.updateSize);
    this.addReaction(this.updateMesh);
    this.addReaction(this.zoom);
    this.addReaction(this.updateMasks);
    this.addReaction(this.drawData);
    this.addReaction(this.highlightSlices);
    this.addReaction(this.selectSlices);
    this.addReaction(this.updateAllSlicesOpacity);
    this.addReaction(this.updateDecorations);
    //this._probe.redraw();
  }

  drawData() {
    this.services.layout.size; //watch

    this.processFrameData();
    this.createAndDeleteSlices();
    this.computeAllShapes();
    this.renderAllShapes();
  }

  _init() { // all reactions bindings

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
        if (!_this.MDL.frame.playing) {
          _this.renderAllShapes();
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
        _this.updateSize();
      },
      "change:ui.yMaxMethod": function() {
        _this._adjustMaxY({ force: true });
        _this.renderAllShapes();
      },
      "change:ui.decorations": function() {
        if (!_this._readyOnce) return;
        _this.updateDecorations(500);
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
        _this._highlightSlices();
        _this._updateOpacity();
      },
      "change:marker.select": function() {
        if (!_this._readyOnce) return;
        _this._selectSlices();
        _this._selectlist.redraw();
        _this._updateOpacity();
        _this.updateDoubtOpacity();
        _this.renderAllShapes();
        _this._probe.redraw();
      },
      "change:marker.opacitySelectDim": function() {
        _this._updateOpacity();
      },
      "change:marker.opacityRegular": function() {
        _this._updateOpacity();
      },
      "change:marker": function(evt, path) {
        if (!_this._readyOnce) return;
        if (path.indexOf("scaleType") > -1) {
          _this.ready();
        } else if (path.indexOf("zoomedMin") > -1 || path.indexOf("zoomedMax") > -1) {
          _this.zoom();
          _this.renderAllShapes();
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
        _this.computeAllShapes();
        _this.renderAllShapes();
      },
      "change:marker.stack": function() {
        if (!_this._readyOnce) return;
        _this.ready();
      },
      "change:marker.stack.which": function() {
        if (!_this._readyOnce) return;
        if (_this.MDL.frame.playing) {
          _this.model.time.pause();
        }
      },
      "change:marker.stack.use": function() {
        if (!_this._readyOnce) return;
        if (_this.MDL.frame.playing) {
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

  _preload() { // loading info for the whole world to show image before splash
    const preload = utils.getProp(this, ["model", "ui", "chart", "preload"]);
    const preloadKey = utils.getProp(this, ["model", "ui", "chart", "preloadKey"]);
    if(!preload) return Promise.resolve();
    
    const MAINDIM = this.model.data.space.filter(dim => dim !== this.TIMEDIM)[0];
    const TIMEDIM = this.MDL.frame.data.concept;

    //build a query to the reader to fetch preload info
    const query = {
      language: this.model.locale.id,
      from: "datapoints",
      select: {
        key: [MAINDIM, TIMEDIM],
        value: [preload]
      },
      where: { $and: [
        { [MAINDIM]: "$" + MAINDIM },
        { [TIMEDIM]: "$" + TIMEDIM }
      ] },
      join: {
        ["$" + MAINDIM]: { key: MAINDIM, where: { [MAINDIM]: { $in: [preloadKey||"world"] } } },
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

  _afterPreload() { // show the world shape before splash
    if (!this.precomputedShape || !this.precomputedShape[0] || !this.precomputedShape[0].income_mountains) return;

    const yMax = this.precomputedShape[0].income_mountains["yMax_" + this.ui.yMaxMethod];
    let shape = this.precomputedShape[0].income_mountains.shape;

    if (!yMax || !shape || shape.length === 0) return;

    this.xScale = d3.scaleLog().domain([this.MDL.x.scale.domain[0], this.MDL.x.scale.domain[1]]);
    this.yScale = d3.scaleLinear().domain([0, Math.round(yMax)]);

    this.updateSize(shape.length);
    this.zoom();

    shape = shape.map((m, i) => ({ x: this.mesh[i], y0: 0, y: +m }));

    this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-prerender")
      .data([0])
      .enter().append("path")
      .attr("class", "vzb-mc-prerender")
      .style("fill", "pink")
      .style("opacity", 0)
      .attr("d", this.area(shape))
      .transition().duration(1000).ease(d3.easeLinear)
      .style("opacity", 1);
  }

  _readyOnce() { //user actions bindings 
    const _this = this;

    this.eventAreaEl
      .on("mousemove", function() {
        if (_this._isDragging) return;
        if (!_this.ui.showProbeX) return;
        _this._probe.redraw({
          level: _this.xScale.invert(d3.mouse(this)[0]),
          full: true
        });
      })
      .on("mouseout", () => {
        if (this._isDragging) return;
        if (!this.ui.showProbeX) return;
        this._probe.redraw();
      });

    this.on("resize", () => {
      //console.log("acting on resize");
      //return if _updatesize exists with error
      if (this.updateSize()) return;
      this.computeAllShapes(); // respawn is needed
      this.renderAllShapes();
      this._selectlist.redraw();
      this._probe.redraw();
    });
  }


  updateLayoutProfile(){
    this.services.layout.size; //watch

    this.profileConstants = this.services.layout.getProfileConstants(PROFILE_CONSTANTS, PROFILE_CONSTANTS_FOR_PROJECTOR);
    this.height = this.element.node().clientHeight || 0;
    this.width = this.element.node().clientWidth || 0;

    console.log(this.element.node(), this.width);
    if (!this.height || !this.width) return utils.warn("Chart _updateProfile() abort: container is too little or has display:none");
  }

  updateHeaderAndFooter() {
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
      this.parent.findChildByName("gapminder-datanotes").pin();
    });
    this.DOM.info.on("mouseover", function() {
      const rect = this.getBBox();
      const coord = utils.makeAbsoluteContext(this, this.farthestViewportElement)(rect.x - 10, rect.y + rect.height + 10);
      const toolRect = _this.root.element.getBoundingClientRect();
      const chartRect = _this.element.node().getBoundingClientRect();
      _this.parent.findChildByName("gapminder-datanotes").setHook("axis_y").show().setPos(coord.x + chartRect.left - toolRect.left, coord.y);
    });
    this.DOM.info.on("mouseout", () => {
      this.parent.findChildByName("gapminder-datanotes").hide();
    });

    this.DOM.dataWarning
      .on("click", () => {
        this.parent.findChildByName("gapminder-datawarning").toggle();
      })
      .on("mouseover", () => {
        this.updateDoubtOpacity(1);
      })
      .on("mouseout", () => {
        this.updateDoubtOpacity();
      });
  }

  updateScales() {
    //fetch scales, or rebuild scales if there are none, then fetch
    this.yScale = this.MDL.y.scale.d3Scale.copy();
    this.xScale = this.MDL.x.scale.d3Scale.copy();
    this.cScale = this.MDL.color.scale.d3Scale.copy();
  }

  drawForecastOverlay() {
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

  updateYear() {
    const duration = this._getDuration();
    this._year.setText(this.localise(this.MDL.frame.value), duration);    
  }

  updateMathSettings(){
    this._math.xScaleFactor = this.MDL.x.config.xScaleFactor;
    this._math.xScaleShift = this.MDL.x.config.xScaleShift;
  }

  updateSize() {
    this.services.layout.size; //watch

    const {
      margin,
      infoElHeight,
    } = this.profileConstants;

    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    //graph group is shifted according to margins (while svg element is at 100 by 100%)
    this.DOM.graph.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const isRTL = this.services.locale.isRTL();

    //year is centered and resized
    this._year
      .setConditions({
        topOffset: this.services.layout.profile === "LARGE" ? margin.top * 2 : 0,
        xAlign: this.services.layout.profile === "LARGE" ? (isRTL ? "left" : "right") : "center",
        yAlign: this.services.layout.profile === "LARGE" ? "top" : "center",
        widthRatio: this.services.layout.profile === "LARGE" ? 3 / 8 : 8 / 10
      })
      .resizeText(width, height);

    //update scales to the new range
    this.yScale.range([height, 0]);
    this.xScale.range([this.rangeShift, width * this.rangeRatio + this.rangeShift]);

    //axis is updated
    this.xAxis.scale(this.xScale)
      .tickSizeOuter(0)
      .tickPadding(9)
      .tickSizeMinor(3, 0)
      .labelerOptions({
        scaleType: this.MDL.x.scale.type || "log",
        toolMargin: margin,
        pivotingLimit: margin.bottom * 1.5,
        method: this.xAxis.METHOD_REPEATING,
        stops: this.ui.xLogStops,
        formatter: this.localise
      });

    this.DOM.xAxis
      .attr("transform", "translate(0," + height + ")")
      .call(this.xAxis);

    this.DOM.xTitle.select("text")
      .attr("transform", "translate(" + width + "," + height + ")")
      .attr("dy", "-0.36em");

    this.DOM.yTitle
      .style("font-size", infoElHeight + "px")
      .attr("transform", "translate(" + (isRTL ? width : 0) + "," + margin.top + ")");

    this.DOM.xAxisGroups
      .style("font-size", infoElHeight * 0.8 + "px");

    const warnBB = this.DOM.dataWarning.select("text").node().getBBox();
    this.DOM.dataWarning.select("svg")
      .attr("width", warnBB.height)
      .attr("height", warnBB.height)
      .attr("x", warnBB.height * 0.1)
      .attr("y", -warnBB.height * 1.0 + 1);

    this.DOM.dataWarning
      .attr("transform", "translate(" + (isRTL ? width - warnBB.width - warnBB.height * 2 : 0) + "," + (margin.top + warnBB.height * 1.5) + ")")
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
      .attr("y", height)
      .attr("width", width)
      .attr("height", margin.bottom);
  }

  updateMesh(meshLength){
    if (!meshLength) meshLength = this.ui.xPoints;
    this.mesh = this._math.generateMesh(
      meshLength, 
      this.MDL.x.scale.type || "log", 
      this.xScale.domain()
    );
    
    //rbh
    //this._robinhood.findMeshIndexes(this.mesh);
  }

  updateDecorations(duration) {
    const _this = this;
    this.services.layout.size; //watch
    
    // x axis groups used for incomes
    const showxAxisGroups = this.ui.decorations.xAxisGroups 
      && this.ui.decorations.xAxisGroups[this.MDL.x.data.concept] 
      && this.ui.decorations.enabled
      && this.services.layout.profile !== "SMALL";
    
    this.DOM.xAxisGroups.classed("vzb-invisible", !showxAxisGroups);
    if (showxAxisGroups) {
      const axisGroupsData = this.ui.decorations.xAxisGroups[this.MDL.x.data.concept];
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
          .text(_this.localise(d.label));
        
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
            .text(_this.localise(d.label_short));

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
          .attr("y", -_this.profileConstants.margin.top)
          .attr("height", _this.height + _this.profileConstants.margin.top);

        if (calcs.min || calcs.min === 0) parentView.append("line").lower()
          .attr("x1", calcs.boundaryMinX_px)
          .attr("x2", calcs.boundaryMinX_px)
          .attr("y1", -_this.profileConstants.margin.top)
          .attr("y2", _this.height);

        if (calcs.max || calcs.max === 0) parentView.append("line").lower()
          .attr("x1", calcs.boundaryMaxX_px)
          .attr("x2", calcs.boundaryMaxX_px)
          .attr("y1", -_this.profileConstants.margin.top)
          .attr("y2", _this.height);

      }).on("mouseleave", function() {
        const parentView = d3.select(this.parentNode);

        d3.select(this).attr("font-weight", null);
        parentView.selectAll("rect").remove();
        parentView.selectAll("line").remove();
      });
    }
    
  }

  zoom() {
    const mdlcfg = this.MDL.x.config;

    if (mdlcfg.zoomedMin == null && this.MDL.x.scale.domain[0] == null || mdlcfg.zoomedMax == null && this.MDL.x.scale.domain[1] == null) return;

    const x1 = this.xScale(mdlcfg.zoomedMin || this.MDL.x.scale.domain[0]);
    const x2 = this.xScale(mdlcfg.zoomedMax || this.MDL.x.scale.domain[1]);
    // if we have same x1 and x2 then divider will be 0 and rangeRation will become -Infinity
    if (!isFinite(x1) || !isFinite(x2) || x1 === x2) return;

    this.rangeRatio = this.width / (x2 - x1) * this.rangeRatio;
    this.rangeShift = (this.rangeShift - x1) / (x2 - x1) * this.width;

    this.xScale.range([this.rangeShift, this.width * this.rangeRatio + this.rangeShift]);

    this.DOM.xAxis.call(this.xAxis);
  }

  updateMasks() {
    const tailFatX = this._math.unscale(this.MDL.x.config.tailFatX);
    const tailCutX = this._math.unscale(this.MDL.x.config.tailCutX);
    const tailFade = this.MDL.x.config.tailFade;
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

  //TODO rewrite old understandings
  _isProperty(mdl){
    return mdl.data.space.length == 1 && !mdl.data.constant;
  }
  _isIndicator(mdl){
    return mdl.data.space.length > 1 && !mdl.data.constant;
  }
  _isConstant(mdl){
    return !!mdl.data.constant;
  }

  updateDoubtOpacity(opacity) {
    if (opacity == null) opacity = this.wScale(this.MDL.frame.value.getUTCFullYear());
    if (this.MDL.selectedF.any()) opacity = 1;
    this.DOM.dataWarning.style("opacity", opacity);
  }

  processFrameData() {
    
    this.atomicSliceData = this.model.dataArray
      .concat() //copy array in order to avoid sorting in place
      .filter(d => d.x && d.y && d.s)
      .map(d => {
        d.KEY = () => d[Symbol.for("key")];
        d.sortValue = [d.y || 0, 0];
        d.aggrLevel = 0;
        return d;
      });

    const groupManualSort = this.MDL.group.manualSorting;
    const isManualSortCorrect = utils.isArray(groupManualSort) && groupManualSort.length > 1;
    const sortValuesForGroups = {};

    this.groupedSliceData = d3.nest()
      .key(d => this._isProperty(this.MDL.stack)? d.stack: d.group)
      .sortValues((a, b) => b.sortValue[0] - a.sortValue[0])
      .entries(this.atomicSliceData);

    this.groupedSliceData.forEach(group => {
      let groupSortValue = 0;

      if (isManualSortCorrect)
        groupSortValue = groupManualSort.includes(group.key) ? groupManualSort.length - 1 - groupManualSort.indexOf(group.key) : -1;
      else
        groupSortValue = d3.sum(group.values.map(m => m.sortValue[0]));

      group.values.forEach(d => {
        d.sortValue[1] = groupSortValue;
      });

      sortValuesForGroups[group.key] = groupSortValue;
      group.KEY = () => group.key;
      group.aggrLevel = 1;
    });


    if (this.MDL.stack.data.constant === "none") {
      this.stackedSliceData = [];
      this.atomicSliceData.sort((a, b) => b.sortValue[0] - a.sortValue[0]);

    } else {
      this.stackedSliceData = d3.nest()
        .key(d => d.stack)
        .key(d => d.group)
        .sortKeys((a, b) => sortValuesForGroups[b] - sortValuesForGroups[a])
        .sortValues((a, b) => b.sortValue[0] - a.sortValue[0])
        .entries(this.atomicSliceData);

      this.stackedSliceData.forEach(stack => {
        stack.KEY = () => stack.key;
        stack.aggrLevel = 2;
      });

      //TODO: sorting too many times?
      this.atomicSliceData.sort((a, b) => b.sortValue[1] - a.sortValue[1]);
    }
  }

  createAndDeleteSlices() {    

    //bind the data to DOM elements
    this.mountainsMergeStacked = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel2")
      .data(this.stackedSliceData, d => d.KEY());
    this.mountainsMergeGrouped = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel1")
      .data(this.groupedSliceData, d => d.KEY());
    this.mountainsAtomic = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel0")
      .data(this.atomicSliceData), d => d.KEY();

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
    this.mountains = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain")
      .on("mousemove", (d, i) => {
        if (utils.isTouchDevice()) return;
        this._interact()._mousemove(d, i);
      })
      .on("mouseout", (d, i) => {
        if (utils.isTouchDevice()) return;
        this._interact()._mouseout(d, i);
      })
      .on("click", (d, i) => {
        if (utils.isTouchDevice()) return;
        this._interact()._click(d, i);
      })
      // .onTap((d, i) => {
      //   this._interact()._click(d, i);
      //   d3.event.stopPropagation();
      // })
      // .onLongTap(() => {
      // });
  }

  computeAllShapes() {

    //spawn the original mountains
    this.atomicSliceData.forEach((d) => {
      d.shape = this._spawnShape(d);
      d.hidden = d.shape.length === 0;
    });

    //rbh
    //this._robinhood.adjustCached();

    //recalculate shapes depending on stacking
    if (this.MDL.stack.data.constant !== "none") {
      this.stackedSliceData.forEach(stack => {
        let slicesToStack = [];
        stack.values.forEach(group => {
          slicesToStack = slicesToStack.concat(group.values.filter(f => !f.hidden));
        });
        this.stackLayout
          .keys(slicesToStack)(d3.range(this.mesh.length))
          .forEach((vertices, sliceIndex) => {
            const slice = slicesToStack[sliceIndex];
            vertices.forEach((d, i) => {
              slice.shape[i].y0 = d[0];
            });
          });
      });

      this.stackedSliceData.forEach(d => {
        const firstLast = this._getFirstAndLastSlicesInGroup(d);
        d.shape = this._getMergedShape(firstLast);
        d.y = this._sumLeafSlicesByEncoding(d, "y");
        d.color = "_default";
        d.yMax = firstLast.first.yMax;
      });
      this.groupedSliceData.forEach(d => {
        const firstLast = this._getFirstAndLastSlicesInGroup(d);
        d.shape = this._getMergedShape(firstLast);
        d.y = this._sumLeafSlicesByEncoding(d, "y");
        d.color = firstLast.first.color;
        d.yMax = firstLast.first.yMax;
      });
    }

    //push yMaxGlobal up so shapes can fit
    this.yMaxGlobal = 0;
    this.atomicSliceData.forEach(d => {
      d.yMax = d3.max(d.shape.map(m => m.y0 + m.y));
      if (this.yMaxGlobal < d.yMax) this.yMaxGlobal = d.yMax;
    });

    this._adjustMaxY();
    

    // if (!mergeStacked && !mergeGrouped && this.isProperty(this.MDL.stack)) {
    //   this.groupedSliceData.forEach(d => {
    //     const visible = d.values.filter(f => !f.hidden);
    //     d.yMax = visible[0].yMax;
    //     d.values.forEach(e => {
    //       e.yMaxGroup = d.yMax;
    //     });
    //   });
    // }


  }
  
  renderAllShapes() {
    const _this = this;
    const mergeGrouped = this.MDL.group.config.merge;
    const mergeStacked = this.MDL.stack.config.merge;
    const stackMode = this.MDL.stack.data.constant;
    //it's important to know if the chart is dragging or playing at the moment.
    //because if that is the case, the mountain chart will merge the stacked entities to save performance
    const dragOrPlay = (this._isDragging() || this.MDL.frame.playing)
      //never merge when no entities are stacked
      && stackMode !== "none";

    this.mountainsMergeStacked.each(function(d) {
      const view = d3.select(this);
      const hidden = !mergeStacked;
      _this._renderShape(view, d, hidden);
    });

    this.mountainsMergeGrouped.each(function(d) {
      const view = d3.select(this);
      const hidden = (!mergeGrouped && !dragOrPlay) || (mergeStacked && !_this.MDL.selectedF.has(d));
      _this._renderShape(view, d, hidden);
    });

    this.mountainsAtomic.each(function(d) {
      const view = d3.select(this);
      const hidden = d.hidden || ((mergeGrouped || mergeStacked || dragOrPlay) && !_this.MDL.selectedF.has(d));
      _this._renderShape(view, d, hidden);
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
        //this.mountainsAtomic.sort((a, b) => b.yMaxGroup - a.yMaxGroup);
      }
    }


    // exporting shapes for shape preloader. is needed once in a while
    // if (!this.shapes) this.shapes = {}
    // this.shapes[this.model.time.value.getUTCFullYear()] = {
    //     yMax: d3.format(".2e")(this.yMax),
    //     shape: this.cached["all"].map(function (d) {return d3.format(".2e")(d.y);})
    // }
  }

  _renderShape(view, d, hidden) {
    const stack = this.MDL.stack.which;

    view.classed("vzb-hidden", hidden);

    if (hidden) {
      //if (stack !== "none") view.style("stroke-opacity", 0);
      return;
    }

    if (this.MDL.selectedF.has(d))
      view.attr("d", this.area(d.shape.filter(f => f.y > d.y * THICKNESS_THRESHOLD)));
    else
      view.attr("d", this.area(d.shape));
    
    if (d.color)
      view.style("fill", d.color !== "_default" ? this.cScale(d.color) : this.MDL.color.palette["_default"]);
    else
      view.style("fill", COLOR_WHITEISH);

    if (stack !== "none") view
      .transition().duration(Math.random() * 900 + 100).ease(d3.easeCircle)
      .style("stroke-opacity", 0.5);

    // if (this.model.time.record) this._export.write({
    //   type: "path",
    //   id: key,
    //   time: this.model.time.value.getUTCFullYear(),
    //   fill: this.cScale(valuesPointer.color[key]),
    //   d: this.area(this.cached[key])
    // });
  }

  _getLabelText(d) {
    return Object.values(d.label).join(", ");
  }

  _interact() {
    const _this = this;

    return {
      _mousemove(d) {
        if (_this._isDragging() || _this.MDL.frame.playing) return;

        _this.MDL.highlightedF.set(d);

        //position tooltip
        _this._setTooltip(_this._getLabelText(d));
        //_this._selectlist.showCloseCross(d, true);

      },
      _mouseout(d) {
        if (_this._isDragging() || _this.MDL.frame.playing) return;

        _this._setTooltip("");
        _this.MDL.highlightedF.delete(d);
        //_this._selectlist.showCloseCross(d, false);

      },
      _click(d) {
        const isPlayingOrDragging = _this._isDragging() || _this.MDL.frame.playing;
        if (!isPlayingOrDragging || _this.MDL.selectedF.has(d)) {
          _this.MDL.selectedF.toggle(d);
        }
      }
    };

  }

  highlightSlices() {
    this.someHighlighted = this.MDL.highlightedF.any();

    //if (this.someSelected)
      //this._selectList.setHighlighted(d => this.MDL.highlightedF.has(d));
  }

  selectSlices() {
    this.someSelected = this.MDL.selectedF.any();

    //this._selectlist.rebuild();
    //this._selectlist.redraw();
    this.nonSelectedOpacityZero = false;
    this.mountains.classed("vzb-selected", d => this.MDL.selectedF.has(d));
  }

  _sumLeafSlicesByEncoding(branch, enc) {
    if (branch.values)
      return d3.sum(branch.values.map(m => this._sumLeafSlicesByEncoding(m, enc)));
    else
      return branch.enc;    
  }

  updateAllSlicesOpacity() {
    //if(!duration)duration = 0;
    this.MDL.selectedF.markers; //watch
    this.MDL.highlightedF.markers; //watch

    const OPACITY_HIGHLT = 1.0;
    const OPACITY_HIGHLT_DIM = 0.3;
    const OPACITY_SELECT = 1.0;
    const OPACITY_REGULAR = this.ui.opacityRegular;
    const OPACITY_SELECT_DIM = this.ui.opacitySelectDim;

    this.mountains.style("opacity", d => {

      if (this.someHighlighted) {
        //highlight or non-highlight
        if (this.MDL.highlightedF.has(d)) return OPACITY_HIGHLT;
      }

      if (this.someSelected) {
        //selected or non-selected
        return this.MDL.selectedF.has(d) ? OPACITY_SELECT : OPACITY_SELECT_DIM;
      }

      if (this.someHighlighted) return OPACITY_HIGHLT_DIM;

      return OPACITY_REGULAR;

    });

    

    const nonSelectedOpacityZero = this.ui.opacitySelectDim < 0.01;

    // when pointer events need update...
    if (nonSelectedOpacityZero !== this.nonSelectedOpacityZero) {
      this.mountainsAtomic.style("pointer-events", d => (!this.someSelected || !nonSelectedOpacityZero || this.MDL.selectedF.has(d)) ?
        "visible" : "none");
    }

    this.nonSelectedOpacityZero = this.ui.opacitySelectDim < 0.01;
  }



  _getFirstAndLastSlicesInGroup(group) {
    let visible = [], visible2 = [];
    let first, last;

    if (group.aggrLevel == 2) {
      visible = group.values[0].values.filter(f => !f.hidden);
      visible2 = group.values[group.values.length - 1].values.filter(f => !f.hidden);
      first = visible[0];
      last = visible2[visible2.length - 1];
    }
    if (group.aggrLevel == 1) {
      visible = group.values.filter(f => !f.hidden);
      first = visible[0];
      last = visible[visible.length - 1];
    }

    if (!visible.length || (visible2 && !visible2.length)) utils.warn("mountain chart failed to generate shapes. check the incoming data");

    return {first, last};
  }

  _getMergedShape({first, last}) {
    return this.mesh.map((m, i) => {
      return {
        x: m,
        y0: last.shape[i].y0,
        y: first.shape[i].y0 + first.shape[i].y - last.shape[i].y0
      };
    });
  }

  _spawnShape(d) {
    const norm = d.y;
    const sigma = this.ui.directSigma ?
      d.s :
      this._math.giniToSigma(d.s);
    
    const mu = this.ui.directMu ?
      d.x :
      this._math.gdpToMu(d.x, sigma);

    if (!norm || !mu || !sigma) return [];

    const distribution = [];
    let acc = 0;

    this.mesh.forEach((dX, i) => {
      distribution[i] = this._math.pdfLognormal(dX, mu, sigma);
      acc += this.spawnMask[i] * distribution[i];
    });

    const result = this.mesh.map((dX, i) => ({
      x: dX,
      y0: 0,
      y: norm * (distribution[i] * (1 - this.spawnMask[i]) + this.cosineShape[i] / this.cosineArea * acc)
    }));

    return result;
  }

  _adjustMaxY() {
    if (this.ui.yMaxMethod === "immediate") {
      if (!this.yMaxGlobal) utils.warn("Setting yMax to " + this.yMaxGlobal + ". You failed again :-/");
      this.yScale.domain([0, Math.round(this.yMaxGlobal)]);
    } else {
      if (!this.yMaxGlobal) utils.warn("Setting yMax to " + this.yMaxGlobal + ". You failed again :-/");
      this.yScale.domain([0, Math.round(this.ui.yMaxMethod)]);
    }
  }


  _isDragging(){
    const timeslider = this.parent.findChild({type: "TimeSlider"});
    return timeslider && timeslider.dragging;
  }

  _setTooltip(tooltipText) {
    if (tooltipText) {
      const mouse = d3.mouse(this.DOM.graph.node()).map(d => parseInt(d));

      //position tooltip
      this.DOM.tooltip.classed("vzb-hidden", false)
        .attr("transform", "translate(" + (mouse[0]) + "," + (mouse[1]) + ")")
        .selectAll("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text(tooltipText);

      const contentBBox = this.DOM.tooltip.select("text").node().getBBox();

      this.DOM.tooltip.select("rect")
        .attr("width", contentBBox.width + 8)
        .attr("height", contentBBox.height + 8)
        .attr("x", -contentBBox.width - 25)
        .attr("y", -contentBBox.height - 25)
        .attr("rx", contentBBox.height * 0.2)
        .attr("ry", contentBBox.height * 0.2);

      this.DOM.tooltip.selectAll("text")
        .attr("x", -contentBBox.width - 25 + ((contentBBox.width + 8) / 2))
        .attr("y", -contentBBox.height - 25 + ((contentBBox.height + 11) / 2)); // 11 is 8 for margin + 3 for strokes
      const translateX = (mouse[0] - contentBBox.width - 25) > 0 ? mouse[0] : (contentBBox.width + 25);
      const translateY = (mouse[1] - contentBBox.height - 25) > 0 ? mouse[1] : (contentBBox.height + 25);
      this.DOM.tooltip
        .attr("transform", "translate(" + translateX + "," + translateY + ")");

    } else {

      this.DOM.tooltip.classed("vzb-hidden", true);
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
  yMaxMethod: 2651276116,
  showProbeX: true,
  probeX: 1.85,
  xLogStops: [1, 2, 5],
  xPoints: 50,
  directSigma: false, //false = input is gini, true = input is standatd deviation of the distribution
  directMu: false, //false = input is GDP/capita, true = input is mean of the distribution
  preload: "income_mountains",
  preloadKey: "world"
};
