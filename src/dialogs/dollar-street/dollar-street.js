import {Dialog, SimpleCheckbox, SingleHandleSlider} from "VizabiSharedComponents";
import {decorate, computed, runInAction} from "mobx";

/*
 * Dollar Street dialog
 */
class DollarStreetDialog extends Dialog {

  constructor(config){
    config.template = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title">
          <span data-localise="buttons/dollarstreet"></span>
        </div>
    
        <div class="vzb-dialog-content">

            <div class="vzb-ds-show"></div>
            <select class="vzb-ds-topic" name="vzb-ds-topic" id="vzb-ds-topic">
                <option value="families">families</option>
                <option value="homes">homes</option>
                <option value="pets">pets</option>
                <option value="beds">beds</option>
                <option value="toilets">toilets</option>
            </select>
            <div class="vzb-ds-howmany"></div>
            <div class="vzb-ds-count"></div>

        </div>
      </div>
    `;
    config.subcomponents = [
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-ds-show",
        options: {
          checkbox: "dollarstreet",
          submodel: "root.ui.chart"
        }
      },
      {
        type: SingleHandleSlider,
        placeholder: ".vzb-ds-howmany",
        options: {
          domain: [4, 6, 8, 10, 12, 25, 50, 100, 150, 200, 250],
          snapValue: true,
          value: "dsHowManyHomes",
          submodel: "root.ui.chart"
        }
      }
    ];

    super(config);
  }

  setup(options) {    
    super.setup(options);
    const _this = this;
    this.DOM.checkbox = this.element.select(".vzb-ds-show");
    this.DOM.slider = this.element.select(".vzb-ds-howmany");
    this.DOM.topic = this.element.select(".vzb-ds-topic")
      .on("change", function(){ _this.root.ui.chart.dsTopic = d3.select(this).property("value"); });
    this.DOM.count = this.element.select(".vzb-ds-count");

    this.defaultHowManyHomes = this.root.ui.chart.dsHowManyHomes;
  }

  get MDL() {
    return {

    };
  }  

  draw(){
    this.localise = this.services.locale.auto();
    super.draw();

    this.addReaction(this.updateVisibility);
    this.addReaction(this.updateCount);
    this.addReaction(this.setModel);
  }

  setModel(){
    const show = this.root.ui.chart.dollarstreet;  
    runInAction(() => {

      //for cleaning URL state
      if (!show){
        this.root.ui.chart.dsHowManyHomes = this.defaultHowManyHomes;
      }
    });
  }

  updateVisibility() {
    const show = this.root.ui.chart.dollarstreet;  
    this.DOM.slider.classed("vzb-hidden", !show);
    this.DOM.count.classed("vzb-hidden", !show);
    this.DOM.topic.classed("vzb-hidden", !show);
    this.DOM.checkbox.style("flex-basis", !show ? "240px" : "90px");
    this.findChild({type: "SingleHandleSlider"})._updateSize();
    this.findChild({type: "SingleHandleSlider"})._updateView();
  }

  updateCount(){
    const show = this.root.ui.chart.dollarstreet; 
    const howMany = this.root.ui.chart.dsHowManyHomes;
    if(show) this.DOM.count.text(Math.round(howMany));

    this.children[0].options.labelText = show ? "ds/show" : null;
    this.children[0]._updateView();

    this.DOM.topic.property("value", this.root.ui.chart.dsTopic);
  }

}

const decorated = decorate(DollarStreetDialog, {
  "MDL": computed
});
Dialog.add("dollarstreet", decorated);
export { decorated as DollarStreetDialog };
