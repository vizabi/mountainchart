import {
  BaseComponent,
  Icons,
  Utils,
  LegacyUtils as utils,
  axisSmart,
  //Exporter as svgexport,
} from "VizabiSharedComponents";

import MountainChartMath from "./mountainchart-math";
import MCDecorations from "./decorations.js";
import {MCSelectList} from "./mountainchart-selectlist";
import {MCProbe} from "./mountainchart-probe";
//import RobinHood from "./mountainchart-robinhood";

import {decorate, computed, observable, runInAction} from "mobx";

const {ICON_QUESTION} = Icons;
//const COLOR_BLACKISH = "rgb(51, 51, 51)";
const COLOR_WHITEISH = "rgb(253, 253, 253)";

const THICKNESS_THRESHOLD = 0.001;

// MOUNTAIN CHART COMPONENT
class _VizabiMountainChart extends BaseComponent {

  constructor(config) {
    config.subcomponents = [{
      name: "selectlist",
      type: MCSelectList,
      placeholder: ".vzb-mc-mountains-labels"
    },{
      name: "probe",
      type: MCProbe,
      placeholder: ".vzb-mc-probe"
    }];

    //config.name = "mountainchart";

    config.template = `
      <!-- MountainChart Component -->
      <svg class="vzb-mountainchart-svg vzb-export">
        <g class="vzb-mc-graph">
          <rect class="vzb-mc-eventarea"></rect>

          <g class="vzb-mc-mountains-mergestacked"></g>
          <g class="vzb-mc-mountains-mergegrouped"></g>
          <g class="vzb-mc-mountains"></g>

          <g class="vzb-mc-decorations">
            <g class="vzb-mc-x-axis-groups"></g>
          </g>
  
          <g class="vzb-mc-mountains-labels"></g>

          <g class="vzb-mc-title">
            <text></text>
          </g>

          <g class="vzb-mc-subtitle">
            <text></text>
          </g>

          <g class="vzb-mc-closecross">
            <text>⨯</text>
          </g>

          <g class="vzb-mc-axis-x-title">
            <text></text>
          </g>

          <g class="vzb-mc-axis-info vzb-noexport"></g>

          
          <g class="vzb-mc-axis-x"></g>
          
          <g class="vzb-mc-axis-labels"></g>
          <g class="vzb-mc-probe"></g>
          
          <g class="vzb-mc-tooltip vzb-hidden">
            <rect class="vzb-tooltip-border"></rect>
            <text class="vzb-tooltip-text"></text>
          </g>
          </g>
        <rect class="vzb-mc-forecastoverlay vzb-hidden" x="0" y="0" width="100%" height="100%" fill="url(#vzb-mc-pattern-lines-${config.id})" pointer-events='none'></rect>
        <g class="vzb-datawarning-button vzb-noexport"></g>
      </svg>
      <svg>
        <defs>
          <pattern id="vzb-mc-pattern-lines-${config.id}" x="0" y="0" patternUnits="userSpaceOnUse" width="50" height="50" viewBox="0 0 10 10"> 
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
      yTitle: this.element.select(".vzb-mc-title"),
      ySubtitle: this.element.select(".vzb-mc-subtitle"),
      closeCross: this.element.select(".vzb-mc-closecross"),
      info: this.element.select(".vzb-mc-axis-info"),
      mountainMergeStackedContainer: this.element.select(".vzb-mc-mountains-mergestacked"),
      mountainMergeGroupedContainer: this.element.select(".vzb-mc-mountains-mergegrouped"),
      mountainAtomicContainer: this.element.select(".vzb-mc-mountains"),
      tooltip: this.element.select(".vzb-mc-tooltip"),
      eventArea: this.element.select(".vzb-mc-eventarea"),
      forecastOverlay: this.element.select(".vzb-mc-forecastoverlay"),
      decorations: this.element.select(".vzb-mc-decorations"),
      xAxisGroups: this.element.select(".vzb-mc-x-axis-groups")
    };

    this._selectlist = this.findChild({name: "selectlist"});
    this._probe = this.findChild({name: "probe"});
    
    // this.element.onTap((event, d) => {
      //   this._interact()._mouseout(event, d);
      // });
      
    this.decorations = new MCDecorations(this);
    this._math = new MountainChartMath(this);
    //this._export = new Exporter(this);
    //this._export
    //  .prefix("vzb-mc-")
    //  .deleteClasses(["vzb-mc-mountains-mergestacked", "vzb-mc-mountains-mergegrouped", "vzb-mc-mountains", "vzb-mc-date", "vzb-mc-mountains-labels", "vzb-mc-axis-labels"]);
    //this._robinhood = new RobinHood(this);

    // define path generator
    this.area = d3.area()
      .x(d => this.xScale(d.x))
      .y0(d => this.yScale(d.y0))
      .y1(d => this.yScale(d.y0 + d.y));

    //define d3 stack layout
    this.stackLayout = d3.stack()
      .order(d3.stackOrderReverse)
      .value((i, slice) => slice.shape[i].y);

    this.xAxis = axisSmart("bottom");

    this.rangeRatio = 1;
    this.rangeShift = 0;
    this.mesh = [];
    this.stickySortValues = {};
    this.yMaxGlobal = 0;
  }

  get MDL(){
    return {
      frame: this.model.encoding.frame,
      selectedF: this.model.encoding.selected.data.filter,
      highlightedF: this.model.encoding.highlighted.data.filter,
      //superHighlightedF: this.model.encoding.superhighlighted.data.filter,
      mu: this.model.encoding[this.state.alias.mu || "mu"],
      shapedata: this.model.encoding[this.state.alias.shapedata || "shapedata"],
      color: this.model.encoding[this.state.alias.color || "color"],
      label: this.model.encoding.label,
      stack: this.model.encoding.stack,
      group: this.model.encoding.group
    };
  }

  get isInFacet(){
    return this.parent.constructor.name === "_Facet";
  }

  get isManyFacets(){
    return this.isInFacet && this.parent.howManyFacets() > 1;
  }

  get duration(){
    //smooth animation is needed when playing, except for the case when time jumps from end to start
    if(!this.MDL.frame || !this.MDL.frame.playing) return 0;
    this.frameValue_1 = this.frameValue;
    this.frameValue = this.MDL.frame.value;
    return this.frameValue > this.frameValue_1 ? this.MDL.frame.speed : 0;
  }

  draw() {

    this.localise = this.services.locale.auto(this.MDL.frame.interval);
    this._dataNotes = this.root.findChild({name: "datanotes"});

    if (this.updateLayoutProfile()) return; //return if exists with error
    this.addReaction(this.updateCurveMethod);
    this.addReaction(this.updateGroupEncoding);
    this.addReaction(this.updateHeaderAndFooter);
    this.addReaction(this.drawForecastOverlay);
    this.addReaction(this.updateMathSettings);
    this.addReaction(this.updateSize);
    this.addReaction(this.updateMesh);
    this.addReaction(this.zoom);
    //this.addReaction(this.updateMasks);
    this.addReaction(this.drawData);
    this.addReaction(this.updateSelected);
    this.addReaction(this.updateAllSlicesOpacity);
    this.addReaction(this.updateDecorations);
    this.addReaction(this.updateProbe);
  }

  drawData() {
    this.services.layout.size; //watch

    this.processFrameData();
    this.computeAllShapes();
    this.createAndDeleteSlices();
    this.renderAllShapes();
  }

  updateProbe(){
    this._probe.redraw();
  }

  updateCurveMethod(){
    this.area.curve(d3[this.ui.curve]);
  }

  updateGroupEncoding(){
    if (this.MDL.color.scale.isDiscrete()) {
      runInAction(() => {
        this.MDL.group.data.config.concept = this.MDL.color.data.config.concept;
        this.MDL.group.data.config.source = this.MDL.color.data.config.source;
        this.MDL.group.data.config.space = this.MDL.color.data.config.space;
      });
    }
  }

  updateLayoutProfile(){
    this.services.layout.size; //watch

    this.profileConstants = this.services.layout.getProfileConstants(PROFILE_CONSTANTS, PROFILE_CONSTANTS_FOR_PROJECTOR, this.state.positionInFacet);
    this.height = this.element.node().clientHeight || 0;
    this.width = this.element.node().clientWidth || 0;

    if (!this.height || !this.width) return utils.warn("Chart _updateProfile() abort: container is too little or has display:none");
  }

  updateHeaderAndFooter() {
    const _this = this;

    this.DOM.xTitle.select("text")
      .text(this.localise("unit/mountainchart_hardcoded_income_per_day"));

    this.DOM.yTitle.select("text")
      .text(this.localise("mount/title"));

    //if a mountain is alone on the chart: spell out its name
    this.DOM.ySubtitle
      .classed("vzb-hidden", !this.isManyFacets)
      .select("text")
      .text(
        this.atomicSliceData.length > 1
          ? this.name.includes("is--")
            ? this.model.data.source.getConcept(this.name.replace("is--",""))?.name 
            : this.name
          : this._getLabelText(this.atomicSliceData[0])
      );

    this.DOM.closeCross
      .classed("vzb-hidden", !this.isManyFacets || this.atomicSliceData.length > 1)
      .on("mouseover", () => {
        this.element.classed("vzb-chart-removepreview", true);
      })
      .on("mouseout", () => {
        this.element.classed("vzb-chart-removepreview", false);
      })
      .on("click", () => {
        this.model.data.filter.delete(this.atomicSliceData[0]);
      });

    utils.setIcon(this.DOM.info, ICON_QUESTION).select("svg").attr("width", "0px").attr("height", "0px");

    this.DOM.info.on("click", () => {
      this._dataNotes.pin();
    });
    this.DOM.info.on("mouseover", function() {
      const rect = this.getBBox();
      const coord = utils.makeAbsoluteContext(this, this.farthestViewportElement)(rect.x - 10, rect.y + rect.height + 10);
      const toolRect = _this.root.element.node().getBoundingClientRect();
      const chartRect = _this.element.node().getBoundingClientRect();
      _this._dataNotes.setEncoding(_this.MDL.norm).show().setPos(coord.x + chartRect.left - toolRect.left, coord.y);
    });
    this.DOM.info.on("mouseout", () => {
      _this._dataNotes.hide();
    });

    this.DOM.eventArea
      .on("mousemove", function(event) {
        if (_this._isDragging()) return;
        if (!_this.ui.showProbeX) return;

        _this.runHereOrPossiblyInAllFacets(function(context){
          context._probe.redraw({
            level: _this.xScale.invert(d3.pointer(event)[0]),
            full: true
          });
        })
      })
      .on("mouseout", () => {
        if (this._isDragging()) return;
        if (!this.ui.showProbeX) return;

        _this.runHereOrPossiblyInAllFacets(function(context){
          context._probe.redraw();
        })
      });
  }

  runHereOrPossiblyInAllFacets(func){
    if (this.isInFacet)
      this.parent.propagateInteractivity(func);
    else
      func(this);
  }

  //fetch scales, or rebuild scales if there are none, then fetch
  get yScale() {return this.MDL.shapedata.scale.d3Scale.copy()};
  get xScale() {return this.MDL.mu.scale.d3Scale.copy()};

  drawForecastOverlay() {
    this.DOM.forecastOverlay.classed("vzb-hidden", 
      !this.ui.showForecast || 
      !this.ui.showForecastOverlay || 
      !this.ui.endBeforeForecast || 
      (this.MDL.frame.value <= this.MDL.frame.parseValue(this.ui.endBeforeForecast))
    );
  }

  updateMathSettings(){
    this._math.xScaleFactor = this.MDL.mu.config.xScaleFactor;
    this._math.xScaleShift = this.MDL.mu.config.xScaleShift;
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

    //update scales to the new range
    if(this.isInFacet && this.parent.scaleDomainRange.domain)
      this.yScale.range([height, height - this.parent.scaleDomainRange.range]);
    else
      this.yScale.range([height, 0]);

    this.xScale.range([this.rangeShift, width * this.rangeRatio + this.rangeShift]);

    //axis is updated
    this.xAxis.scale(this.xScale)
      .tickSizeOuter(0)
      .tickPadding(9)
      .tickSizeMinor(3, 0)
      .labelerOptions({
        scaleType: this.MDL.mu.scale.type || "log",
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
      .attr("transform", "translate(" + (width - (this.DOM.closeCross.classed("vzb-hidden") ? 0 : 20)) + "," + height + ")")
      .attr("dy", "-0.36em");

    this.DOM.yTitle
      .style("font-size", infoElHeight + "px")
      .attr("transform", "translate(" + (isRTL ? width : 0) + "," + margin.top + ")");

    this.DOM.ySubtitle
      .style("font-size", infoElHeight + "px")
      .attr("transform", "translate(" + (isRTL ? width : 0) + "," + height + ")")
      .select("text")
      .attr("dy", "-0.36em");

    this.DOM.closeCross
      .style("font-size", infoElHeight + "px")
      .attr("transform", "translate(" + (isRTL ? 0 : width) + "," + height + ")")
      .select("text")
      .attr("dy", "-0.36em");

    this.DOM.xAxisGroups
      .style("font-size", infoElHeight * 0.8 + "px");

    const titleBBox = this.DOM.yTitle.node().getBBox();
    const t = utils.transform(this.DOM.yTitle.node());

    if (this.DOM.info.select("svg").node()) {
      const hTranslate = isRTL ? (titleBBox.x + t.translateX - infoElHeight * 1.4) : (titleBBox.x + t.translateX + titleBBox.width + infoElHeight * 0.4);

      this.DOM.info.select("svg")
        .attr("width", infoElHeight + "px")
        .attr("height", infoElHeight + "px");
      this.DOM.info.attr("transform", "translate("
        + hTranslate + ","
        + (t.translateY - infoElHeight * 0.8) + ")");
    }

    this.root.findChild({type: "_DataWarning"}).setOptions({
      width: this.width,
      height: this.height,
      vertical: "top", 
      horizontal: isRTL ? "right" : "left",
      left: margin.left,
      right: margin.right,
      top: margin.top + t.translateY + infoElHeight/2,
      wLimit: this.width - titleBBox.width - infoElHeight * 2
    });

    this.DOM.eventArea
      .attr("y", height)
      .attr("width", width)
      .attr("height", margin.bottom);
  }

  updateMesh(){
    // this.mesh = this._math.generateMesh(
    //   this.ui.xPoints, 
    //   this.MDL.mu.scale.type || "log", 
    //   this.xScale.domain()
    // );
    const start = this.ui.xStart;
    const end = this.ui.xEnd;
    const nbrackets = this.ui.xPoints;
    const step = Math.pow(end/start, 1/nbrackets);

    this.mesh = d3.range(nbrackets).map(m => start * Math.pow(step, m + 0.5) );
    
    //rbh
    //this._robinhood.findMeshIndexes(this.mesh);
  }

  updateDecorations(){
    this.services.layout.size;
    this.MDL.mu.config;
    this.decorations.update.bind(this)(this.duration);
  }

  zoom() {
    const mdlcfg = this.MDL.mu.config;
    const {
      margin,
    } = this.profileConstants;
    const width = this.width - margin.left - margin.right;

    if (mdlcfg.zoomedMin == null && this.MDL.mu.scale.domain[0] == null || mdlcfg.zoomedMax == null && this.MDL.mu.scale.domain[1] == null) return;

    const x1 = this.xScale(mdlcfg.zoomedMin || this.MDL.mu.scale.domain[0]);
    const x2 = this.xScale(mdlcfg.zoomedMax || this.MDL.mu.scale.domain[1]);
    // if we have same x1 and x2 then divider will be 0 and rangeRation will become -Infinity
    if (!isFinite(x1) || !isFinite(x2) || x1 === x2) return;

    this.rangeRatio = width / (x2 - x1) * this.rangeRatio;
    this.rangeShift = (this.rangeShift - x1) / (x2 - x1) * width;

    this.xScale.range([this.rangeShift, width * this.rangeRatio + this.rangeShift]);

    this.DOM.xAxis.call(this.xAxis);
  }

  updateMasks() {
    const tailFatX = this._math.unscale(this.MDL.mu.config.tailFatX);
    const tailCutX = this._math.unscale(this.MDL.mu.config.tailCutX);
    const tailFade = this.MDL.mu.config.tailFade;
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
    return mdl.data.space && mdl.data.space.length == 1 && !mdl.data.constant && mdl.data.concept != this.MDL.frame.data.concept;
  }

  _getDataArrayForFacet(){
    if(this.isInFacet)
      return this.parent.getDataForSubcomponent(this.name);
    else
      return this.model.dataArray;
  }

  get atomicSliceData(){
    return this._getDataArrayForFacet()
      .concat() //copy array in order to avoid sorting in place
      .filter(d => d[this._alias("shapedata")] || d[this._alias("mu")] && d[this._alias("norm")] && d[this._alias("sigma")])
      .map(d => {
        d.KEY = () => d[Symbol.for("key")];
        if(typeof d.shapedata === "string"){
          d.distribution = d.shapedata.split(",").map(m => +m);
          d.norm = d3.sum(d.distribution);
        }
        if (this.stickySortValues[d.KEY()] == null) this.stickySortValues[d.KEY()] = d[this._alias("norm")];
        d.sortValue = [this.stickySortValues[d.KEY()] || 0, 0];
        d.aggrLevel = 0;
        return d;
      })
      //1-st level sort: pre-sort atomic slices, this sort will be retained in grouping and stacking
      .sort((a, b) => b.sortValue[0] - a.sortValue[0]);
  }

  get groupedSliceData() {
    const groupManualSort = this.MDL.group.config.manualSorting;
    const isManualSortCorrect = utils.isArray(groupManualSort) && groupManualSort.length > 1;
    this.sortValuesForGroups = {};

    return d3.groups(this.atomicSliceData, d => this._isProperty(this.MDL.stack)? d.stack: d.group)
      //the output comes in a form of [[key, values[]],[],[]], convert each array to object
      .map(([key, values]) => ({key, values}))
      .map(group => {
        let groupSortValue = 0;

        if (isManualSortCorrect)
          groupSortValue = groupManualSort.includes(group.key) ? groupManualSort.length - 1 - groupManualSort.indexOf(group.key) : -1;
        else
          groupSortValue = d3.sum(group.values.map(m => m.sortValue[0]));

        group.values.forEach(d => {
          d.sortValue[1] = groupSortValue;
        });

        this.sortValuesForGroups[group.key] = groupSortValue;
        group[Symbol.for("key")] = group.key;
        group.KEY = () => group.key;
        group.aggrLevel = 1;

        return group;
      });
  }

  get stackedSliceData() {

    if (this.MDL.stack.data.constant === "none") {
      return [];

    } else {
      return d3.groups(this.atomicSliceData, d => d.stack, d => d.group)
        //the output comes in a form of [[key, values[]],[],[]], convert each array to object, do that for both layers
        .map(([key, values])=>({key, values: values.map(([key, values])=>({key, values}))}))
        .map(stack => {
          //groups are sorted inside a stack
          stack.values.sort((a, b) => this.sortValuesForGroups[b.key] - this.sortValuesForGroups[a.key]);
          stack[Symbol.for("key")] = stack.key;
          stack.KEY = () => stack.key;
          stack.aggrLevel = 2;

          return stack;
        });
    }
  }

  processFrameData() {
    this.atomicSliceData;
    this.groupedSliceData;
    this.stackedSliceData;

    //2-nd level sort: atomic slices are sorted by groups
    this.atomicSliceData.sort((a, b) => b.sortValue[1] - a.sortValue[1]);
  }

  createAndDeleteSlices() {    

    //bind the data to DOM elements
    this.mountainsMergeStacked = this.DOM.mountainAtomicContainer
      .selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel2")
      .data(this.stackedSliceData, d => d.KEY());
    this.mountainsMergeGrouped = this.DOM.mountainAtomicContainer
      .selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel1")
      .data(this.groupedSliceData, d => d.KEY());
    this.mountainsAtomic = this.DOM.mountainAtomicContainer
      .selectAll(".vzb-mc-mountain.vzb-mc-aggrlevel0")
      .data(this.atomicSliceData, d => d.KEY());

    this.mountainsMergeStacked = this.mountainsMergeStacked.join(
      enter => enter.append("path")
        .attr("class", "vzb-mc-mountain vzb-mc-aggrlevel2")
        .attr("id", d => `vzb-mc-slice-${d.KEY()}-${this.id}`)
        .call(this._interact.bind(this))
    );
    this.mountainsMergeGrouped = this.mountainsMergeGrouped.join(
      enter => enter.append("path")
        .attr("class", "vzb-mc-mountain vzb-mc-aggrlevel1")
        .attr("id", d => `vzb-mc-slice-${d.KEY()}-${this.id}`)
        .call(this._interact.bind(this))
    );
    this.mountainsAtomic = this.mountainsAtomic.join(
      enter => enter.append("path")
        .attr("class", "vzb-mc-mountain vzb-mc-aggrlevel0")
        .attr("id", d => `vzb-mc-slice-${d.KEY()}-${this.id}`)
        .call(this._interact.bind(this))
    );

    this.mountains = this.DOM.mountainAtomicContainer.selectAll(".vzb-mc-mountain")
      .order();
  }

  computeAllShapes() {
    const stackMode = this.MDL.stack.data.constant;

    //spawn the original mountains
    this.atomicSliceData.forEach((d) => {
      d.shape = this._spawnShape(d);
      d.hidden = d.shape.length === 0;
    });

    //rbh
    //this._robinhood.adjustCached();

    //recalculate shapes depending on stacking: shift baseline y0 of each shape
    if (stackMode !== "none") {
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
    }

    //save yMax of each slice, stacked or not
    this.atomicSliceData.forEach(d => {
      d.yMax = d3.max(d.shape.map(m => m.y0 + m.y));
    });

    //recalcuate the merge-stacking slice shape
    if (stackMode == "all") {
      this.stackedSliceData.forEach(d => {
        const firstLast = this._getFirstAndLastSlicesInGroup(d);
        d.shape = this._getMergedShape(firstLast);
        d[this._alias("norm")] = this._sumLeafSlicesByEncoding(d, this._alias("norm"));
        d[this._alias("color")] = "_default";
        d.yMax = firstLast.first.yMax;
      });
    }

    //recalculate the merge-grouping slice shapes
    if (stackMode !== "none") {
      this.groupedSliceData.forEach(d => {
        const firstLast = this._getFirstAndLastSlicesInGroup(d);
        d.shape = this._getMergedShape(firstLast);
        d[this._alias("norm")] = this._sumLeafSlicesByEncoding(d, this._alias("norm"));
        d[this._alias("color")] = firstLast.first[this._alias("color")];
        d.yMax = firstLast.first.yMax;
        d.values.forEach(v => v.yMaxGroup = d.yMax);
      });
    }

    //push yMaxGlobal up so shapes can fit
    this.atomicSliceData.forEach(d => {
      if (this.yMaxGlobal < d.yMax) this.yMaxGlobal = d.yMax;
      if (this.yMaxGlobal < this.ui.yMaxMethod) this.yMaxGlobal = this.ui.yMaxMethod;
    });

    this._adjustMaxY();

    //sort slices again: this time to order DOM-elements correctly
    if (stackMode === "none") {
      //reorder slices to put the tallest in the back (only now we know yMax, couldn't do this earlier)
      this.atomicSliceData.sort((a, b) => b.yMax - a.yMax);
    } else if (stackMode === "all") {
      //do nothing, retain the DOM order of slices and groups
    } else {
      //reorder merged group slices or atomic shapes to put the tallest in the back
      if (this._isMergingGroups())
        this.groupedSliceData.sort((a, b) => b.yMax - a.yMax);
      else
        this.atomicSliceData.sort((a, b) => b.yMaxGroup - a.yMaxGroup);
    }
  }
  
  renderAllShapes() {
    const _this = this;
    const mergeStacked = this.MDL.stack.config.merge;
    const mergeGrouped = this._isMergingGroups();

    this.mountainsMergeStacked.each(function(d) {
      const view = d3.select(this);
      const hidden = !mergeStacked;
      const selected = false;
      _this._renderShape(view, d, hidden, selected);
    });

    this.mountainsMergeGrouped.each(function(d) {
      const view = d3.select(this);
      const selected = _this.MDL.selectedF.has(d);
      const hidden = !mergeGrouped || (mergeStacked && !selected);
      _this._renderShape(view, d, hidden, selected);
    });

    this.mountainsAtomic.each(function(d) {
      const view = d3.select(this);
      const selected = _this.MDL.selectedF.has(d);
      const hidden = d.hidden || (mergeGrouped || mergeStacked) && !selected;
      _this._renderShape(view, d, hidden, selected);
    });

    // exporting shapes for shape preloader. is needed once in a while
    // if (!this.shapes) this.shapes = {}
    // this.shapes[this.model.time.value.getUTCFullYear()] = {
    //     yMax: d3.format(".2e")(this.yMax),
    //     shape: this.cached["all"].map(function (d) {return d3.format(".2e")(d[this._alias("norm")]);})
    // }
  }

  _renderShape(view, d, hidden, selected) {
    view.classed("vzb-hidden", hidden);

    if (hidden) return;

    const transition = this.duration 
      ? view.transition().duration(this.duration).ease(d3.easeLinear) 
      : view.interrupt();

    if (selected)
      //filter by thickness to avoid stroke of any selected shape cover the entire axis
      transition.attr("d", this.area(d.shape.filter(f => f.y > d[this._alias("norm")] * THICKNESS_THRESHOLD)));
    else        
      transition.attr("d", this.area(d.shape));

    const color = d[this._alias("color")];
    transition.style("fill", this.MDL.color.scale.d3Scale(color || d[Symbol.for("key")] ));
    //transition.style("fill", COLOR_WHITEISH);

    //fancy appear of the slices that were hidden
    if (!this._isDragging() && !this.MDL.frame.playing && this.MDL.stack.data.constant !== "none" && !selected) {
      view
        .style("stroke-opacity", 0)
        .transition().duration(Math.random() * 900 + 100).ease(d3.easeCircle)
        .style("stroke-opacity", 0.5);
    }

    // if (this.model.time.record) this._export.write({
    //   type: "path",
    //   id: key,
    //   time: this.model.time.value.getUTCFullYear(),
    //   fill: this.MDL.color.scale.d3Scale(valuesPointer.color[key]),
    //   d: this.area(this.cached[key])
    // });
  }

  _getLabelText(d) {
    if(d.aggrLevel == 2)
      return this.localise("mount/stacking/world") || d.key;
    if(d.aggrLevel == 1) {
      //TODO: is there a better way?
      const legend = this.root.model.markers.legend;
      if (!legend) return d.key;
      const legendItem = legend.dataArray.find(f => f[this.MDL.group.data.concept] == d.key) || {};      
      return legendItem.name || d.key;
    }
    if (typeof d.label == "object") 
      return Object.entries(d.label)
        .filter(entry => entry[0] != this.MDL.frame.data.concept)
        .map(entry => utils.isNumber(entry[1]) ? (entry[0] + ": " + entry[1]) : entry[1])
        .join(", ");
    if (d.label != null) return "" + d.label;
    return d[Symbol.for("key")];
  }

  _interact(selection){
    selection
      .on("mousemove", (event, d) => {
        if (utils.isTouchDevice()) return;
        if (this._isDragging() || this.MDL.frame.playing) return;
        this.MDL.highlightedF.set(d);
        this._setTooltip(event, this._getLabelText(d));
      })
      .on("mouseout", (event, d) => {
        if (utils.isTouchDevice()) return;
        if (this._isDragging() || this.MDL.frame.playing) return;
        this._setTooltip();
        this.MDL.highlightedF.delete(d);
      })
      .on("click", (event, d) => {
        if (utils.isTouchDevice()) return;
        if (this._isDragging() || this.MDL.frame.playing) return;
        this.MDL.selectedF.toggle(d);
      })
      .onTap((event, d) => {
        if (this._isDragging() || this.MDL.frame.playing) return;
        this.MDL.selectedF.toggle(d);
        event.stopPropagation();
      });
  }

  updateSelected() {
    this.MDL.selectedF.markers; //watch
    this.someSelected = this.MDL.selectedF.any();

    this.nonSelectedOpacityZero = false;
    this.mountains.classed("vzb-selected", d => this.MDL.selectedF.has(d));
  }

  _sumLeafSlicesByEncoding(branch, enc) {
    if (branch.values)
      return d3.sum(branch.values.map(m => this._sumLeafSlicesByEncoding(m, enc)));
    else
      return branch[enc];    
  }

  updateAllSlicesOpacity() {
    this.MDL.selectedF.markers; //watch
    this.MDL.highlightedF.markers; //watch

    const OPACITY_HIGHLT = 1.0;
    const OPACITY_HIGHLT_DIM = 0.3;
    const OPACITY_SELECT = 1.0;
    const OPACITY_REGULAR = this.ui.opacityRegular;
    const OPACITY_SELECT_DIM = this.ui.opacitySelectDim;

    this.someHighlighted = this.MDL.highlightedF.any();

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
      this.mountainsAtomic.style("pointer-events", d => {
        if (!this.someSelected || !nonSelectedOpacityZero || this.MDL.selectedF.has(d)) 
          return "visible";
        else
          return "none";
      });
    }

    this.nonSelectedOpacityZero = nonSelectedOpacityZero;
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

    if (!first || !last) utils.warn("mountain chart failed to generate shapes. check the incoming data");

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
    //in case of the direct shapes the distribution is already known
    if(d.distribution) return this.mesh.map((dX, i) => ({
      x: dX,
      y0: 0,
      y: d.distribution[i]
    }));

    const norm = d[this._alias("norm")];
    const sigma = this.ui.directSigma ?
      d[this._alias("sigma")] :
      this._math.giniToSigma(d[this._alias("sigma")]);
    
    const mu = this.ui.directMu ?
      d[this._alias("mu")] :
      this._math.gdpToMu(d[this._alias("mu")], sigma);

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
    if(this.isInFacet && this.parent.scaleDomainRange.domain)
      this.yScale.domain([0, this.parent.scaleDomainRange.domain]);
    else
      this.yScale.domain([0, Math.round(this.yMaxGlobal)]);
  }

  _isMergingGroups() {
    return this.MDL.group.config.merge
      //merge the grouped entities to save performance during dragging or playing      
      //except when stacking is off
      || (this._isDragging() || this.MDL.frame.playing) && this.MDL.stack.data.constant !== "none";
  }

  _isDragging(){
    const timeslider = this.root.findChild({type: "TimeSlider"});
    return timeslider && timeslider.ui.dragging;
  }

  _setTooltip(event, tooltipText) {
    if (tooltipText) {
      const mouse = d3.pointer(event);

      //position tooltip
      this.DOM.tooltip.classed("vzb-hidden", false)
        .attr("transform", "translate(" + (mouse[0]) + "," + (mouse[1]) + ")")
        .selectAll("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
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

  _alias(enc) {
    return this.state.alias[enc] || enc;
  }

}

const PROFILE_CONSTANTS = _VizabiMountainChart.PROFILE_CONSTANTS = {
  SMALL: {
    margin: { top: 10, right: 10, left: 10, bottom: 18 },
    infoElHeight: 16,
    minHeight: 35
  },
  MEDIUM: {
    margin: { top: 20, right: 20, left: 20, bottom: 30 },
    infoElHeight: 20,
    minHeight: 45
  },
  LARGE: {
    margin: { top: 30, right: 30, left: 30, bottom: 35 },
    infoElHeight: 22,
    minHeight: 55
  }
};

const PROFILE_CONSTANTS_FOR_PROJECTOR = _VizabiMountainChart.PROFILE_CONSTANTS_FOR_PROJECTOR = {
  MEDIUM: {
    margin: { top: 20, right: 20, left: 20, bottom: 50 },
    infoElHeight: 26,
    minHeight: 55
  },
  LARGE: {
    margin: { top: 30, right: 30, left: 30, bottom: 50 },
    infoElHeight: 32,
    minHeight: 100
  }
};

_VizabiMountainChart.DEFAULT_UI = {
  //TODO: why must forecast options be in page config for speed dialog to work
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
  curve: "curveNatural", //curveBasis curveLinear curveMonotoneX curveCatmullRom curveNatural
  manualSortingEnabled: true,
  yMaxMethod: 0,
  showProbeX: true,
  probeX: 1.85,
  probeXCustom: 4,
  probeXType: "extreme",
  probeXDetails: {
    belowProc: true,
    belowCount: false,
    aboveProc: false,
    aboveCount: false
  },
  xLogStops: [1, 2, 5],
  xPoints: 50,
  xStart: 0.0078125,
  xEnd: 8192.0,
  directSigma: false, //false = input is gini, true = input is standatd deviation of the distribution
  directMu: false, //false = input is GDP/capita, true = input is mean of the distribution
  preload: "income_mountains",
  preloadKey: "world"
};


export const VizabiMountainChart = decorate(_VizabiMountainChart, {
  "MDL": computed,
  "isInFacet": computed,
  "isManyFacets": computed,
  "duration": computed,
  "atomicSliceData": computed,
  "groupedSliceData": computed,
  "stackedSliceData": computed,
  "xScale": computed,
  "yScale": computed,
  "incomeBrackets": observable
});