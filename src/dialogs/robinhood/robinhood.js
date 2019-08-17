/*
 * RobinHood dialog
 */

const RobinHood = Vizabi.Component.get("_dialog").extend("robinhood", {

  /**
   * Initializes the dialog component
   * @param config component configuration
   * @param context component context (parent)
   */
  init(config, parent) {
    this.name = "robinhood";
    const _this = this;

    this.model_binds = {
      "change:ui.chart.robinhood.enable": function() {
        _this.updateView();
      },
      "change:ui.chart.robinhood.xTax": function() {
        _this.updateView();
      },
      "change:ui.chart.robinhood.yTax": function() {
        _this.updateView();
      },
    };

    this.components = [{
      component: Vizabi.Component.get("simplecheckbox"),
      placeholder: ".vzb-rbh-enable-container",
      model: ["ui.chart.robinhood", "locale"],
      checkbox: "enabled",
      prefix: "rbh"
    }];

    this._super(config, parent);
    this.template = require("./robinhood.html");
  },

  readyOnce() {
    this._super();

    const _this = this;

    this.enable = this.element.select(".vzb-rbh-enable-check")
      .on("change", function() {
        _this.setModel("enable", d3.select(this).property("checked"));
      });

    this.xTax = this.element.select(".vzb-rbh-xtax-field")
      .on("change", function() {
        _this.setModel("xTax", d3.select(this).node().value.split(","));
      });

    this.yTax = this.element.select(".vzb-rbh-ytax-field")
      .on("change", function() {
        _this.setModel("yTax", d3.select(this).node().value.split(","));
      });

    this.updateView();

  },

  updateView() {
    const _this = this;

    this.enable.property("checked", this.model.ui.chart.robinhood.enable);
    this.xTax.property("value", this.model.ui.chart.robinhood.xTax.join(","));
    this.yTax.property("value", this.model.ui.chart.robinhood.yTax.join(","));
  },

  setModel(what, value) {
    let result = value;

    // if (what == "") {
    //   result = value;
    // }

    this.model.ui.chart.robinhood[what] = result;
  }
});

export default RobinHood;
