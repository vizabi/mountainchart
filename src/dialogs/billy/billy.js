import {Dialog, SimpleCheckbox, SingleHandleSlider} from "VizabiSharedComponents";
import {decorate, computed} from "mobx";

/*
 * billionaire dialog
 */
class BillyDialog extends Dialog {

  constructor(config){
    config.template = `
      <div class='vzb-dialog-modal'>
        <div class="vzb-dialog-title">
          <span data-localise="buttons/billy"></span>
        </div>
    
        <div class="vzb-dialog-content">

            <div class="vzb-billy-show"></div>
            <div class="vzb-billy-howmany"></div>
            <div class="vzb-billy-count"></div>

        </div>
      </div>
    `;
    config.subcomponents = [
      {
        type: SimpleCheckbox,
        placeholder: ".vzb-billy-show",
        options: {
          checkbox: "showBilly",
          submodel: "root.ui.chart"
        }
      },
      {
        type: SingleHandleSlider,
        placeholder: ".vzb-billy-howmany",
        options: {
          domain: [1, 5, 10, 50, 100, 500, 1000],
          snapValue: true,
          value: "howManyBilly",
          submodel: "root.ui.chart"
        }
      }
    ]

    super(config);
  }

  setup(options) {
    super.setup(options);
    const _this = this;
    this.DOM.slider = this.element.select(".vzb-billy-howmany");
    this.DOM.count = this.element.select(".vzb-billy-count");
  
  }

  get MDL() {
    return {

    };
  }  

  draw(){
    this.localise = this.services.locale.auto();
    super.draw();

    this.addReaction(this.updateView);
  }

  updateView() {
    const showBilly = this.root.ui.chart.showBilly;  
    const howMany = this.root.ui.chart.howManyBilly;  
    this.model.encoding.mu.config.scale.domain[1] = showBilly ? 100000000 : 500;
    this.DOM.slider.classed("vzb-hidden", !showBilly);
    this.DOM.count.classed("vzb-hidden", !showBilly)
      .text(Math.round(howMany));
  }

}

const decorated = decorate(BillyDialog, {
  "MDL": computed
});
Dialog.add("billy", decorated);
export { decorated as BillyDialog };
